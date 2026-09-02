-- MR Laser — Controle de pacote de sessões de Drenagem (Dreno Relaxante):
-- quando a cliente compra um pacote (ex: "Pacote com 4 sessões"), guarda o
-- total; a cada sessão confirmada pela cliente, desconta 1 do saldo. Também
-- guarda a data da última sessão confirmada, pra exibir na Ficha do Cliente
-- e na Agenda sem precisar buscar em public.sessions toda vez.
-- Rodar no SQL Editor do projeto Supabase (Dashboard > SQL Editor > New query).

alter table public.patients
  add column if not exists dreno_package_total int,
  add column if not exists dreno_sessions_remaining int,
  add column if not exists last_session_confirmed_at timestamptz;

-- confirm_session passa a: 1) marcar a sessão como confirmada (como já
-- fazia), 2) atualizar a data da última sessão confirmada da paciente, e
-- 3) descontar 1 do saldo do pacote de drenagem, se ela tiver um ativo.
create or replace function public.confirm_session(p_session_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_patient_id uuid;
begin
  select patient_id into v_patient_id from public.sessions where id = p_session_id;
  if v_patient_id is null then
    raise exception 'Sessão não encontrada';
  end if;

  update public.sessions set confirmed_at = now() where id = p_session_id;

  update public.patients
  set
    last_session_confirmed_at = now(),
    dreno_sessions_remaining = case
      when dreno_sessions_remaining is not null and dreno_sessions_remaining > 0
      then dreno_sessions_remaining - 1
      else dreno_sessions_remaining
    end
  where id = v_patient_id;
end;
$$;
