-- MR Laser — Separa "Cliente" (cadastro único) de "Locação" (um registro
-- por mês, cada um com sua própria data/valor/contrato/assinatura), pra
-- não precisar apagar o mês anterior pra registrar o próximo.
-- Rodar no SQL Editor do projeto Supabase (Dashboard > SQL Editor > New query).

create table public.rental_bookings (
  id uuid primary key default gen_random_uuid(),
  rental_client_id uuid not null references public.rental_clients(id) on delete cascade,
  created_at timestamptz not null default now(),
  rental_date date,
  rental_start_time time,
  rental_end_time time,
  rental_value numeric,
  contract_sent boolean not null default false,
  contract_sent_at timestamptz,
  selfie_path text
);

alter table public.rental_bookings enable row level security;

create policy "admin full access" on public.rental_bookings
  for all to authenticated using (true) with check (true);

revoke all on public.rental_bookings from anon;

grant select, insert, update, delete on public.rental_bookings to authenticated;
grant select on public.rental_bookings to service_role;

create index rental_bookings_client_idx on public.rental_bookings (rental_client_id);

-- ==========================================================================
-- Migra dados existentes: a locação que já estava em rental_clients vira a
-- primeira "locação" (rental_bookings) de cada cliente.
-- ==========================================================================

insert into public.rental_bookings (rental_client_id, created_at, rental_date, rental_start_time, rental_end_time, rental_value, contract_sent, contract_sent_at, selfie_path)
select id, created_at, rental_date, rental_start_time, rental_end_time, rental_value, contract_sent, contract_sent_at, selfie_path
from public.rental_clients
where rental_date is not null or rental_value is not null or contract_sent = true;

-- rental_document_signatures passa a apontar pra uma locação (rental_bookings),
-- não mais direto pro cliente — assim cada mês tem sua própria assinatura.
alter table public.rental_document_signatures add column rental_booking_id uuid references public.rental_bookings(id) on delete cascade;

update public.rental_document_signatures s
set rental_booking_id = b.id
from public.rental_bookings b
where b.rental_client_id = s.rental_client_id;

alter table public.rental_document_signatures alter column rental_booking_id set not null;
alter table public.rental_document_signatures drop column rental_client_id;
alter table public.rental_document_signatures add constraint rental_document_signatures_booking_key unique (rental_booking_id);

-- Remove de rental_clients os campos que agora vivem em rental_bookings
-- (dado já preservado na migração acima).
alter table public.rental_clients
  drop column rental_date,
  drop column rental_start_time,
  drop column rental_end_time,
  drop column rental_value,
  drop column contract_sent,
  drop column contract_sent_at,
  drop column selfie_path;

-- ==========================================================================
-- RPCs públicas — agora operam por rental_booking_id em vez de rental_client_id.
-- ==========================================================================

drop function if exists public.get_rental_client_for_docs(uuid);

create or replace function public.get_rental_booking_for_docs(p_rental_booking_id uuid)
returns table (
  name text, cpf text, phone text, street text, neighborhood text, city text, cep text,
  rental_date date, rental_start_time time, rental_end_time time, rental_value numeric
)
language sql
security definer
set search_path = public
as $$
  select c.name, c.cpf, c.phone, c.street, c.neighborhood, c.city, c.cep,
         b.rental_date, b.rental_start_time, b.rental_end_time, b.rental_value
  from public.rental_bookings b
  join public.rental_clients c on c.id = b.rental_client_id
  where b.id = p_rental_booking_id;
$$;

revoke all on function public.get_rental_booking_for_docs from public;
grant execute on function public.get_rental_booking_for_docs to anon, authenticated;

drop function if exists public.submit_rental_signature(uuid, text, text);

create or replace function public.submit_rental_signature(
  p_rental_booking_id uuid,
  p_signature_data_url text,
  p_client_name_snapshot text
) returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (select 1 from public.rental_bookings where id = p_rental_booking_id) then
    raise exception 'Locação não encontrada';
  end if;

  insert into public.rental_document_signatures (rental_booking_id, signature_data_url, client_name_snapshot)
  values (p_rental_booking_id, p_signature_data_url, p_client_name_snapshot)
  on conflict (rental_booking_id) do update
    set signature_data_url = excluded.signature_data_url,
        client_name_snapshot = excluded.client_name_snapshot,
        signed_at = now();
end;
$$;

revoke all on function public.submit_rental_signature from public;
grant execute on function public.submit_rental_signature to anon, authenticated;

drop function if exists public.submit_rental_selfie(uuid, text);

create or replace function public.submit_rental_selfie(
  p_rental_booking_id uuid,
  p_storage_path text
) returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (select 1 from public.rental_bookings where id = p_rental_booking_id) then
    raise exception 'Locação não encontrada';
  end if;

  update public.rental_bookings set selfie_path = p_storage_path where id = p_rental_booking_id;
end;
$$;

revoke all on function public.submit_rental_selfie from public;
grant execute on function public.submit_rental_selfie to anon, authenticated;
