// Edge Function — chamada pelo pg_cron a cada 15 minutos (ver migration
// 0021_scheduled_reminders.sql). Para cada automação ativa com
// "hours_before" configurado, busca os agendamentos que entraram na
// janela de envio (via RPC get_due_reminders) e manda a mensagem.
//
// Segredos necessários: EVOLUTION_API_URL, EVOLUTION_API_KEY,
// EVOLUTION_INSTANCE_NAME (já configurados) + CRON_SECRET (novo).
//
// Só o pg_cron chama essa função — não tem usuário logado, por isso o
// deploy usa --no-verify-jwt e a autenticação é feita via header próprio.
//
// Deploy: supabase functions deploy send-scheduled-reminders --no-verify-jwt

import { serve } from 'https://deno.land/std@0.190.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { sendWhatsAppText, formatPhoneForEvolution, fillTemplate } from '../_shared/evolution.ts';

serve(async (req) => {
  const cronSecret = req.headers.get('x-cron-secret');
  if (!cronSecret || cronSecret !== Deno.env.get('CRON_SECRET')) {
    return new Response('unauthorized', { status: 401 });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: automations, error: automationsError } = await supabaseAdmin
      .from('message_templates')
      .select('key, body, hours_before')
      .eq('active', true)
      .not('hours_before', 'is', null);

    if (automationsError) {
      console.error('Erro ao buscar automações ativas:', automationsError);
      return new Response(JSON.stringify({ error: 'Erro ao buscar automações.' }), { status: 500 });
    }

    let totalSent = 0;

    for (const automation of automations || []) {
      const { data: due, error: dueError } = await supabaseAdmin.rpc('get_due_reminders', {
        p_template_key: automation.key,
        p_hours_before: automation.hours_before,
      });
      if (dueError) {
        console.error(`Erro ao buscar agendamentos vencidos para ${automation.key}:`, dueError);
        continue;
      }

      for (const booking of due || []) {
        const phoneDigits = formatPhoneForEvolution(booking.patient_phone);
        if (!phoneDigits) continue;

        const [year, month, day] = (booking.booking_date || '').split('-');
        const firstName = (booking.patient_name || '').trim().split(/\s+/)[0] || '';
        const text = fillTemplate(automation.body, {
          nome: firstName,
          servico: booking.service || 'sua sessão',
          data: year ? `${day}/${month}` : '',
          hora: (booking.booking_time || '').slice(0, 5),
        });

        const result = await sendWhatsAppText(phoneDigits, text);
        if (result.ok) {
          const { error: insertError } = await supabaseAdmin
            .from('automation_sends')
            .insert({ booking_id: booking.booking_id, template_key: automation.key });
          if (insertError) console.error('Erro ao registrar envio:', insertError);
          totalSent += 1;
        } else {
          console.error(`Erro ao enviar lembrete (${automation.key}) pro agendamento ${booking.booking_id}:`, result.error);
        }
      }
    }

    return new Response(JSON.stringify({ sent: totalSent }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Erro inesperado em send-scheduled-reminders:', err);
    return new Response(JSON.stringify({ error: 'Erro interno.' }), { status: 500 });
  }
});
