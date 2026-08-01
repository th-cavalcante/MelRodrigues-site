// Edge Function — envia uma mensagem de WhatsApp usando um template
// editável (tabela message_templates), via Evolution API. Serve quatro casos:
//   { templateKey: 'test_reminder', bookingId }                  — lembrete de teste manual
//   { templateKey: 'birthday', patientId }                       — mensagem de aniversário
//   { templateKey: 'document_signature_link', patientId, link }  — link de assinatura
//   { templateKey: 'ficha_link', patientId, link }                — link da ficha de anamnese
//
// Segredos necessários (já configurados via `supabase secrets set`):
//   EVOLUTION_API_URL, EVOLUTION_API_KEY, EVOLUTION_INSTANCE_NAME
//
// Função só pra admin logado — não usar --no-verify-jwt no deploy.
//
// Deploy: supabase functions deploy send-whatsapp-message

import { serve } from 'https://deno.land/std@0.190.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { sendWhatsAppText, formatPhoneForEvolution, getTemplate, fillTemplate } from '../_shared/evolution.ts';

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
    const { templateKey, bookingId, patientId, link } = await req.json();

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    let phoneDigits: string | null = null;
    let text: string;

    if (templateKey === 'birthday') {
      if (!patientId) return jsonResponse({ error: 'patientId é obrigatório.' }, 400);

      const { data: patient, error: patientError } = await supabaseAdmin
        .from('patients')
        .select('name, phone')
        .eq('id', patientId)
        .maybeSingle();
      if (patientError || !patient) return jsonResponse({ error: 'Paciente não encontrado.' }, 404);

      phoneDigits = formatPhoneForEvolution(patient.phone);
      const firstName = (patient.name || '').trim().split(/\s+/)[0] || '';
      const body = await getTemplate(
        supabaseAdmin,
        'birthday',
        'Parabéns, {{nome}}! 🎉 A equipe MR Laser deseja um feliz aniversário!'
      );
      text = fillTemplate(body, { nome: firstName });
    } else if (templateKey === 'document_signature_link') {
      if (!patientId) return jsonResponse({ error: 'patientId é obrigatório.' }, 400);
      if (!link) return jsonResponse({ error: 'link é obrigatório.' }, 400);

      const { data: patient, error: patientError } = await supabaseAdmin
        .from('patients')
        .select('name, phone')
        .eq('id', patientId)
        .maybeSingle();
      if (patientError || !patient) return jsonResponse({ error: 'Paciente não encontrado.' }, 404);

      phoneDigits = formatPhoneForEvolution(patient.phone);
      const firstName = (patient.name || '').trim().split(/\s+/)[0] || '';
      const body = await getTemplate(
        supabaseAdmin,
        'document_signature_link',
        '{{nome}}, segue o link para assinatura do contrato e termo de consentimento: {{link}}'
      );
      text = fillTemplate(body, { nome: firstName, link });
    } else if (templateKey === 'ficha_link') {
      if (!patientId) return jsonResponse({ error: 'patientId é obrigatório.' }, 400);
      if (!link) return jsonResponse({ error: 'link é obrigatório.' }, 400);

      const { data: patient, error: patientError } = await supabaseAdmin
        .from('patients')
        .select('name, phone')
        .eq('id', patientId)
        .maybeSingle();
      if (patientError || !patient) return jsonResponse({ error: 'Paciente não encontrado.' }, 404);

      phoneDigits = formatPhoneForEvolution(patient.phone);
      const firstName = (patient.name || '').trim().split(/\s+/)[0] || '';
      const body = await getTemplate(
        supabaseAdmin,
        'ficha_link',
        '{{nome}}, segue o link para preencher sua ficha de anamnese: {{link}}'
      );
      text = fillTemplate(body, { nome: firstName, link });
    } else {
      // Padrão: lembrete de teste, a partir de um agendamento.
      if (!bookingId) return jsonResponse({ error: 'bookingId é obrigatório.' }, 400);

      const { data: booking, error: bookingError } = await supabaseAdmin
        .from('bookings')
        .select('booking_date, booking_time, service, patients(name, phone)')
        .eq('id', bookingId)
        .maybeSingle();
      if (bookingError || !booking) return jsonResponse({ error: 'Agendamento não encontrado.' }, 404);

      const patient = booking.patients;
      phoneDigits = formatPhoneForEvolution(patient?.phone);

      const [year, month, day] = (booking.booking_date || '').split('-');
      const dateLabel = year ? `${day}/${month}` : '';
      const timeLabel = (booking.booking_time || '').slice(0, 5);
      const firstName = (patient?.name || '').trim().split(/\s+/)[0] || '';

      const body = await getTemplate(
        supabaseAdmin,
        'test_reminder',
        'Olá {{nome}}! Lembrete: {{servico}} em {{data}} às {{hora}}.'
      );
      text = fillTemplate(body, {
        nome: firstName,
        servico: booking.service || 'sua sessão',
        data: dateLabel,
        hora: timeLabel,
      });
    }

    if (!phoneDigits) {
      return jsonResponse({ error: 'Este paciente não tem telefone cadastrado.' }, 400);
    }

    const result = await sendWhatsAppText(phoneDigits, text);
    if (!result.ok) {
      console.error('Erro ao enviar mensagem pela Evolution API:', result.error);
      return jsonResponse({ error: result.error || 'Não foi possível enviar a mensagem.' }, 502);
    }

    return jsonResponse({ success: true });
  } catch (err) {
    console.error('Erro inesperado em send-whatsapp-message:', err);
    return jsonResponse({ error: 'Erro interno ao enviar a mensagem.' }, 500);
  }
});
