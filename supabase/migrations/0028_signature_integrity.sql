-- MR Laser — Reforça a robustez jurídica das assinaturas eletrônicas:
-- congelamento do texto assinado, hash SHA-256, autenticação por código
-- via WhatsApp, trilha de auditoria e ID público de validação.
-- Rodar no SQL Editor do projeto Supabase (Dashboard > SQL Editor > New query).
--
-- Fase 1: núcleo genérico (document_versions / signature_otp_codes /
-- signature_audit_log) + aplicação em rental_document_signatures (Locação,
-- referência do pedido). document_signatures (pacientes) recebe as mesmas
-- colunas nesta migration para não duplicar estrutura depois, mas o fluxo
-- de assinatura dos pacientes continua com o comportamento atual até a
-- Fase 2 (endpoints/telas) ser implementada.

-- ==========================================================================
-- 1) document_versions — snapshot imutável do texto exibido no momento em
--    que a assinatura foi concluída. Sem isso, um hash não prova nada,
--    porque o texto hoje é recalculado a partir dos dados atuais do cliente.
-- ==========================================================================

create table public.document_versions (
  id uuid primary key default gen_random_uuid(),
  subject_type text not null check (subject_type in ('patient_contrato', 'patient_termo', 'rental_contract')),
  subject_id uuid not null,
  version_number int not null default 1,
  body_snapshot text not null,
  status text not null default 'signed' check (status in ('signed', 'superseded', 'canceled')),
  created_at timestamptz not null default now(),
  unique (subject_type, subject_id, version_number)
);

alter table public.document_versions enable row level security;

create policy "admin read document versions" on public.document_versions
  for select to authenticated using (true);

revoke all on public.document_versions from anon;
grant select on public.document_versions to authenticated;
-- Inserção só via função SECURITY DEFINER (finalize-signature usa service_role).

-- ==========================================================================
-- 2) signature_otp_codes — código de autenticação de 6 dígitos enviado por
--    WhatsApp antes de liberar a assinatura. Só acessível via Edge Functions
--    com service_role — nunca exposto direto a anon/authenticated.
-- ==========================================================================

create table public.signature_otp_codes (
  id uuid primary key default gen_random_uuid(),
  subject_type text not null check (subject_type in ('patient_contrato', 'patient_termo', 'rental_contract')),
  subject_id uuid not null,
  code_hash text not null,
  destination_masked text,
  attempts int not null default 0,
  max_attempts int not null default 5,
  expires_at timestamptz not null,
  verified_at timestamptz,
  reserved_signature_id text,
  signing_token uuid,
  signing_token_used_at timestamptz,
  ip_address text,
  user_agent text,
  created_at timestamptz not null default now()
);

alter table public.signature_otp_codes enable row level security;

revoke all on public.signature_otp_codes from anon, authenticated;
-- Sem policy de select/insert/update pra anon/authenticated: só service_role
-- (usado pelas Edge Functions send-signature-otp / verify-signature-otp / finalize-signature).

create index signature_otp_codes_subject_idx on public.signature_otp_codes (subject_type, subject_id, created_at desc);

-- ==========================================================================
-- 3) signature_audit_log — trilha de eventos, somente leitura pro admin.
-- ==========================================================================

create table public.signature_audit_log (
  id uuid primary key default gen_random_uuid(),
  subject_type text not null check (subject_type in ('patient_contrato', 'patient_termo', 'rental_contract')),
  subject_id uuid not null,
  document_version_id uuid references public.document_versions(id),
  event_type text not null,
  occurred_at timestamptz not null default now(),
  ip_address text,
  user_agent text,
  metadata jsonb,
  created_by uuid references auth.users(id)
);

alter table public.signature_audit_log enable row level security;

create policy "admin read audit log" on public.signature_audit_log
  for select to authenticated using (true);

revoke all on public.signature_audit_log from anon;
grant select on public.signature_audit_log to authenticated;
-- Inserção liberada só pra service_role e pela função log_signature_event abaixo
-- (que restringe os event_type possíveis vindos do público).

create index signature_audit_log_subject_idx on public.signature_audit_log (subject_type, subject_id, occurred_at);

-- ==========================================================================
-- 4) Reforça document_signatures (pacientes) e rental_document_signatures
--    (Locação) com os campos de evidência forense pedidos.
-- ==========================================================================

alter table public.document_signatures
  add column if not exists signature_id text,
  add column if not exists document_version_id uuid references public.document_versions(id),
  add column if not exists signer_cpf_snapshot text,
  add column if not exists signer_phone_snapshot text,
  add column if not exists ip_address text,
  add column if not exists user_agent text,
  add column if not exists auth_method text,
  add column if not exists consent_confirmed_at timestamptz,
  add column if not exists document_hash text,
  add column if not exists pdf_storage_path text,
  add column if not exists status text not null default 'valid' check (status in ('valid', 'superseded', 'canceled'));

