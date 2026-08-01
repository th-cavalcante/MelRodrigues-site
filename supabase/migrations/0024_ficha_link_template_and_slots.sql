-- Mensagem enviada ao clicar em "Enviar Link" da Ficha de Anamnese
-- (BookingDrawer, card da Agenda) — agora via WhatsApp automático em vez
-- de só copiar o link.
insert into public.message_templates (key, label, body, description, active, is_custom) values (
  'ficha_link',
  'Link da Ficha de Anamnese',
  E'{{nome}}, segue o link para preencher sua ficha de anamnese: {{link}}',
  'Enviado ao clicar em "Enviar Link" da Anamnese, no card do agendamento.',
  true, false
);
