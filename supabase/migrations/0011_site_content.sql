-- MR Laser — CMS básico: conteúdo editável do site (textos, imagens e
-- tabela de preço) via painel administrativo, sem precisar de deploy.
-- Rodar no SQL Editor do projeto Supabase (Dashboard > SQL Editor > New query).

-- ==========================================================================
-- site_content — pares chave/valor pra textos e URLs de imagem editáveis.
-- Leitura pública (o site institucional não exige login), escrita só admin.
-- ==========================================================================
create table public.site_content (
  key text primary key,
  value text,
  updated_at timestamptz not null default now()
);

alter table public.site_content enable row level security;

create policy "public read site_content" on public.site_content
  for select using (true);
create policy "admin insert site_content" on public.site_content
  for insert to authenticated with check (true);
create policy "admin update site_content" on public.site_content
  for update to authenticated using (true) with check (true);
create policy "admin delete site_content" on public.site_content
  for delete to authenticated using (true);

grant usage on schema public to anon;
grant select on public.site_content to anon, authenticated;
grant insert, update, delete on public.site_content to authenticated;

insert into public.site_content (key, value) values
  ('hero_eyebrow', 'Sua Clínica de Depilação a Laser em São Vicente'),
  ('hero_title', 'A ciência da beleza, com a delicadeza que você merece.'),
  ('hero_address', 'R. Benjamin Constant, 61, Sala 515 - Centro, São Vicente (Helbor Offices)'),
  ('hero_photo_url', '/images/mel-sobre.png'),
  ('sobre_title', 'Onde técnica e sensibilidade se encontram'),
  ('sobre_paragraph_1', 'A MR Laser nasceu do desejo de oferecer estética avançada em um ambiente acolhedor e sem pressa. Nossa equipe combina equipamentos de última geração com protocolos individualizados, para que cada cliente viva uma experiência tão cuidadosa quanto o resultado que busca.'),
  ('sobre_paragraph_2', 'Acreditamos que verdadeira sofisticação está nos detalhes — no acolhimento da recepção, na escuta da avaliação, na precisão de cada procedimento.'),
  ('sobre_stat_1_value', '12'),
  ('sobre_stat_1_label', 'Anos de experiência'),
  ('sobre_stat_2_value', '15k+'),
  ('sobre_stat_2_label', 'Procedimentos realizados'),
  ('sobre_stat_3_value', '98%'),
  ('sobre_stat_3_label', 'Taxa de recomendação'),
  ('clinica_photo_url', '/images/clinica-temp.jpg'),
  ('footer_description', 'Estética avançada, com o cuidado e a delicadeza que você merece.'),
  ('footer_address_line1', 'R. Benjamin Constant, 61 - Sala 515, 5º andar'),
  ('footer_address_line2', 'Centro, São Vicente - SP, 11310-500'),
  ('footer_phone', '(13) 99675-3432'),
  ('footer_email', 'contato@melrodrigues.com.br'),
  ('footer_hours_line1', 'Seg – Sex: 9h às 19h'),
  ('footer_hours_line2', 'Sáb: 9h às 15h')
on conflict (key) do nothing;

