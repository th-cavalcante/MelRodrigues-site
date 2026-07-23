-- MR Laser — integração de pagamento real via Mercado Pago (Checkout Pro).
-- Rodar no SQL Editor do projeto Supabase (Dashboard > SQL Editor > New query).

alter table public.bookings
  add column if not exists mp_payment_id text;

-- A Edge Function "mp-webhook" atualiza payment_status/status/payment_method
-- usando a Service Role Key (bypassa RLS), então nenhuma policy nova é
-- necessária pra anon/authenticated aqui.
