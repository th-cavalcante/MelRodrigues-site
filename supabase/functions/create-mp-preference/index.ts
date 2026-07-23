// Edge Function — cria uma preferência de pagamento no Mercado Pago
// (Checkout Pro) e devolve a URL de checkout (init_point).
//
// Segredo necessário (definir com `supabase secrets set MP_ACCESS_TOKEN=...`):
//   MP_ACCESS_TOKEN — Access Token da aplicação no Mercado Pago Developers.
//
// Deploy: supabase functions deploy create-mp-preference

import { serve } from 'https://deno.land/std@0.190.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { bookingId, description, amount, siteUrl } = await req.json();

    if (!bookingId || !amount || !siteUrl) {
      return new Response(JSON.stringify({ error: 'Dados incompletos para gerar o pagamento.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const accessToken = Deno.env.get('MP_ACCESS_TOKEN');
    if (!accessToken) {
      console.error('MP_ACCESS_TOKEN não configurado nos secrets da função.');
      return new Response(JSON.stringify({ error: 'Pagamento online temporariamente indisponível.' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const preference = {
      items: [
        {
          title: description || 'Sinal de agendamento — MR Laser',
          quantity: 1,
          unit_price: Number(amount),
          currency_id: 'BRL',
        },
      ],
      external_reference: bookingId,
      back_urls: {
        success: `${siteUrl}/cliente/agendar?mp_booking=${bookingId}&mp_status=approved`,
        pending: `${siteUrl}/cliente/agendar?mp_booking=${bookingId}&mp_status=pending`,
        failure: `${siteUrl}/cliente/agendar?mp_booking=${bookingId}&mp_status=failure`,
      },
      // auto_return exige back_urls em HTTPS público — em localhost (dev) o
      // Mercado Pago rejeita a preferência inteira se isso for enviado.
      ...(siteUrl.startsWith('https://') ? { auto_return: 'approved' } : {}),
      notification_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/mp-webhook`,
    };

    const mpRes = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(preference),
    });

    const mpData = await mpRes.json();

    if (!mpRes.ok) {
      console.error('Erro ao criar preferência no Mercado Pago:', mpData);
      return new Response(JSON.stringify({ error: mpData.message || 'Erro ao iniciar o pagamento.' }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ initPoint: mpData.init_point, preferenceId: mpData.id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Erro inesperado em create-mp-preference:', err);
    return new Response(JSON.stringify({ error: 'Erro interno ao iniciar o pagamento.' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
