-- O Termo de Consentimento (texto real da empresa) precisa de Data de
-- Nascimento e Sexo pra preencher automaticamente, mas get_patient_for_docs
-- não retornava essas colunas (só eram usadas no Contrato, que não precisa
-- delas). Recria a função incluindo birthdate/sex.
create or replace function public.get_patient_for_docs(p_patient_id uuid)
returns table (
  name text,
  cpf text,
  phone text,
  street text,
  neighborhood text,
  city text,
  cep text,
  birthdate date,
  sex text
)
language sql
security definer
set search_path = public
as $$
  select name, cpf, phone, street, neighborhood, city, cep, birthdate, sex
  from public.patients
  where id = p_patient_id;
$$;

revoke all on function public.get_patient_for_docs from public;
grant execute on function public.get_patient_for_docs to anon, authenticated;
