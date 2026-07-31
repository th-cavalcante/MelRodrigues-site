-- As Edge Functions rodam como service_role, mas nesse projeto o
-- service_role não ganha acesso automático às tabelas — precisa de GRANT
-- explícito (mesmo padrão já usado em 0010_mp_webhook_grants.sql pra
-- bookings). Faltava isso pra patients/message_templates/campaigns, o que
-- quebrava qualquer função que precisasse ler o telefone/nome do paciente
-- (send-whatsapp-message, mp-webhook, send-campaign) com
-- "permission denied for table patients".

grant select on public.patients to service_role;
grant select on public.message_templates to service_role;
grant select, update on public.campaigns to service_role;
