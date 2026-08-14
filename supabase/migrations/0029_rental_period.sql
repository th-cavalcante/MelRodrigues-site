-- MR Laser — Troca horário de início/término da Locação por um período em
-- horas (6h / 8h / 12h), mais simples de preencher. Mantém rental_start_time
-- e rental_end_time (não usadas mais pela tela, sem remover dado histórico).
-- Rodar no SQL Editor do projeto Supabase (Dashboard > SQL Editor > New query).

alter table public.rental_bookings
  add column if not exists rental_period_hours int;

-- get_rental_booking_for_docs passa a expor rental_period_hours em vez de
-- rental_start_time/rental_end_time (muda o formato de retorno, precisa
-- dropar antes de recriar).
drop function if exists public.get_rental_booking_for_docs(uuid);

create or replace function public.get_rental_booking_for_docs(p_rental_booking_id uuid)
returns table (
  name text, cpf text, phone text, street text, neighborhood text, city text, cep text,
  rental_date date, rental_period_hours int, rental_value numeric,
  landlord_signed_at timestamptz, already_signed boolean
)
language sql
security definer
set search_path = public
as $$
  select c.name, c.cpf, c.phone, c.street, c.neighborhood, c.city, c.cep,
         b.rental_date, b.rental_period_hours, b.rental_value,
         b.landlord_signed_at,
         exists(select 1 from public.rental_document_signatures s where s.rental_booking_id = b.id and s.status = 'valid')
  from public.rental_bookings b
  join public.rental_clients c on c.id = b.rental_client_id
  where b.id = p_rental_booking_id;
$$;

revoke all on function public.get_rental_booking_for_docs from public;
grant execute on function public.get_rental_booking_for_docs to anon, authenticated;
