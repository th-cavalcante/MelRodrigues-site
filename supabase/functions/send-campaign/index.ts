// Edge Function — dispara uma campanha de marketing já criada (rascunho)
// pro público selecionado. Por enquanto só suporta o público
// "aniversariantes_mes". Manda com um intervalo entre cada mensagem pra não
// parecer comportamento de spam pro WhatsApp.
//
// Deploy: supabase functions deploy send-campaign

import { serve } from 'https://deno.land/std@0.190.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { sendWhatsAppText, formatPhoneForEvolution, fillTemplate } from '../_shared/evolution.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { campaignId } = await req.json();
    if (!campaignId) return jsonResponse({ error: 'campaignId é obrigatório.' }, 400);

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: campaign, error: campaignError } = await supabaseAdmin
      .from('campaigns')
      .select('*')
      .eq('id', campaignId)
      .maybeSingle();
    if (campaignError || !campaign) return jsonResponse({ error: 'Campanha não encontrada.' }, 404);

    let targets: { name: string | null; phone: string | null }[] = [];

    if (campaign.audience === 'aniversariantes_mes') {
      const currentMonth = String(new Date().getMonth() + 1).padStart(2, '0');
      const { data: patients } = await supabaseAdmin.from('patients').select('name, phone, birthdate');
      targets = (patients || []).filter(
        (p: any) => p.birthdate && p.phone && p.birthdate.slice(5, 7) === currentMonth
      );
    }

    let sentCount = 0;
    for (const patient of targets) {
      const phoneDigits = formatPhoneForEvolution(patient.phone);
      if (!phoneDigits) continue;
      const firstName = (patient.name || '').trim().split(/\s+/)[0] || '';
      const text = fillTemplate(campaign.message_body, { nome: firstName });

      const result = await sendWhatsAppText(phoneDigits, text);
      if (result.ok) sentCount += 1;
      else console.error('Erro ao enviar campanha pra', patient.phone, result.error);

      await delay(3000);
    }

    await supabaseAdmin
      .from('campaigns')
      .update({
        status: sentCount > 0 ? 'enviada' : 'erro',
        sent_count: sentCount,
        target_count: targets.length,
        sent_at: new Date().toISOString(),
      })
      .eq('id', campaignId);

    return jsonResponse({ success: true, sentCount, targetCount: targets.length });
  } catch (err) {
    console.error('Erro inesperado em send-campaign:', err);
    return jsonResponse({ error: 'Erro interno ao enviar a campanha.' }, 500);
  }
});
