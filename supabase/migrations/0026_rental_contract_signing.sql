-- MR Laser — Assinatura digital do Contrato de Locação (Hakon 4D) + selfie,
-- mesmo fluxo público já usado pro Contrato/Termo dos pacientes, mas
-- aplicado aos clientes de locação (rental_clients).
-- Rodar no SQL Editor do projeto Supabase (Dashboard > SQL Editor > New query).

alter table public.rental_clients
  add column if not exists rental_start_time time,
  add column if not exists rental_end_time time,
  add column if not exists selfie_path text;

create table public.rental_document_signatures (
  id uuid primary key default gen_random_uuid(),
  rental_client_id uuid not null references public.rental_clients(id) on delete cascade,
  signed_at timestamptz not null default now(),
  signature_data_url text not null,
  client_name_snapshot text,
  unique (rental_client_id)
);

alter table public.rental_document_signatures enable row level security;

create policy "admin full access" on public.rental_document_signatures
  for all to authenticated using (true) with check (true);

revoke all on public.rental_document_signatures from anon;

grant select, insert, update, delete on public.rental_document_signatures to authenticated;

-- ==========================================================================
-- RPCs públicas — mesma lógica das já existentes pra patients: SECURITY
-- DEFINER, cada função só opera na linha do rental_client_id recebido.
-- ==========================================================================

-- 1) página de assinatura busca os dados do cliente pra montar o contrato
create or replace function public.get_rental_client_for_docs(p_rental_client_id uuid)
returns table (
  name text, cpf text, phone text, street text, neighborhood text, city text, cep text,
  rental_date date, rental_start_time time, rental_end_time time, rental_value numeric
)
language sql
security definer
set search_path = public
as $$
  select name, cpf, phone, street, neighborhood, city, cep,
         rental_date, rental_start_time, rental_end_time, rental_value
  from public.rental_clients
  where id = p_rental_client_id;
$$;

revoke all on function public.get_rental_client_for_docs from public;
grant execute on function public.get_rental_client_for_docs to anon, authenticated;

-- 2) cliente assina o contrato de locação (upsert por rental_client_id)
create or replace function public.submit_rental_signature(
  p_rental_client_id uuid,
  p_signature_data_url text,
  p_client_name_snapshot text
) returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (select 1 from public.rental_clients where id = p_rental_client_id) then
    raise exception 'Cliente não encontrado';
  end if;

  insert into public.rental_document_signatures (rental_client_id, signature_data_url, client_name_snapshot)
  values (p_rental_client_id, p_signature_data_url, p_client_name_snapshot)
  on conflict (rental_client_id) do update
    set signature_data_url = excluded.signature_data_url,
        client_name_snapshot = excluded.client_name_snapshot,
        signed_at = now();
end;
$$;

revoke all on function public.submit_rental_signature from public;
grant execute on function public.submit_rental_signature to anon, authenticated;

-- 3) selfie pós-assinatura — reaproveita o bucket patient-photos (a policy de
-- insert do anon em 0002_patient_selfie.sql já libera o bucket inteiro, sem
-- restrição por paciente, então não precisa de nova policy de storage).
create or replace function public.submit_rental_selfie(
  p_rental_client_id uuid,
  p_storage_path text
) returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (select 1 from public.rental_clients where id = p_rental_client_id) then
    raise exception 'Cliente não encontrado';
  end if;

  update public.rental_clients set selfie_path = p_storage_path where id = p_rental_client_id;
end;
$$;

revoke all on function public.submit_rental_selfie from public;
grant execute on function public.submit_rental_selfie to anon, authenticated;

-- Ajusta o template padrão de "Enviar Contrato" pra virar link de assinatura
-- (igual document_signature_link/ficha_link), em vez de texto informativo.
update public.message_templates
set body = E'{{nome}}, segue o link para assinatura do contrato de locação do equipamento Hakon 4D: {{link}}',
    description = 'Enviado ao clicar em "Enviar Contrato" na tela de Locações — leva o cliente até a página de assinatura.'
where key = 'rental_contract';
