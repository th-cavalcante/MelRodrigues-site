-- Mensagens de WhatsApp editáveis pela admin (confirmação pós-pagamento,
-- lembrete de teste, aniversário) e campanhas de marketing (público
-- "aniversariantes do mês" por enquanto).

create table public.message_templates (
  key text primary key,
  label text not null,
  body text not null,
  updated_at timestamptz not null default now()
);

alter table public.message_templates enable row level security;

create policy "public read message_templates" on public.message_templates
  for select using (true);

create policy "admin update message_templates" on public.message_templates
  for update to authenticated using (true) with check (true);

grant select on public.message_templates to anon, authenticated;
grant update on public.message_templates to authenticated;

insert into public.message_templates (key, label, body) values
  ('booking_confirmed', 'Confirmação de agendamento (pagamento aprovado)',
   E'{{nome}}!\nSua sessão está confirmada para dia {{data}} e horário {{hora}}.\nClique no link para ler as recomendações:\nhttps://www.melrodrigues.com.br/recomendacoes'),
  ('test_reminder', 'Lembrete de teste (botão manual no agendamento)',
   E'Olá {{nome}}! Passando pra lembrar do seu horário na MR Laser: {{servico}} em {{data}} às {{hora}}. Te esperamos! 💙'),
  ('birthday', 'Mensagem de aniversário',
   E'Parabéns, {{nome}}! 🎉 A equipe MR Laser deseja um feliz aniversário! Que tal comemorar com uma sessão? Estamos à disposição.');

create table public.campaigns (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  audience text not null check (audience in ('aniversariantes_mes')),
  message_body text not null,
  status text not null default 'enviando' check (status in ('enviando', 'enviada', 'erro')),
  target_count int not null default 0,
  sent_count int not null default 0,
  created_at timestamptz not null default now(),
  sent_at timestamptz
);

alter table public.campaigns enable row level security;

create policy "admin all campaigns" on public.campaigns
  for all to authenticated using (true) with check (true);

grant select, insert, update on public.campaigns to authenticated;
