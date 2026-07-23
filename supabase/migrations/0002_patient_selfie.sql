-- Permite que o paciente (anon), logo após salvar a ficha de anamnese,
-- envie uma selfie que vira a foto de avatar dele em Clientes e Sessões.
-- Rodar no SQL Editor do projeto Supabase.

-- Storage: anon pode enviar arquivos pro bucket de fotos (mas não ler,
-- listar, sobrescrever nem apagar — só inserir um arquivo novo).
create policy "anon can upload patient photos" on storage.objects
  for insert to anon
  with check (bucket_id = 'patient-photos');

-- RPC: registra a foto enviada como avatar do paciente (mesma lógica das
-- outras funções — SECURITY DEFINER, opera só na linha do patient_id
-- recebido, nunca faz SELECT geral).
create or replace function public.submit_avatar_photo(
  p_patient_id uuid,
  p_storage_path text
) returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (select 1 from public.patients where id = p_patient_id) then
    raise exception 'Paciente não encontrado';
  end if;

  insert into public.photos (patient_id, session_id, kind, storage_path)
  values (p_patient_id, null, 'avatar', p_storage_path);
end;
$$;

revoke all on function public.submit_avatar_photo from public;
grant execute on function public.submit_avatar_photo to anon, authenticated;
