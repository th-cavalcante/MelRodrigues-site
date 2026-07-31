-- Antes só dava pra excluir automações criadas pela própria clínica
-- (is_custom = true). Agora qualquer card de automação pode ser excluído,
-- inclusive os 6 originais — as Edge Functions já têm um texto padrão de
-- reserva pra quando o template correspondente não existir mais, então
-- isso não quebra o envio (só volta a usar o texto padrão).

drop policy "admin delete custom message_templates" on public.message_templates;

create policy "admin delete message_templates" on public.message_templates
  for delete to authenticated using (true);
