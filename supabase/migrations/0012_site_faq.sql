-- MR Laser — CMS: Perguntas Frequentes (FAQ) editável pelo painel
-- administrativo. Rodar no SQL Editor do projeto Supabase.

create table public.site_faq (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.site_faq enable row level security;

create policy "public read site_faq" on public.site_faq
  for select using (true);
create policy "admin insert site_faq" on public.site_faq
  for insert to authenticated with check (true);
create policy "admin update site_faq" on public.site_faq
  for update to authenticated using (true) with check (true);
create policy "admin delete site_faq" on public.site_faq
  for delete to authenticated using (true);

grant select on public.site_faq to anon, authenticated;
grant insert, update, delete on public.site_faq to authenticated;

insert into public.site_faq (question, answer, sort_order) values
  ('Preciso de avaliação antes de iniciar um tratamento?', 'Sim. Toda jornada começa com uma avaliação individual, onde entendemos seu histórico, objetivos e indicamos o protocolo mais adequado.', 1),
  ('A depilação a laser funciona para todos os tipos de pele?', 'Nossos equipamentos possuem tecnologia adaptável, permitindo atendimento seguro e eficaz para diferentes tons de pele e tipos de pelo.', 2),
  ('Quantas sessões são necessárias para ver resultados?', 'Varia conforme o tratamento e o objetivo. Em média, os primeiros resultados perceptíveis aparecem entre a 3ª e a 6ª sessão.', 3),
  ('Os procedimentos doem?', 'A grande maioria dos tratamentos é indolor ou causa apenas um desconforto leve e passageiro, sempre explicado antes de começar.', 4),
  ('Qual o tempo de recuperação?', 'A maior parte dos procedimentos não exige repouso — você pode retomar suas atividades normalmente no mesmo dia.', 5),
  ('Como faço para agendar uma avaliação?', 'Basta clicar em "Agendar Avaliação" no topo da página ou entrar em contato pelo Instagram ou telefone informados no rodapé.', 6);
