-- Cria automaticamente uma sessão em "Clientes e Sessões" quando um
-- agendamento vira "confirmado" — com a data do atendimento e as regiões
-- (serviço) já pré-preenchidas, pra o admin só completar com fotos/notas no
-- dia. Funciona tanto quando o admin confirma manualmente na Agenda quanto
-- quando o webhook do Mercado Pago confirma um pagamento online.

alter table public.sessions add column if not exists booking_id uuid references public.bookings(id) on delete set null;
alter table public.sessions add column if not exists service text;

-- Serviço complementar (Limpeza de Pele, Drenagem Linfática) — separado do
-- serviço de depilação a laser pra não interferir no cálculo de valor nem
-- no parse dos "slots" de região usados no card de edição do agendamento.
alter table public.bookings add column if not exists complementary_service text;

create or replace function public.auto_create_session_on_confirm()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_next_num int;
  v_was_confirmed boolean;
begin
  v_was_confirmed := (TG_OP = 'UPDATE' and OLD.status = 'confirmado');

  if NEW.status = 'confirmado' and not v_was_confirmed then
    if not exists (select 1 from public.sessions where booking_id = NEW.id) then
      select coalesce(max(session_num), 0) + 1 into v_next_num
      from public.sessions where patient_id = NEW.patient_id;

      insert into public.sessions (patient_id, session_num, session_date, service, booking_id, obs)
      values (NEW.patient_id, v_next_num, NEW.booking_date, NEW.service, NEW.id, '');
    end if;
  end if;

  return NEW;
end;
$$;

drop trigger if exists trg_auto_create_session on public.bookings;
create trigger trg_auto_create_session
  after insert or update on public.bookings
  for each row execute function public.auto_create_session_on_confirm();