-- Nome da constraint original é auto-gerado pelo Postgres (não foi nomeado
-- explicitamente na 0001_init.sql) — busca dinamicamente em vez de supor o
-- nome, pra não deixar uma unique constraint "cheia" concorrendo com o
-- índice parcial abaixo.
do $$
declare
  c_name text;
begin
  select conname into c_name
  from pg_constraint
  where conrelid = 'public.document_signatures'::regclass
    and contype = 'u'
    and conkey = (
      select array_agg(attnum order by attnum)
      from pg_attribute
      where attrelid = 'public.document_signatures'::regclass
        and attname in ('patient_id', 'doc_key')
    );
  if c_name is not null then
    execute format('alter table public.document_signatures drop constraint %I', c_name);
  end if;
end $$;

alter table public.document_signatures add constraint document_signatures_signature_id_key unique (signature_id);
create unique index if not exists document_signatures_valid_unique
  on public.document_signatures (patient_id, doc_key) where status = 'valid';

alter table public.rental_document_signatures
  add column if not exists signature_id text,
  add column if not exists document_version_id uuid references public.document_versions(id),
  add column if not exists signer_cpf_snapshot text,
  add column if not exists signer_phone_snapshot text,
  add column if not exists ip_address text,
  add column if not exists user_agent text,
  add column if not exists auth_method text,
  add column if not exists consent_confirmed_at timestamptz,
  add column if not exists document_hash text,
  add column if not exists pdf_storage_path text,
  add column if not exists status text not null default 'valid' check (status in ('valid', 'superseded', 'canceled'));

alter table public.rental_document_signatures drop constraint if exists rental_document_signatures_booking_key;
alter table public.rental_document_signatures add constraint rental_document_signatures_signature_id_key unique (signature_id);
create unique index if not exists rental_document_signatures_valid_unique
  on public.rental_document_signatures (rental_booking_id) where status = 'valid';

-- Assinatura da LOCADORA (MR Laser) — item 9 do pedido: admin autenticado
-- confirma a revisão antes de liberar o envio pro cliente. Não precisa de
-- canvas de assinatura porque a ação já é feita por usuário autenticado.
alter table public.rental_bookings
  add column if not exists landlord_signed_at timestamptz,
  add column if not exists landlord_signed_by uuid references auth.users(id);

-- ==========================================================================
-- 5) Storage — bucket privado pro PDF final assinado (nunca foi armazenado
--    até hoje; cada "Baixar PDF" regenerava do zero a partir dos dados
--    atuais, o que é a principal fragilidade do mecanismo anterior).
-- ==========================================================================

insert into storage.buckets (id, name, public)
values ('signed-documents', 'signed-documents', false)
on conflict (id) do nothing;

create policy "admin read signed documents" on storage.objects
  for select to authenticated using (bucket_id = 'signed-documents');
-- Sem policy de insert/update/delete pra anon/authenticated: só a Edge
-- Function finalize-signature (service_role) grava nesse bucket.

-- ==========================================================================
-- 6) RPCs
-- ==========================================================================

-- Extrai o IP do cliente a partir dos headers que o PostgREST expõe por
-- request (Supabase já preenche esse GUC, sem precisar de proxy extra).
create or replace function public.current_client_ip()
returns text
language sql
stable
as $$
  select coalesce(
    split_part(current_setting('request.headers', true)::json->>'x-forwarded-for', ',', 1),
    current_setting('request.headers', true)::json->>'x-real-ip'
  );
$$;

create or replace function public.current_client_user_agent()
returns text
language sql
stable
as $$
  select current_setting('request.headers', true)::json->>'user-agent';
$$;

-- Registra eventos "leves" da trilha de auditoria que acontecem antes da
-- assinatura em si (visualizou o documento, confirmou a leitura). Os
-- eventos que exigem verificação server-side (otp_sent, otp_verified,
-- signature_completed, hash_recorded) só são gravados pelas Edge Functions
-- via service_role, nunca por esta função pública.
create or replace function public.log_signature_event(
  p_subject_type text,
  p_subject_id uuid,
  p_event_type text
) returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_event_type not in ('viewed', 'consent_confirmed') then
    raise exception 'Tipo de evento não permitido nesta função';
  end if;

  insert into public.signature_audit_log (subject_type, subject_id, event_type, ip_address, user_agent)
  values (p_subject_type, p_subject_id, p_event_type, public.current_client_ip(), public.current_client_user_agent());
end;
$$;

revoke all on function public.log_signature_event from public;
grant execute on function public.log_signature_event to anon, authenticated;

