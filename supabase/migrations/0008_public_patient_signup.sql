-- MR Laser — Agenda Online agora usa um link único e genérico (não mais
-- um link por paciente). Quem chega pelo link se identifica com nome e
-- celular no próprio fluxo, e essa função cria o registro de paciente
-- (mesma linha que a ficha de anamnese/admin usam depois).
-- Rodar no SQL Editor do projeto Supabase (Dashboard > SQL Editor > New query).

create or replace function public.create_public_patient(
  p_name text,
  p_phone text
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_patient_id uuid;
begin
  insert into public.patients (name, phone)
  values (p_name, p_phone)
  returning id into v_patient_id;

  return v_patient_id;
end;
$$;

revoke all on function public.create_public_patient(text, text) from public;
grant execute on function public.create_public_patient(text, text) to anon, authenticated;
