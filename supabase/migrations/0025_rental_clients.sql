-- MR Laser — Locações (clientes que alugam o equipamento Hakon 4D)
-- Rodar no SQL Editor do projeto Supabase (Dashboard > SQL Editor > New query).

create table public.rental_clients (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  birthdate date,
  cpf text,
  street text,
  neighborhood text,
  city text,
  cep text,
  email text,
  phone text,
  rental_date date,
  rental_value numeric,
  contract_sent boolean not null default false,
  contract_sent_at timestamptz
);

-- ==========================================================================
-- RLS — só admin autenticado tem acesso; não existe página pública.
-- ==========================================================================

alter table public.rental_clients enable row level security;

create policy "admin full access" on public.rental_clients
  for all to authenticated using (true) with check (true);

revoke all on public.rental_clients from anon;

grant usage on schema public to authenticated;
grant select, insert, update, delete on public.rental_clients to authenticated;

-- service_role precisa de acesso direto pra Edge Function enviar contrato/endereço por WhatsApp.
grant select on public.rental_clients to service_role;

-- Templates de mensagem editáveis em Marketing > Automações (mesma tabela já usada pros outros envios).
insert into public.message_templates (key, label, body, description, active, is_custom) values
  (
    'rental_contract',
    'Contrato de Locação (Hakon 4D)',
    E'{{nome}}, segue o contrato de locação do equipamento Hakon 4D — data: {{data}}, valor: R$ {{valor}}. Qualquer dúvida, estou à disposição!',
    'Enviado ao clicar em "Enviar Contrato" na tela de Locações.',
    true, false
  ),
  (
    'rental_address',
    'Confirmação de Endereço (Locação)',
    E'{{nome}}, confirmando o endereço para a locação do equipamento Hakon 4D: {{endereco}}',
    'Enviado ao clicar no botão de WhatsApp ao lado do endereço, na tela de Locações.',
    true, false
  );
