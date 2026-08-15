import { supabase } from './supabaseClient';

/** Chama a Edge Function que cria o pedido do curso + a preferência de
 * pagamento no Mercado Pago, e devolve { initPoint, orderId }. O preço é
 * definido no servidor a partir do planKey — nunca confia em valor vindo
 * do navegador. */
export const createCourseMpPreference = async ({ planKey, name, email, phone }) => {
  const { data, error } = await supabase.functions.invoke('create-course-mp-preference', {
    body: { planKey, name, email, phone, siteUrl: window.location.origin },
  });
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
  if (!data?.initPoint) throw new Error('Não foi possível iniciar o pagamento.');
  return data;
};
