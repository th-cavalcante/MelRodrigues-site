-- MR Laser — schema inicial (patients, sessions, photos, document_signatures)
-- Rodar no SQL Editor do projeto Supabase (Dashboard > SQL Editor > New query).

create extension if not exists pgcrypto;

create table public.patients (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id),
  status text not null default 'pending'
    check (status in ('pending','anamnese_completed','active','archived')),
  name text,
  birthdate date,
  cpf text,
  phone text,
  sex text,
  street text,
  neighborhood text,
  city text,
  cep text,
  fototipo smallint,
  clinical_answers jsonb,
  notes text
);

create table public.sessions (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  created_at timestamptz not null default now(),
  session_num int not null,
  session_date date,
  obs text,
  unique (patient_id, session_num)
);

create table public.photos (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  session_id uuid references public.sessions(id) on delete cascade,
  kind text not null check (kind in ('avatar','before','after','gallery')),
  storage_path text not null,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id)
);

create table public.document_signatures (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  doc_key text not null check (doc_key in ('contrato','termo')),
  signed_at timestamptz not null default now(),
  signature_data_url text not null,
  patient_name_snapshot text,
  unique (patient_id, doc_key)
);

-- ==========================================================================
-- RLS — só admin autenticado tem acesso direto às tabelas
-- ==========================================================================

alter table public.patients enable row level security;
alter table public.sessions enable row level security;
alter table public.photos enable row level security;
alter table public.document_signatures enable row level security;

create policy "admin full access" on public.patients
  for all to authenticated using (true) with check (true);
create policy "admin full access" on public.sessions
  for all to authenticated using (true) with check (true);
create policy "admin full access" on public.photos
  for all to authenticated using (true) with check (true);
create policy "admin full access" on public.document_signatures
  for all to authenticated using (true) with check (true);

revoke all on public.patients, public.sessions, public.photos, public.document_signatures from anon;

-- RLS por si só não basta: o papel authenticated também precisa do GRANT
-- básico na tabela, senão toda operação vira "permission denied".
grant usage on schema public to authenticated, anon;
grant select, insert, update, delete on public.patients to authenticated;
grant select, insert, update, delete on public.sessions to authenticated;
grant select, insert, update, delete on public.photos to authenticated;
grant select, insert, update, delete on public.document_signatures to authenticated;

-- ==========================================================================
-- RPC — única porta de entrada pública (paciente), cada função opera em
-- exatamente uma linha (a do p_patient_id recebido), nunca faz SELECT geral.
-- ==========================================================================

-- 1) paciente preenche/atualiza a ficha de anamnese
create or replace function public.submit_anamnese(
  p_patient_id uuid,
  p_name text,
  p_birthdate date,
  p_cpf text,
  p_phone text,
  p_sex text,
  p_street text,
  p_neighborhood text,
  p_city text,
  p_cep text,
  p_fototipo smallint,
  p_clinical_answers jsonb,
  p_notes text
) returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.patients set
    name = p_name,
    birthdate = p_birthdate,
    cpf = p_cpf,
    phone = p_phone,
    sex = p_sex,
    street = p_street,
    neighborhood = p_neighborhood,
    city = p_city,
    cep = p_cep,
    fototipo = p_fototipo,
    clinical_answers = p_clinical_answers,
    notes = p_notes,
    status = 'anamnese_completed',
    updated_at = now()
  where id = p_patient_id;

  if not found then
    raise exception 'Paciente não encontrado';
  end if;
end;
$$;

revoke all on function public.submit_anamnese from public;
-- authenticated também recebe: o supabase-js compartilha a sessão de login
-- entre abas do mesmo navegador, então testar o link do paciente na mesma
-- sessão do admin faz a chamada ir como "authenticated" em vez de "anon".
grant execute on function public.submit_anamnese to anon, authenticated;

-- 2) página de assinatura busca nome/CPF/endereço p/ montar o texto do contrato
create or replace function public.get_patient_for_docs(p_patient_id uuid)
returns table (
  name text,
  cpf text,
  phone text,
  street text,
  neighborhood text,
  city text,
  cep text
)
language sql
security definer
set search_path = public
as $$
  select name, cpf, phone, street, neighborhood, city, cep
  from public.patients
  where id = p_patient_id;
$$;

revoke all on function public.get_patient_for_docs from public;
grant execute on function public.get_patient_for_docs to anon, authenticated;

-- 3) paciente assina contrato/termo (upsert por patient_id + doc_key)
create or replace function public.submit_signature(
  p_patient_id uuid,
  p_doc_key text,
  p_signature_data_url text,
  p_patient_name_snapshot text
) returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_doc_key not in ('contrato','termo') then
    raise exception 'doc_key inválido';
  end if;

  if not exists (select 1 from public.patients where id = p_patient_id) then
    raise exception 'Paciente não encontrado';
  end if;

  insert into public.document_signatures (patient_id, doc_key, signature_data_url, patient_name_snapshot)
  values (p_patient_id, p_doc_key, p_signature_data_url, p_patient_name_snapshot)
  on conflict (patient_id, doc_key) do update
    set signature_data_url = excluded.signature_data_url,
        patient_name_snapshot = excluded.patient_name_snapshot,
        signed_at = now();
end;
$$;

revoke all on function public.submit_signature from public;
grant execute on function public.submit_signature to anon, authenticated;

-- ==========================================================================
-- Storage — bucket privado de fotos, só admin autenticado lê/escreve.
-- Assinaturas ficam inline em document_signatures.signature_data_url,
-- não usam Storage nem precisam de policy pública.
-- ==========================================================================

insert into storage.buckets (id, name, public)
values ('patient-photos', 'patient-photos', false)
on conflict (id) do nothing;

create policy "admin read patient photos" on storage.objects
  for select to authenticated using (bucket_id = 'patient-photos');
create policy "admin write patient photos" on storage.objects
  for insert to authenticated with check (bucket_id = 'patient-photos');
create policy "admin update patient photos" on storage.objects
  for update to authenticated using (bucket_id = 'patient-photos');
create policy "admin delete patient photos" on storage.objects
  for delete to authenticated using (bucket_id = 'patient-photos');
