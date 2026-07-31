import { supabase } from './supabaseClient';

/** Templates editáveis das mensagens automáticas de WhatsApp (confirmação
 * pós-pagamento, lembrete de teste, aniversário), gerenciados em Marketing. */
export const fetchMessageTemplates = async () => {
  const { data, error } = await supabase
    .from('message_templates')
    .select('key, label, body')
    .order('key', { ascending: true });
  if (error) throw error;
  return data;
};

export const updateMessageTemplate = async (key, body) => {
  const { error } = await supabase
    .from('message_templates')
    .update({ body, updated_at: new Date().toISOString() })
    .eq('key', key);
  if (error) throw error;
};
