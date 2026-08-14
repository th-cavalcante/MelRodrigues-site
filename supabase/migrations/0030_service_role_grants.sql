-- MR Laser — Corrige bug real em produção: as Edge Functions do fluxo de
-- assinatura (send-signature-otp, verify-signature-otp, finalize-signature)
-- usam o client de service_role pra ler/escrever direto nas tabelas (em vez
-- de passar por uma RPC SECURITY DEFINER, que roda com o dono da função).
-- Neste projeto, service_role NÃO recebe privilégios automaticamente em
-- tabelas novas — cada tabela sempre precisou de GRANT explícito (o mesmo
-- padrão já usado em rental_bookings na migration 0027). Faltou fazer isso
-- nas tabelas novas da 0028, o que quebrava silenciosamente a geração do
-- código de verificação ("Não foi possível gerar o código.").
-- Rodar no SQL Editor do projeto Supabase (Dashboard > SQL Editor > New query).

grant select, insert, update on public.document_versions to service_role;
grant select, insert, update on public.signature_otp_codes to service_role;
grant select, insert, update on public.signature_audit_log to service_role;
grant select, insert, update on public.document_signatures to service_role;
grant select, insert, update on public.rental_document_signatures to service_role;
