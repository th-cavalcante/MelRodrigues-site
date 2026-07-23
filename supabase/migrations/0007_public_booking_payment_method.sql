-- MR Laser — Agenda Online: guarda a forma de pagamento escolhida no
-- passo de pagamento (ainda simulado — sem gateway real integrado).
-- Rodar no SQL Editor do projeto Supabase (Dashboard > SQL Editor > New query).

-- Adicionar parâmetro novo faz o Postgres tratar como uma função DIFERENTE
-- (overload), não uma substituição — dropamos a assinatura antiga primeiro
-- pra não deixar as duas versões coexistindo.
drop function if exists public.create_public_booking(uuid, text, date, time, numeric, text);

create or replace function public.create_public_booking(
  p_patient_id uuid,
  p_service text,
  p_booking_date date,
  p_booking_time time,
  p_valor numeric,
  p_notes text,
  p_payment_method text default null
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_patient public.patients%rowtype;
  v_session_num int;
  v_reasons text[] := array[]::text[];
  v_health_alert boolean;
  v_health_reason text;
  v_room text := 'Sala Laser Hakon 4D';
  v_booking_id uuid;
begin
  select * into v_patient from public.patients where id = p_patient_id;
  if not found then
    raise exception 'Paciente não encontrado';
  end if;

  if exists (
    select 1 from public.bookings
    where booking_date = p_booking_date and booking_time = p_booking_time
      and room = v_room and status <> 'cancelado'
  ) then
    raise exception 'Este horário acabou de ser reservado por outra pessoa. Escolha outro horário.';
  end if;

  select count(*) into v_session_num from public.bookings where patient_id = p_patient_id;
  v_session_num := v_session_num + 1;

  if (v_patient.clinical_answers ->> '13') = 'Sim' then
    v_reasons := array_append(v_reasons, 'Grávida ou amamentando');
  end if;
  if (v_patient.clinical_answers ->> '9') = 'Sim' then
    v_reasons := array_append(v_reasons, 'Uso contínuo de medicamento');
  end if;
  if (v_patient.clinical_answers ->> '10') = 'Sim' then
    v_reasons := array_append(v_reasons, 'Alergia a medicamento');
  end if;
  if (v_patient.clinical_answers ->> '11') = 'Sim' then
    v_reasons := array_append(v_reasons, 'Alergia a metais ou frio');
  end if;
  v_health_alert := coalesce(array_length(v_reasons, 1), 0) > 0;
  v_health_reason := array_to_string(v_reasons, ' · ');

  insert into public.bookings (
    patient_id, professional, room, booking_date, booking_time, service,
    equipment, session_num, valor, health_alert, health_reason, notes, status,
    payment_method
  ) values (
    p_patient_id, 'Dra. Marina Costa', v_room, p_booking_date, p_booking_time, p_service,
    'Hakon 4D', v_session_num, p_valor, v_health_alert, v_health_reason, p_notes, 'pendente',
    p_payment_method
  ) returning id into v_booking_id;

  return v_booking_id;
end;
$$;

revoke all on function public.create_public_booking(uuid, text, date, time, numeric, text, text) from public;
grant execute on function public.create_public_booking(uuid, text, date, time, numeric, text, text) to anon, authenticated;
