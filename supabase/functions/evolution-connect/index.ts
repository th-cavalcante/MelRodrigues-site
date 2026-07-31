// Edge Function — intermedia o painel admin e a Evolution API (rodando na
// VPS própria) pra conectar o WhatsApp da clínica via QR Code. A chave da
// Evolution API nunca fica no front-end, só aqui.
//
// Segredos necessários (definir com `supabase secrets set ...`):
//   EVOLUTION_API_URL      — ex: https://evolution.melrodrigues.com.br
//   EVOLUTION_API_KEY      — apikey configurada no docker-compose da VPS
//   EVOLUTION_INSTANCE_NAME — nome fixo da instância, ex: mrlaser
//
// Diferente da função de pagamento (pública), essa é só pro admin logado —
// não usar --no-verify-jwt no deploy, deixar a verificação padrão do
// Supabase ativa.
//
// Deploy: supabase functions deploy evolution-connect

import { serve } from 'https://deno.land/std@0.190.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { action } = await req.json();

    const apiUrl = Deno.env.get('EVOLUTION_API_URL');
    const apiKey = Deno.env.get('EVOLUTION_API_KEY');
    const instanceName = Deno.env.get('EVOLUTION_INSTANCE_NAME');

    if (!apiUrl || !apiKey || !instanceName) {
      console.error('Secrets da Evolution API não configurados.');
      return jsonResponse({ error: 'Integração com WhatsApp temporariamente indisponível.' }, 500);
    }

    const evoHeaders = { 'Content-Type': 'application/json', apikey: apiKey };

    const getConnectionState = async () => {
      const res = await fetch(`${apiUrl}/instance/connectionState/${instanceName}`, { headers: evoHeaders });
      if (res.status === 404) return 'not_created';
      if (!res.ok) throw new Error(`Falha ao consultar status da conexão (${res.status}).`);
      const data = await res.json();
      return data?.instance?.state || 'close';
    };

    if (action === 'status') {
      const state = await getConnectionState();
      return jsonResponse({ state });
    }

    if (action === 'qrcode') {
      const state = await getConnectionState();

      if (state === 'open') {
        return jsonResponse({ state: 'open' });
      }

      if (state === 'not_created') {
        const res = await fetch(`${apiUrl}/instance/create`, {
          method: 'POST',
          headers: evoHeaders,
          body: JSON.stringify({ instanceName, integration: 'WHATSAPP-BAILEYS', qrcode: true }),
        });
        const data = await res.json();
        if (!res.ok) {
          console.error('Erro ao criar instância na Evolution API:', data);
          return jsonResponse({ error: 'Não foi possível iniciar a conexão com o WhatsApp.' }, 502);
        }
        return jsonResponse({ state: 'connecting', qrcode: data?.qrcode?.base64 || null });
      }

      const res = await fetch(`${apiUrl}/instance/connect/${instanceName}`, { headers: evoHeaders });
      const data = await res.json();
      if (!res.ok) {
        console.error('Erro ao gerar QR Code na Evolution API:', data);
        return jsonResponse({ error: 'Não foi possível gerar o QR Code.' }, 502);
      }
      return jsonResponse({ state: 'connecting', qrcode: data?.base64 || null });
    }

    return jsonResponse({ error: 'Ação inválida.' }, 400);
  } catch (err) {
    console.error('Erro inesperado em evolution-connect:', err);
    return jsonResponse({ error: 'Erro interno ao conectar com o WhatsApp.' }, 500);
  }
});
