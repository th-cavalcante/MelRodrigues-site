-- MR Laser — Horário de início e término da locação no contrato.
-- rental_bookings já tem rental_start_time / rental_end_time (sem uso desde a
-- 0029, que trocou por "período em horas"); agora o contrato mostra os dois:
-- o período (6/8/12h) continua, e o horário exato é preenchido à parte.
-- get_rental_booking_for_docs passa a expor os dois campos (muda o formato de
-- retorno, precisa dropar antes) pra a página pública de assinatura montar o
-- mesmo texto que o admin.

drop function if exists public.get_rental_booking_for_docs(uuid);

create or replace function public.get_rental_booking_for_docs(p_rental_booking_id uuid)
returns table (
  name text, cpf text, phone text, street text, neighborhood text, city text, cep text,
  rental_date date, rental_period_hours int, rental_start_time time, rental_end_time time,
  rental_value numeric, num_days int, discount numeric,
  landlord_signed_at timestamptz, already_signed boolean
)
language sql
security definer
set search_path = public
as $$
  select c.name, c.cpf, c.phone, c.street, c.neighborhood, c.city, c.cep,
         b.rental_date, b.rental_period_hours, b.rental_start_time, b.rental_end_time,
         b.rental_value, b.num_days, b.discount,
         b.landlord_signed_at,
         exists(select 1 from public.rental_document_signatures s where s.rental_booking_id = b.id and s.status = 'valid')
  from public.rental_bookings b
  join public.rental_clients c on c.id = b.rental_client_id
  where b.id = p_rental_booking_id;
$$;

revoke all on function public.get_rental_booking_for_docs from public;
grant execute on function public.get_rental_booking_for_docs to anon, authenticated;
