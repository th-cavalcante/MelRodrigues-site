-- MR Laser — status do pagamento pra tela de sucesso da Agenda Online.
-- Rodar no SQL Editor do projeto Supabase (Dashboard > SQL Editor > New query).

-- Pix não aprova na hora: o Mercado Pago devolve o navegador pro site com
-- status "pending" assim que o QR é gerado, e a aprovação real chega minutos
-- depois via webhook. Essa RPC deixa a tela de sucesso reconsultar o status
-- real do agendamento (só o essencial, nada sensível) até virar "Pago".
create or replace function public.get_booking_payment_status(p_booking_id uuid)
returns table(status text, payment_status text)
language sql
security definer
set search_path = public
as $$
  select status, payment_status from public.bookings where id = p_booking_id;
$$;

revoke all on function public.get_booking_payment_status from public;
grant execute on function public.get_booking_payment_status to anon, authenticated;
