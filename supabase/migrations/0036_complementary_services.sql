-- MR Laser — Serviços Complementares (Limpeza de Pele, Drenagem Linfática)
-- ganham preço próprio, editável pelo painel ("Tabela de Preço"), em vez de
-- só o nome sem valor — pra entrar na conta do agendamento.
-- Rodar no SQL Editor do projeto Supabase (Dashboard > SQL Editor > New query).

create table public.complementary_services (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  price numeric not null default 0,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.complementary_services enable row level security;

create policy "public read complementary_services" on public.complementary_services
  for select using (true);
create policy "admin insert complementary_services" on public.complementary_services
  for insert to authenticated with check (true);
create policy "admin update complementary_services" on public.complementary_services
  for update to authenticated using (true) with check (true);
create policy "admin delete complementary_services" on public.complementary_services
  for delete to authenticated using (true);

grant select on public.complementary_services to anon, authenticated;
grant insert, update, delete on public.complementary_services to authenticated;

-- Preço 0 pros dois já existentes — precisam ser preenchidos em "Tabela de
-- Preço" > "Serviços Complementares" com o valor real cobrado por cada um.
insert into public.complementary_services (name, price, sort_order) values
  ('Limpeza de Pele', 0, 1),
  ('Drenagem Linfática', 0, 2);
