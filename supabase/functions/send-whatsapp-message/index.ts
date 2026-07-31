// Edge Function — envia uma mensagem de WhatsApp pra um paciente de um
// agendamento específico, via Evolution API (instância própria na VPS).
// Só pra teste manual disparado pelo admin — sem automação/cron ainda.
//
// Segredos necessários (já configurados via `supabase secrets set`):
//   EVOLUTION_API_URL, EVOLUTION_API_KEY, EVOLUTION_INSTANCE_NAME
//
// Função só pra admin logado — não usar --no-verify-jwt no deploy.
//
// Deploy: supabase functions deploy send-whatsapp-message

import { serve } from 'https://deno.land/std@0.190.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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
    const { bookingId } = await req.json();
    if (!bookingId) {
      return jsonResponse({ error: 'bookingId é obrigatório.' }, 400);
    }

    const apiUrl = Deno.env.get('EVOLUTION_API_URL');
    const apiKey = Deno.env.get('EVOLUTION_API_KEY');
    const instanceName = Deno.env.get('EVOLUTION_INSTANCE_NAME');

    if (!apiUrl || !apiKey || !instanceName) {
      console.error('Secrets da Evolution API não configurados.');
      return jsonResponse({ error: 'Integração com WhatsApp temporariamente indisponível.' }, 500);
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: booking, error: bookingError } = await supabaseAdmin
      .from('bookings')
      .select('booking_date, booking_time, service, patients(name, phone)')
      .eq('id', bookingId)
      .maybeSingle();

    if (bookingError || !booking) {
      return jsonResponse({ error: 'Agendamento não encontrado.' }, 404);
    }

    const patient = booking.patients;
    const phoneDigits = (patient?.phone || '').replace(/\D/g, '');
    if (!phoneDigits) {
      return jsonResponse({ error: 'Este paciente não tem telefone cadastrado.' }, 400);
    }
    const number = phoneDigits.startsWith('55') ? phoneDigits : `55${phoneDigits}`;

    const [year, month, day] = (booking.booking_date || '').split('-');
    const dateLabel = year ? `${day}/${month}` : '';
    const timeLabel = (booking.booking_time || '').slice(0, 5);
    const firstName = (patient?.name || '').trim().split(/\s+/)[0] || '';

    const text =
      `Olá ${firstName}! Passando pra lembrar do seu horário na MR Laser: ` +
      `${booking.service || 'sua sessão'} em ${dateLabel} às ${timeLabel}. Te esperamos! 💙\n\n` +
      `(mensagem de teste)`;

    const res = await fetch(`${apiUrl}/message/sendText/${instanceName}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: apiKey },
      body: JSON.stringify({ number, text }),
    });
    const data = await res.json();

    if (!res.ok) {
      console.error('Erro ao enviar mensagem pela Evolution API:', data);
      return jsonResponse({ error: data?.message || data?.response?.message || 'Não foi possível enviar a mensagem.' }, 502);
    }

    return jsonResponse({ success: true });
  } catch (err) {
    console.error('Erro inesperado em send-whatsapp-message:', err);
    return jsonResponse({ error: 'Erro interno ao enviar a mensagem.' }, 500);
  }
});
