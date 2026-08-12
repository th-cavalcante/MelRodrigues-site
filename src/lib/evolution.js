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

/** Desconecta o WhatsApp da clínica (a instância continua existindo,
 * precisa escanear o QR Code de novo pra reconectar). */
export const disconnectWhatsApp = () => invokeEvolution('disconnect');

const invokeSendMessage = async (body) => {
  const { data, error } = await supabase.functions.invoke('send-whatsapp-message', { body });
  if (error) {
    let message = error.message;
    try {
      if (error.context && typeof error.context.json === 'function') {
        const parsed = await error.context.json();
        if (parsed?.error) message = parsed.error;
      }
    } catch (parseErr) {
      console.error('Erro ao ler detalhe do erro da Edge Function:', parseErr);
    }
    throw new Error(message);
  }
  return data;
};

/** Dispara manualmente uma mensagem de lembrete de teste pro paciente de um
 * agendamento específico, via WhatsApp já conectado. */
export const sendTestReminder = (bookingId) => invokeSendMessage({ templateKey: 'test_reminder', bookingId });

/** Dispara a mensagem de aniversário pra um paciente específico. */
export const sendBirthdayMessage = (patientId) => invokeSendMessage({ templateKey: 'birthday', patientId });

/** Manda o link de assinatura de Contrato/Termo pro paciente via WhatsApp. */
export const sendDocumentSignatureLink = (patientId, link) =>
  invokeSendMessage({ templateKey: 'document_signature_link', patientId, link });

/** Manda o link da Ficha de Anamnese pro paciente via WhatsApp. */
export const sendFichaLink = (patientId, link) =>
  invokeSendMessage({ templateKey: 'ficha_link', patientId, link });

/** Manda o contrato de locação do Hakon 4D pro cliente via WhatsApp. */
export const sendRentalContract = (rentalClientId) =>
  invokeSendMessage({ templateKey: 'rental_contract', rentalClientId });

/** Manda a confirmação do endereço de locação pro cliente via WhatsApp. */
export const sendRentalAddress = (rentalClientId) =>
  invokeSendMessage({ templateKey: 'rental_address', rentalClientId });
