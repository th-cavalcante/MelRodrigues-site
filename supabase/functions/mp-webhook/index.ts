// Edge Function — recebe as notificações (webhook) do Mercado Pago,
// confirma o status real do pagamento consultando a API do MP, e
// atualiza o agendamento correspondente (via external_reference).
//
// Segredo necessário (definir com `supabase secrets set MP_ACCESS_TOKEN=...`):
//   MP_ACCESS_TOKEN — Access Token da aplicação no Mercado Pago Developers.
// SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY já vêm prontos no ambiente
// das Edge Functions, não precisam ser configurados manualmente.
//
// Deploy: supabase functions deploy mp-webhook --no-verify-jwt
// Configurar essa URL como webhook no painel do Mercado Pago
// (Developers > Sua aplicação > Webhooks > URL de produção).

import { serve } from 'https://deno.land/std@0.190.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  try {
    const url = new URL(req.url);
    let paymentId = url.searchParams.get('data.id') || url.searchParams.get('id');

    if (req.method === 'POST') {
      try {
        const body = await req.json();
        paymentId = body?.data?.id || paymentId;
      } catch (_err) {
        // corpo vazio ou não-JSON — segue com o que veio na query string
      }
    }

    if (!paymentId) {
      return new Response('ok', { status: 200 });
    }

    const accessToken = Deno.env.get('MP_ACCESS_TOKEN');
    const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!mpRes.ok) {
      console.error('Falha ao consultar pagamento no Mercado Pago:', await mpRes.text());
      return new Response('ok', { status: 200 });
    }

    const payment = await mpRes.json();
    const bookingId = payment.external_reference;
    if (!bookingId) {
      return new Response('ok', { status: 200 });
    }

    // Pix chega com payment_type_id "bank_transfer" — o método real está
    // em payment_method_id ("pix"). Cartão/boleto usam payment_type_id mesmo.
    const cardTypeMap = { credit_card: 'Cartão', debit_card: 'Cartão', ticket: 'Boleto' };
    const paymentMethod = payment.payment_method_id === 'pix' ? 'Pix' : cardTypeMap[payment.payment_type_id] || null;

    // A Agenda Online só cobra o sinal de 50% — nunca o valor cheio — então
    // um pagamento aprovado por aqui sempre vira "Pago Sinal 50%", nunca "Pago".
    const updates = {
      mp_payment_id: String(payment.id),
      payment_status: payment.status === 'approved' ? 'Pago Sinal 50%' : 'Pendente',
      payment_method: paymentMethod,
    };
    if (payment.status === 'approved') {
      updates.status = 'confirmado';
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { error } = await supabaseAdmin.from('bookings').update(updates).eq('id', bookingId);
    if (error) console.error('Erro ao atualizar agendamento a partir do webhook:', error);

    return new Response('ok', { status: 200 });
  } catch (err) {
    console.error('Erro inesperado em mp-webhook:', err);
    return new Response('ok', { status: 200 });
  }
});
