import { supabase } from './supabaseClient';

/** Chama a Edge Function que cria a preferência de pagamento no Mercado
 * Pago (Checkout Pro) e devolve a URL de checkout (init_point) pra onde
 * o navegador deve ser redirecionado. O Access Token nunca fica no
 * front-end — só a Edge Function conhece esse segredo. */
export const createMpPreference = async ({ bookingId, description, amount }) => {
  const { data, error } = await supabase.functions.invoke('create-mp-preference', {
    body: {
      bookingId,
      description,
      amount,
      siteUrl: window.location.origin,
    },
  });
  if (error) throw error;
  if (!data?.initPoint) throw new Error('Não foi possível iniciar o pagamento.');
  return data.initPoint;
};
