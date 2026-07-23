-- MR Laser — Agenda (tabela de agendamentos)
-- Rodar no SQL Editor do projeto Supabase (Dashboard > SQL Editor > New query).

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  professional text not null default 'Dra. Marina Costa',
  room text not null,
  booking_date date not null,
  booking_time time not null,
  service text not null,
  status text not null default 'pendente'
    check (status in ('confirmado','pendente','em_atendimento','concluido','faltou','cancelado')),
  health_alert boolean not null default false,
  health_reason text,
  equipment text,
  session_num int,
  joules text,
  ms text,
  passadas text,
  valor numeric,
  payment_status text not null default 'Pendente'
    check (payment_status in ('Pago','Pendente','Faturado no plano')),
  notes text
);

create index bookings_date_idx on public.bookings (booking_date);

-- ==========================================================================
-- RLS — só admin autenticado tem acesso; Agenda não tem página pública
-- voltada ao paciente, então não existe nenhum grant/RPC pra anon aqui.
-- ==========================================================================

alter table public.bookings enable row level security;

create policy "admin full access" on public.bookings
  for all to authenticated using (true) with check (true);

revoke all on public.bookings from anon;

grant usage on schema public to authenticated;
grant select, insert, update, delete on public.bookings to authenticated;
