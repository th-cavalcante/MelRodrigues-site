import { supabase } from './supabaseClient';

const invokeFn = async (name, body) => {
  const { data, error } = await supabase.functions.invoke(name, { body });
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

/** Registra eventos "leves" da trilha de auditoria (visualizou, confirmou leitura). */
export const logSignatureEvent = async (subjectType, subjectId, eventType) => {
  const { error } = await supabase.rpc('log_signature_event', {
    p_subject_type: subjectType,
    p_subject_id: subjectId,
    p_event_type: eventType,
  });
  if (error) console.error('Erro ao registrar evento de auditoria:', error);
};

/** Dispara o código de verificação por WhatsApp. Retorna { destinationMasked }. */
export const sendSignatureOtp = (subjectType, subjectId) => invokeFn('send-signature-otp', { subjectType, subjectId });

/** Confirma o código. Retorna { signingToken, signatureId }. */
export const verifySignatureOtp = (subjectType, subjectId, code) =>
  invokeFn('verify-signature-otp', { subjectType, subjectId, code });

/**
 * Conclui a assinatura: envia o PDF final (base64) pro servidor calcular o
 * hash, armazenar e gravar a trilha de auditoria. Retorna
 * { signatureId, documentHash, pdfStoragePath, versionNumber }.
 */
export const finalizeSignature = ({ subjectType, subjectId, signingToken, bodySnapshot, signerName, signatureDataUrl, pdfBase64 }) =>
  invokeFn('finalize-signature', { subjectType, subjectId, signingToken, bodySnapshot, signerName, signatureDataUrl, pdfBase64 });

/** Página pública /validar/:signatureId. */
export const getSignatureForValidation = async (signatureId) => {
  const { data, error } = await supabase.rpc('get_signature_for_validation', { p_signature_id: signatureId });
  if (error) throw error;
  return data && data[0] ? data[0] : null;
};

/** Admin confirma a assinatura da locadora antes de enviar o contrato pro cliente. */
export const signRentalAsLandlord = async (rentalBookingId) => {
  const { error } = await supabase.rpc('sign_rental_as_landlord', { p_rental_booking_id: rentalBookingId });
  if (error) throw error;
};

/** Trilha de auditoria de um documento — painel admin (somente leitura). */
export const listSignatureAuditLog = async (subjectType, subjectId) => {
  const { data, error } = await supabase
    .from('signature_audit_log')
    .select('*')
    .eq('subject_type', subjectType)
    .eq('subject_id', subjectId)
    .order('occurred_at', { ascending: true });
  if (error) throw error;
  return data || [];
};
