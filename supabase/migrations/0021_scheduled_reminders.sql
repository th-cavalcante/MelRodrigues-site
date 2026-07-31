-- Envio automático de verdade pra lembretes baseados em "X horas antes do
-- agendamento" — até aqui só a confirmação (via mp-webhook) disparava
-- sozinha. Adiciona os campos necessários pra configurar/ativar isso por
-- automação, uma tabela de controle pra não mandar duas vezes, a função
-- que encontra os agendamentos "vencidos", e o agendamento via pg_cron
-- que chama a Edge Function a cada 15 minutos.

alter table public.message_templates
  add column if not exists description text not null default '',
  add column if not exists hours_before int,
  add column if not exists active boolean not null default true,
  add column if not exists is_custom boolean not null default false;

update public.message_templates set
  description = 'Envia confirmação por WhatsApp assim que o pagamento do sinal é aprovado.'
  where key = 'booking_confirmed';
update public.message_templates set
  description = 'Lembrete enviado automaticamente antes do horário marcado.', hours_before = 2
  where key = 'test_reminder';
update public.message_templates set
  description = 'Mensagem de parabéns enviada via campanha para quem faz aniversário no mês.'
  where key = 'birthday';
update public.message_templates set
  description = 'Mensagem para avaliar o atendimento após a sessão.', active = false
  where key = 'satisfaction_survey';
update public.message_templates set
  description = 'Mensagem de reengajamento para quem não agenda há 60+ dias.', active = false
  where key = 'inactive_clients';
update public.message_templates set
  description = 'Dicas de cuidado enviadas no dia seguinte ao procedimento.', active = false
  where key = 'post_appointment';

-- Antes só existia "update" — agora a admin pode criar (e apagar, só as
-- que ela mesma criou) automações novas direto pelo painel.
create policy "admin insert message_templates" on public.message_templates
  for insert to authenticated with check (true);
create policy "admin delete custom message_templates" on public.message_templates
  for delete to authenticated using (is_custom = true);
grant insert, delete on public.message_templates to authenticated;

create table public.automation_sends (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  template_key text not null references public.message_templates(key) on delete cascade,
  sent_at timestamptz not null default now(),
  unique (booking_id, template_key)
);
alter table public.automation_sends enable row level security;
grant select, insert on public.automation_sends to service_role;

create or replace function public.get_due_reminders(p_template_key text, p_hours_before int)
returns table (
  booking_id uuid, patient_name text, patient_phone text,
  service text, booking_date date, booking_time time
)
language sql security definer set search_path = public
as $fn$
  select b.id, p.name, p.phone, b.service, b.booking_date, b.booking_time
  from public.bookings b
  join public.patients p on p.id = b.patient_id
  where b.status = 'confirmado'
    and coalesce(p.phone, '') <> ''
    and (b.booking_date + b.booking_time) > now()
    and (b.booking_date + b.booking_time) <= now() + (p_hours_before || ' hours')::interval
    and not exists (
      select 1 from public.automation_sends s
      where s.booking_id = b.id and s.template_key = p_template_key
    );
$fn$;

grant execute on function public.get_due_reminders(text, int) to service_role;

create extension if not exists pg_cron with schema extensions;
create extension if not exists pg_net with schema extensions;

select cron.schedule(
  'send-scheduled-reminders',
  '*/15 * * * *',
  $cron$
  select net.http_post(
    url := 'https://opyjrauwtjnhamwkdvde.supabase.co/functions/v1/send-scheduled-reminders',
    headers := jsonb_build_object('Content-Type', 'application/json', 'x-cron-secret', 'mILeUth4FuDmVA-y6uLmIPr0upsf7Xr3'),
    body := '{}'::jsonb
  );
  $cron$
);
