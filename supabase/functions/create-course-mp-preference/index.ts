// Edge Function — cria a preferência de pagamento no Mercado Pago (Checkout
// Pro) pra inscrição no Curso de Depilação a Laser, e devolve a URL de
// checkout (init_point) pra onde o navegador deve ser redirecionado.
//
// O preço nunca vem do frontend — é definido aqui pelo plan_key, pra não
// dar pra manipular o valor cobrado a partir do navegador.
//
// Segredo necessário: MP_ACCESS_TOKEN (mesmo já usado por create-mp-preference).
//
// Função pública (cliente anônimo comprando o curso) — deploy com --no-verify-jwt.
// Deploy: supabase functions deploy create-course-mp-preference --no-verify-jwt

import { serve } from 'https://deno.land/std@0.190.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

const PLANS: Record<string, { price: number; label: string }> = {
  turma: { price: 999.9, label: 'Curso em Turma — Depilação a Laser' },
  individual: { price: 1499.9, label: 'Mentoria Individual — Depilação a Laser' },
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { planKey, name, email, phone, siteUrl } = (await req.json()) as {
      planKey: string;
      name: string;
      email: string;
      phone: string;
      siteUrl: string;
    };

    const plan = PLANS[planKey];
    if (!plan) return jsonResponse({ error: 'Modalidade inválida.' }, 400);
    if (!name?.trim() || !email?.trim() || !phone?.trim()) {
      return jsonResponse({ error: 'Preencha nome, e-mail e WhatsApp.' }, 400);
    }
    if (!siteUrl) return jsonResponse({ error: 'Dados incompletos para gerar o pagamento.' }, 400);

    const accessToken = Deno.env.get('MP_ACCESS_TOKEN');
    if (!accessToken) {
      console.error('MP_ACCESS_TOKEN não configurado nos secrets da função.');
      return jsonResponse({ error: 'Pagamento online temporariamente indisponível.' }, 500);
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: order, error: insertError } = await supabaseAdmin
      .from('course_orders')
      .insert({
        plan_key: planKey,
        amount: plan.price,
        customer_name: name.trim(),
        customer_email: email.trim(),
        customer_phone: phone.trim(),
      })
      .select()
      .single();

    if (insertError || !order) {
      console.error('Erro ao criar pedido do curso:', insertError);
      return jsonResponse({ error: 'Não foi possível iniciar a inscrição.' }, 500);
    }

    const nameParts = name.trim().split(/\s+/).filter(Boolean);

    const preference = {
      items: [
        {
          title: plan.label,
          description: plan.label,
          quantity: 1,
          unit_price: plan.price,
          currency_id: 'BRL',
        },
      ],
      payer: {
        first_name: nameParts[0],
        last_name: nameParts.slice(1).join(' ') || nameParts[0],
        email: email.trim(),
      },
      external_reference: `curso:${order.id}`,
      back_urls: {
        success: `${siteUrl}/cursos?curso_order=${order.id}&curso_status=approved`,
        pending: `${siteUrl}/cursos?curso_order=${order.id}&curso_status=pending`,
        failure: `${siteUrl}/cursos?curso_order=${order.id}&curso_status=failure`,
      },
      ...(siteUrl.startsWith('https://') ? { auto_return: 'approved' } : {}),
      notification_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/mp-webhook`,
    };

    const mpRes = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify(preference),
    });

    const mpData = await mpRes.json();

    if (!mpRes.ok) {
      console.error('Erro ao criar preferência no Mercado Pago:', mpData);
      return jsonResponse({ error: mpData.message || 'Erro ao iniciar o pagamento.' }, 502);
    }

    return jsonResponse({ initPoint: mpData.init_point, orderId: order.id });
  } catch (err) {
    console.error('Erro inesperado em create-course-mp-preference:', err);
    return jsonResponse({ error: 'Erro interno ao iniciar o pagamento.' }, 500);
  }
});
