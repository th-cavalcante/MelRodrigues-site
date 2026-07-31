-- Mensagem enviada manualmente em Clientes e Sessões ao clicar em "Enviar
-- link para assinatura" (contrato + termo), agora via WhatsApp automático
-- em vez de só copiar o link.

insert into public.message_templates (key, label, body, description, active, is_custom) values (
  'document_signature_link',
  'Link de assinatura (Contrato e Termo)',
  E'{{nome}}, segue o link para assinatura do contrato e termo de consentimento. Ao final das assinaturas, favor tirar uma selfie para o sistema validar: {{link}}',
  'Enviado manualmente em Clientes e Sessões, ao clicar em "Enviar link para assinatura".',
  true, false
);