-- Página pública de validação (/validar/:signatureId) — só dados não
-- sensíveis: sem CPF completo, sem IP, sem user-agent.
create or replace function public.get_signature_for_validation(p_signature_id text)
returns table (
  signature_id text,
  subject_type text,
  status text,
  signer_name text,
  signed_at timestamptz,
  document_hash text,
  version_number int
)
language sql
stable
security definer
set search_path = public
as $$
  select s.signature_id, 'rental_contract'::text, s.status, s.client_name_snapshot, s.signed_at,
         s.document_hash, v.version_number
  from public.rental_document_signatures s
  left join public.document_versions v on v.id = s.document_version_id
  where s.signature_id = p_signature_id
  union all
  select s.signature_id, ('patient_' || s.doc_key)::text, s.status, s.patient_name_snapshot, s.signed_at,
         s.document_hash, v.version_number
  from public.document_signatures s
  left join public.document_versions v on v.id = s.document_version_id
  where s.signature_id = p_signature_id
  limit 1;
$$;

revoke all on function public.get_signature_for_validation from public;
grant execute on function public.get_signature_for_validation to anon, authenticated;

-- Admin confirma a assinatura da LOCADORA antes de enviar o contrato pro
-- cliente (item 9 do pedido — assinatura das duas partes).
create or replace function public.sign_rental_as_landlord(p_rental_booking_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (select 1 from public.rental_bookings where id = p_rental_booking_id) then
    raise exception 'Locação não encontrada';
  end if;

  update public.rental_bookings
  set landlord_signed_at = now(), landlord_signed_by = auth.uid()
  where id = p_rental_booking_id;

  insert into public.signature_audit_log (subject_type, subject_id, event_type, created_by)
  values ('rental_contract', p_rental_booking_id, 'landlord_signed', auth.uid());
end;
$$;

revoke all on function public.sign_rental_as_landlord from public;
grant execute on function public.sign_rental_as_landlord to authenticated;

-- get_rental_booking_for_docs passa a informar também se a locadora já
-- assinou (o cliente só pode assinar depois) e se já existe assinatura
-- válida da locatária (documento já concluído, tela pública mostra "já
-- assinado" em vez do formulário de novo). Muda o formato de retorno, então
-- precisa dropar antes de recriar (Postgres não deixa trocar OUT params
-- com CREATE OR REPLACE).
drop function if exists public.get_rental_booking_for_docs(uuid);

create or replace function public.get_rental_booking_for_docs(p_rental_booking_id uuid)
returns table (
  name text, cpf text, phone text, street text, neighborhood text, city text, cep text,
  rental_date date, rental_start_time time, rental_end_time time, rental_value numeric,
  landlord_signed_at timestamptz, already_signed boolean
)
language sql
security definer
set search_path = public
as $$
  select c.name, c.cpf, c.phone, c.street, c.neighborhood, c.city, c.cep,
         b.rental_date, b.rental_start_time, b.rental_end_time, b.rental_value,
         b.landlord_signed_at,
         exists(select 1 from public.rental_document_signatures s where s.rental_booking_id = b.id and s.status = 'valid')
  from public.rental_bookings b
  join public.rental_clients c on c.id = b.rental_client_id
  where b.id = p_rental_booking_id;
$$;

-- ==========================================================================
-- 7) Correção obrigatória: as duas linhas acima trocaram a unique constraint
--    simples por um índice único PARCIAL (só considera status='valid'). Um
--    "on conflict (coluna)" sem cláusula WHERE não infere mais esse índice
--    parcial — precisa apontar pra ele explicitamente, senão a função quebra
--    em runtime ("no unique or exclusion constraint matching...").
--
--    submit_signature continua em uso HOJE pelo fluxo de Contrato/Termo dos
--    pacientes (a Fase 2 desse reforço ainda não foi implementada), então
--    não pode ficar quebrada por causa desta migration.
--    submit_rental_signature/submit_rental_selfie não são mais chamadas
--    pelo novo fluxo da Locação (substituído por finalize-signature), mas
--    ficam corrigidas e mantidas como estavam, sem remover funcionalidade.
-- ==========================================================================

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
  on conflict (patient_id, doc_key) where status = 'valid' do update
    set signature_data_url = excluded.signature_data_url,
        patient_name_snapshot = excluded.patient_name_snapshot,
        signed_at = now();
end;
$$;

revoke all on function public.submit_signature from public;
grant execute on function public.submit_signature to anon, authenticated;

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
  on conflict (rental_booking_id) where status = 'valid' do update
    set signature_data_url = excluded.signature_data_url,
        client_name_snapshot = excluded.client_name_snapshot,
        signed_at = now();
end;
$$;

revoke all on function public.submit_rental_signature from public;
grant execute on function public.submit_rental_signature to anon, authenticated;
