-- MR Laser — Permite escolher entre pagar o valor total do curso ou 50%
-- de sinal pra reservar a vaga.
-- Rodar no SQL Editor do projeto Supabase (Dashboard > SQL Editor > New query).

alter table public.course_orders
  add column if not exists payment_option text not null default 'total' check (payment_option in ('total', 'sinal')),
  add column if not exists course_price numeric;
