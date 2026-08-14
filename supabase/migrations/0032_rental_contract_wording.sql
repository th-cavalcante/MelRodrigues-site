-- MR Laser — Ajustes de texto pedidos pela clínica:
-- 1) o link no template de WhatsApp da Locação passa pra linha de baixo
--    (mais fácil de tocar no link no celular).
-- Rodar no SQL Editor do projeto Supabase (Dashboard > SQL Editor > New query).

update public.message_templates
set body = E'{{nome}}, segue o link para assinatura do contrato de locação do equipamento Hakon 4D:\n{{link}}'
where key = 'rental_contract';
