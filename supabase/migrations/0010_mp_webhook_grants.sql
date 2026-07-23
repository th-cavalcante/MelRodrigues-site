-- MR Laser — libera a Edge Function "mp-webhook" (que roda como service_role)
-- pra atualizar o status de pagamento dos agendamentos.
-- Rodar no SQL Editor do projeto Supabase (Dashboard > SQL Editor > New query).

grant select, update on public.bookings to service_role;
