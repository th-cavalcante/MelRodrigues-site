import { supabase } from './supabaseClient';

/** Templates editáveis das mensagens automáticas de WhatsApp (automações
 * de Marketing: confirmação pós-pagamento, lembretes por tempo, aniversário
 * e automações criadas pela clínica). */
export const fetchMessageTemplates = async () => {
  const { data, error } = await supabase
    .from('message_templates')
    .select('key, label, body, description, hours_before, active, is_custom')
    .order('key', { ascending: true });
  if (error) throw error;
  return data;
};

/** Atualiza o texto da mensagem e, quando informado, quantas horas antes
 * do agendamento a automação deve disparar. */
export const updateAutomation = async (key, { body, hoursBefore }) => {
  const updates = { body, updated_at: new Date().toISOString() };
  if (hoursBefore !== undefined) updates.hours_before = hoursBefore;
  const { error } = await supabase.from('message_templates').update(updates).eq('key', key);
  if (error) throw error;
};

export const setAutomationActive = async (key, active) => {
  const { error } = await supabase.from('message_templates').update({ active }).eq('key', key);
  if (error) throw error;
};

const slugify = (text) =>
  text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 30);

/** Cria uma nova automação por tempo (o único gatilho automático que o
 * sistema sabe disparar hoje: "X horas antes do agendamento"). */
export const createAutomation = async ({ label, description, hoursBefore, body }) => {
  const key = `custom_${slugify(label) || 'automacao'}_${Date.now().toString(36)}`;
  const { data, error } = await supabase
    .from('message_templates')
    .insert({ key, label, description, hours_before: hoursBefore, body, active: true, is_custom: true })
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const deleteAutomation = async (key) => {
  const { error } = await supabase.from('message_templates').delete().eq('key', key);
  if (error) throw error;
};
