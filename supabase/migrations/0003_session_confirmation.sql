-- Permite que o paciente confirme uma sessão específica através de um link
-- público (bearer token = session id), sem precisar de login.
-- Rodar no SQL Editor do projeto Supabase.

alter table public.sessions add column if not exists confirmed_at timestamptz;

-- página pública busca os dados mínimos da sessão pra exibir o convite de confirmação
create or replace function public.get_session_for_confirmation(p_session_id uuid)
returns table (
  session_num int,
  session_date date,
  patient_name text,
  confirmed_at timestamptz
)
language sql
security definer
set search_path = public
as $$
  select s.session_num, s.session_date, p.name, s.confirmed_at
  from public.sessions s
  join public.patients p on p.id = s.patient_id
  where s.id = p_session_id;
$$;

revoke all on function public.get_session_for_confirmation from public;
grant execute on function public.get_session_for_confirmation to anon, authenticated;

-- paciente confirma a sessão
create or replace function public.confirm_session(p_session_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (select 1 from public.sessions where id = p_session_id) then
    raise exception 'Sessão não encontrada';
  end if;

  update public.sessions set confirmed_at = now() where id = p_session_id;
end;
$$;

revoke all on function public.confirm_session from public;
grant execute on function public.confirm_session to anon, authenticated;
