-- MR Laser — Seção "Serviços Complementares" da Tabela de Preço pública
-- (site), editável pelo painel administrativo. Cada card (ex: "Limpeza de
-- Pele", "Dreno Relaxante") tem um título e uma lista de linhas de
-- preço (label + preço) — o preço é texto livre pra caber "(3x sem juros)"
-- e afins, já que é conteúdo de vitrine, não usado em cálculo.
-- Rodar no SQL Editor do projeto Supabase (Dashboard > SQL Editor > New query).

create table public.site_complementary_cards (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table public.site_complementary_card_items (
  id uuid primary key default gen_random_uuid(),
  card_id uuid not null references public.site_complementary_cards(id) on delete cascade,
  label text not null,
  price text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.site_complementary_cards enable row level security;
alter table public.site_complementary_card_items enable row level security;

create policy "public read site_complementary_cards" on public.site_complementary_cards
  for select using (true);
create policy "admin insert site_complementary_cards" on public.site_complementary_cards
  for insert to authenticated with check (true);
create policy "admin update site_complementary_cards" on public.site_complementary_cards
  for update to authenticated using (true) with check (true);
create policy "admin delete site_complementary_cards" on public.site_complementary_cards
  for delete to authenticated using (true);

create policy "public read site_complementary_card_items" on public.site_complementary_card_items
  for select using (true);
create policy "admin insert site_complementary_card_items" on public.site_complementary_card_items
  for insert to authenticated with check (true);
create policy "admin update site_complementary_card_items" on public.site_complementary_card_items
  for update to authenticated using (true) with check (true);
create policy "admin delete site_complementary_card_items" on public.site_complementary_card_items
  for delete to authenticated using (true);

grant select on public.site_complementary_cards, public.site_complementary_card_items to anon, authenticated;
grant insert, update, delete on public.site_complementary_cards, public.site_complementary_card_items to authenticated;

insert into public.site_complementary_cards (id, title, sort_order) values
  ('a0000000-0000-4000-8000-000000000001', 'Limpeza de Pele', 1),
  ('a0000000-0000-4000-8000-000000000002', 'Dreno Relaxante', 2);

insert into public.site_complementary_card_items (card_id, label, price, sort_order) values
  ('a0000000-0000-4000-8000-000000000001', 'Sessão', 'R$ 150,00', 1),
  ('a0000000-0000-4000-8000-000000000002', 'Sessão avulsa', 'R$ 150,00', 1),
  ('a0000000-0000-4000-8000-000000000002', 'Pacote com 4 sessões', 'R$ 480,00 (3x sem juros)', 2),
  ('a0000000-0000-4000-8000-000000000002', 'Pacote com 6 sessões', 'R$ 720,00 (3x sem juros)', 3),
  ('a0000000-0000-4000-8000-000000000002', 'Pacote com 10 sessões', 'R$ 1.200,00 (5x sem juros)', 4);
