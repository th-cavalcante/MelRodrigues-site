-- MR Laser — Financeiro (forma de pagamento por agendamento)
-- Rodar no SQL Editor do projeto Supabase (Dashboard > SQL Editor > New query).

alter table public.bookings add column if not exists payment_method text
  check (payment_method in ('Cartão', 'Pix', 'Dinheiro', 'Boleto'));
