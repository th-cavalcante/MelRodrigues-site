-- MR Laser — Pagamento real (Mercado Pago) pra inscrição no Curso de
-- Depilação a Laser. Substitui o checkout fictício da landing page /cursos.
-- Rodar no SQL Editor do projeto Supabase (Dashboard > SQL Editor > New query).

create table public.course_orders (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  plan_key text not null check (plan_key in ('turma', 'individual')),
  amount numeric not null,
  customer_name text not null,
  customer_email text not null,
  customer_phone text not null,
  status text not null default 'pending' check (status in ('pending', 'paid', 'failed')),
  mp_payment_id text,
  payment_method text
);

alter table public.course_orders enable row level security;

create policy "admin full access" on public.course_orders
  for all to authenticated using (true) with check (true);

-- anon não acessa a tabela em nenhuma hipótese (nome/e-mail/telefone de
-- outros clientes) — o pedido é criado só pela Edge Function
-- create-course-mp-preference, com service_role.
revoke all on public.course_orders from anon;
grant select, insert, update, delete on public.course_orders to authenticated;
grant select, insert, update on public.course_orders to service_role;

create index course_orders_status_idx on public.course_orders (status);

-- Confirmação por WhatsApp quando a inscrição é paga (mesmo padrão dos
-- outros templates editáveis).
insert into public.message_templates (key, label, body, description, active, is_custom)
values (
  'course_purchase_confirmed',
  'Confirmação de inscrição no Curso',
  '{{nome}}, sua vaga no Curso de Depilação a Laser está confirmada! 🎉 Em breve entraremos em contato pelo WhatsApp com os próximos passos.',
  'Enviado automaticamente quando o pagamento da inscrição no curso é aprovado pelo Mercado Pago.',
  true,
  false
)
on conflict (key) do nothing;