-- ==========================================================================
-- site_services — Tabela de Preço (sessões avulsas de depilação a laser).
-- ==========================================================================
create table public.site_services (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  note text,
  price numeric not null,
  original numeric,
  installment numeric,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.site_services enable row level security;

create policy "public read site_services" on public.site_services
  for select using (true);
create policy "admin insert site_services" on public.site_services
  for insert to authenticated with check (true);
create policy "admin update site_services" on public.site_services
  for update to authenticated using (true) with check (true);
create policy "admin delete site_services" on public.site_services
  for delete to authenticated using (true);

grant select on public.site_services to anon, authenticated;
grant insert, update, delete on public.site_services to authenticated;

insert into public.site_services (name, note, price, original, installment, sort_order) values
  ('Rosto completo', '(inclui mento, buço e pescoço)', 100.00, 110.00, 55.00, 1),
  ('Axilas', '', 90.00, 100.00, 50.00, 2),
  ('Virilha simples', '(Linha do biquíni)', 100.00, 110.00, 55.00, 3),
  ('Virilha completa', '(biquíni, monte vênus, lábios, perianal)', 160.00, 180.00, 90.00, 4),
  ('Meia perna', '', 100.00, 110.00, 55.00, 5),
  ('Pernas inteiras', '(inclui pés e dedos)', 180.00, 200.00, 100.00, 6),
  ('Glúteos', '', 90.00, 100.00, 50.00, 7),
  ('Lombar', '', 50.00, 60.00, 30.00, 8),
  ('Costas inteira', '', 120.00, 130.00, 65.00, 9),
  ('Peitoral', '', 80.00, 90.00, 45.00, 10),
  ('Abdômem completo', '', 100.00, 110.00, 55.00, 11),
  ('Braços', '(inclui mãos e dedos)', 150.00, 160.00, 80.00, 12),
  ('Mãos e dedos', '', 50.00, 60.00, 30.00, 13),
  ('Pés e dedos', '', 60.00, 70.00, 35.00, 14),
  ('Linha alba', '', 40.00, 50.00, 25.00, 15),
  ('Buço', '', 25.00, 30.00, 15.00, 16),
  ('Mento e buço', '', 50.00, 60.00, 30.00, 17),
  ('Colo e aréola', '', 80.00, 90.00, 45.00, 18),
  ('Coxa inteira', '', 100.00, 110.00, 55.00, 19);

-- ==========================================================================
-- site_combos — pacotes combinados (Tabela de Preço).
-- ==========================================================================
create table public.site_combos (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  title text not null,
  price_from numeric not null,
  price_to numeric not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.site_combos enable row level security;

create policy "public read site_combos" on public.site_combos
  for select using (true);
create policy "admin insert site_combos" on public.site_combos
  for insert to authenticated with check (true);
create policy "admin update site_combos" on public.site_combos
  for update to authenticated using (true) with check (true);
create policy "admin delete site_combos" on public.site_combos
  for delete to authenticated using (true);

grant select on public.site_combos to anon, authenticated;
grant insert, update, delete on public.site_combos to authenticated;

insert into public.site_combos (label, title, price_from, price_to, sort_order) values
  ('Combo 1', 'Axilas + Virilha completa', 250.00, 230.00, 1),
  ('Combo 2', 'Virilha completa + Pernas inteiras', 350.00, 300.00, 2),
  ('Combo 3', 'Axilas + Virilha completa + Meia perna', 350.00, 330.00, 3),
  ('Combo 4', 'Axilas + Virilha completa + Pernas inteiras', 420.00, 380.00, 4),
  ('Combo 5', 'Virilha completa + Meia perna', 280.00, 250.00, 5),
  ('Combo 6', 'Sessão de Axilas + Meia perna', 200.00, 180.00, 6),
  ('Combo 7', 'Buço + Axilas', 130.00, 110.00, 7);

-- ==========================================================================
-- Storage — bucket público pras imagens editáveis do site (Hero, Clínica).
-- Diferente do "patient-photos" (privado): aqui qualquer visitante do site
-- precisa conseguir ver a imagem, sem URL assinada expirando.
-- ==========================================================================
insert into storage.buckets (id, name, public)
values ('site-images', 'site-images', true)
on conflict (id) do nothing;

create policy "public read site images" on storage.objects
  for select using (bucket_id = 'site-images');
create policy "admin write site images" on storage.objects
  for insert to authenticated with check (bucket_id = 'site-images');
create policy "admin update site images" on storage.objects
  for update to authenticated using (bucket_id = 'site-images');
create policy "admin delete site images" on storage.objects
  for delete to authenticated using (bucket_id = 'site-images');
