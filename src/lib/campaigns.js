import { supabase } from './supabaseClient';

export const fetchCampaigns = async () => {
  const { data, error } = await supabase
    .from('campaigns')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
};

export const createCampaign = async ({ title, messageBody, audience, targetCount }) => {
  const { data, error } = await supabase
    .from('campaigns')
    .insert({ title, message_body: messageBody, audience, target_count: targetCount })
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const triggerCampaignSend = async (campaignId) => {
  const { data, error } = await supabase.functions.invoke('send-campaign', { body: { campaignId } });
  if (error) {
    let message = error.message;
    try {
      if (error.context && typeof error.context.json === 'function') {
        const body = await error.context.json();
        if (body?.error) message = body.error;
      }
    } catch (parseErr) {
      console.error('Erro ao ler detalhe do erro da Edge Function:', parseErr);
    }
    throw new Error(message);
  }
  return data;
};
