-- Completa os 6 cards de automação (igual ao mockup Teagá) com templates
-- editáveis pra todos, mesmo os 3 que ainda não têm envio automático
-- implementado (satisfaction_survey, inactive_clients, post_appointment) —
-- a edição já funciona pra todos, o disparo automático deles é etapa futura.

insert into public.message_templates (key, label, body) values
  ('satisfaction_survey', 'Pesquisa de satisfação',
   E'Olá {{nome}}! Como foi sua experiência na MR Laser? Adoraríamos saber sua opinião sobre o atendimento.'),
  ('inactive_clients', 'Clientes inativos',
   E'Olá {{nome}}! Sentimos sua falta na MR Laser 💛 Que tal agendar uma nova sessão?'),
  ('post_appointment', 'Pós-atendimento',
   E'Olá {{nome}}! Lembre-se dos cuidados pós-sessão: https://www.melrodrigues.com.br/recomendacoes');
