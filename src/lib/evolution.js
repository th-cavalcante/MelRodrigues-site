import { supabase } from './supabaseClient';

const invokeEvolution = async (action) => {
  const { data, error } = await supabase.functions.invoke('evolution-connect', { body: { action } });
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

/** Consulta o estado atual da conexão do WhatsApp da clínica, sem gerar QR. */
export const getWhatsAppStatus = () => invokeEvolution('status');

/** Cria a instância (se ainda não existir) ou gera um QR Code novo pra
 * escanear. Se já estiver conectado, devolve state:'open' sem QR. */
export const getWhatsAppQrCode = () => invokeEvolution('qrcode');

/** Dispara manualmente uma mensagem de lembrete de teste pro paciente de um
 * agendamento específico, via WhatsApp já conectado. */
export const sendTestReminder = async (bookingId) => {
  const { data, error } = await supabase.functions.invoke('send-whatsapp-message', { body: { bookingId } });
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
