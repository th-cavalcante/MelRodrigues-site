-- MR Laser — troca as opções de status de pagamento: adiciona "Pago Sinal
-- 50%" (usado tanto manualmente quanto automaticamente pelo webhook do
-- Mercado Pago, já que a Agenda Online só cobra o sinal de 50%) e remove
-- "Faturado no plano" (não usado por nenhum agendamento).
-- Rodar no SQL Editor do projeto Supabase (Dashboard > SQL Editor > New query).

alter table public.bookings drop constraint bookings_payment_status_check;
alter table public.bookings add constraint bookings_payment_status_check
  check (payment_status in ('Pago', 'Pago Sinal 50%', 'Pendente'));
