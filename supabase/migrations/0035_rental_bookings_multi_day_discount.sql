-- MR Laser — Locações que duram mais de 1 dia, e desconto por locação
-- (clientes que alugam por vários dias ganham desconto).
-- Rodar no SQL Editor do projeto Supabase (Dashboard > SQL Editor > New query).

alter table public.rental_bookings
  add column if not exists num_days integer not null default 1 check (num_days >= 1),
  add column if not exists discount numeric not null default 0 check (discount >= 0);

-- get_rental_booking_for_docs precisa expor num_days/discount também, senão
-- a página pública de assinatura mostra o contrato como se fosse sempre 1
-- dia e sem desconto (muda o formato de retorno, precisa dropar antes).
drop function if exists public.get_rental_booking_for_docs(uuid);

create or replace function public.get_rental_booking_for_docs(p_rental_booking_id uuid)
returns table (
  name text, cpf text, phone text, street text, neighborhood text, city text, cep text,
  rental_date date, rental_period_hours int, rental_value numeric, num_days int, discount numeric,
  landlord_signed_at timestamptz, already_signed boolean
)
language sql
security definer
set search_path = public
as $$
  select c.name, c.cpf, c.phone, c.street, c.neighborhood, c.city, c.cep,
         b.rental_date, b.rental_period_hours, b.rental_value, b.num_days, b.discount,
         b.landlord_signed_at,
         exists(select 1 from public.rental_document_signatures s where s.rental_booking_id = b.id and s.status = 'valid')
  from public.rental_bookings b
  join public.rental_clients c on c.id = b.rental_client_id
  where b.id = p_rental_booking_id;
$$;

revoke all on function public.get_rental_booking_for_docs from public;
grant execute on function public.get_rental_booking_for_docs to anon, authenticated;
