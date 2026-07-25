-- MR Laser — bloqueio manual de horários/dias na Agenda (ex: dias fora do
-- horário comercial em que a profissional não atende).
-- Rodar no SQL Editor do projeto Supabase (Dashboard > SQL Editor > New query).

create table public.blocked_slots (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  blocked_date date not null,
  blocked_time time, -- null = dia inteiro bloqueado
  reason text
);

create index blocked_slots_date_idx on public.blocked_slots (blocked_date);

alter table public.blocked_slots enable row level security;
create policy "admin full access" on public.blocked_slots
  for all to authenticated using (true) with check (true);
revoke all on public.blocked_slots from anon;
grant select, insert, update, delete on public.blocked_slots to authenticated;

-- RPC pública — a Agenda Online usa isso pra não deixar a cliente escolher um
-- horário bloqueado. Só devolve o horário, nunca o motivo (é uma nota interna).
create or replace function public.get_blocked_slots(p_date date)
returns table(blocked_time time)
language sql
security definer
set search_path = public
as $$
  select blocked_time from public.blocked_slots where blocked_date = p_date;
$$;

revoke all on function public.get_blocked_slots from public;
grant execute on function public.get_blocked_slots to anon, authenticated;

-- RPC pública — dias inteiramente bloqueados num intervalo, pra desabilitar
-- esses dias no seletor de data da Agenda Online.
create or replace function public.get_blocked_days(p_from date, p_to date)
returns setof date
language sql
security definer
set search_path = public
as $$
  select distinct blocked_date from public.blocked_slots
  where blocked_date between p_from and p_to and blocked_time is null;
$$;

revoke all on function public.get_blocked_days from public;
grant execute on function public.get_blocked_days to anon, authenticated;
