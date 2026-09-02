-- MR Laser — Remove a tabela complementary_services (Serviços
-- Complementares "só do agendamento"), agora substituída por
-- site_complementary_cards/site_complementary_card_items: o agendamento
-- passa a usar os mesmos cards/preços já editáveis na Tabela de Preço do
-- site, em vez de uma lista separada e duplicada. Os dois registros dela
-- (Limpeza de Pele, Drenagem Linfática) nunca tiveram preço preenchido
-- (ficaram em R$ 0), então não há dado real a perder.
-- Rodar no SQL Editor do projeto Supabase (Dashboard > SQL Editor > New query).

drop table if exists public.complementary_services;
