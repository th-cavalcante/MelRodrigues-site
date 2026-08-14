// Edge Function pública — envia um código de 6 dígitos por WhatsApp pra
// autenticar o signatário antes de liberar a assinatura de um documento.
//
// Body: { subjectType: 'rental_contract'|'patient_contrato'|'patient_termo', subjectId }
//
// Segredos necessários: EVOLUTION_API_URL, EVOLUTION_API_KEY,
// EVOLUTION_INSTANCE_NAME, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
//
// Função pública (chamada por cliente anônimo assinando um documento) —
// deploy com --no-verify-jwt.
// Deploy: supabase functions deploy send-signature-otp --no-verify-jwt

import { serve } from 'https://deno.land/std@0.190.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { sendWhatsAppText, formatPhoneForEvolution } from '../_shared/evolution.ts';
import {
  generateOtpCode,
  hashOtpCode,
  ipFromRequest,
  userAgentFromRequest,
  maskPhoneForDisplay,
  SubjectType,
} from '../_shared/signatures.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

const OTP_TTL_MINUTES = 10;
const RESEND_COOLDOWN_SECONDS = 60;

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { subjectType, subjectId } = (await req.json()) as { subjectType: SubjectType; subjectId: string };
    if (!subjectType || !subjectId) return jsonResponse({ error: 'subjectType e subjectId são obrigatórios.' }, 400);

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    let name = '';
    let phone: string | null = null;

    if (subjectType === 'rental_contract') {
      const { data, error } = await supabaseAdmin
        .from('rental_bookings')
        .select('rental_clients(name, phone)')
        .eq('id', subjectId)
        .maybeSingle();
      if (error || !data) return jsonResponse({ error: 'Locação não encontrada.' }, 404);
      const client = data.rental_clients as { name: string; phone: string } | null;
      name = client?.name || '';
      phone = client?.phone || null;
    } else if (subjectType === 'patient_contrato' || subjectType === 'patient_termo') {
      const { data, error } = await supabaseAdmin
        .from('patients')
        .select('name, phone')
        .eq('id', subjectId)
        .maybeSingle();
      if (error || !data) return jsonResponse({ error: 'Cliente não encontrado.' }, 404);
      name = data.name || '';
      phone = data.phone || null;
    } else {
      return jsonResponse({ error: 'subjectType inválido.' }, 400);
    }

    const phoneDigits = formatPhoneForEvolution(phone);
    if (!phoneDigits) return jsonResponse({ error: 'Não há telefone cadastrado para enviar o código.' }, 400);

    // Evita reenvio em loop: se já existe um código recente ainda válido, não gera outro.
    const { data: recent } = await supabaseAdmin
      .from('signature_otp_codes')
      .select('created_at')
      .eq('subject_type', subjectType)
      .eq('subject_id', subjectId)
      .is('verified_at', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (recent && Date.now() - new Date(recent.created_at).getTime() < RESEND_COOLDOWN_SECONDS * 1000) {
      return jsonResponse({ error: 'Aguarde um minuto antes de pedir um novo código.' }, 429);
    }

    const code = generateOtpCode();
    const codeHash = await hashOtpCode(code, subjectId);
    const destinationMasked = maskPhoneForDisplay(phone);
    const ip = ipFromRequest(req);
    const userAgent = userAgentFromRequest(req);

    const { error: insertError } = await supabaseAdmin.from('signature_otp_codes').insert({
      subject_type: subjectType,
      subject_id: subjectId,
      code_hash: codeHash,
      destination_masked: destinationMasked,
      expires_at: new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000).toISOString(),
      ip_address: ip,
      user_agent: userAgent,
    });
    if (insertError) {
      console.error('Erro ao gravar código OTP:', insertError);
      return jsonResponse({ error: 'Não foi possível gerar o código.' }, 500);
    }

    const firstName = (name || '').trim().split(/\s+/)[0] || '';
    const text = `${firstName}, seu código para confirmar a assinatura é: ${code}\n\nVálido por ${OTP_TTL_MINUTES} minutos. Não compartilhe este código com ninguém.`;

    const result = await sendWhatsAppText(phoneDigits, text);
    if (!result.ok) {
      console.error('Erro ao enviar código via Evolution API:', result.error);
      return jsonResponse({ error: result.error || 'Não foi possível enviar o código.' }, 502);
    }

    await supabaseAdmin.from('signature_audit_log').insert({
      subject_type: subjectType,
      subject_id: subjectId,
      event_type: 'otp_sent',
      ip_address: ip,
      user_agent: userAgent,
      metadata: { destination_masked: destinationMasked },
    });

    return jsonResponse({ ok: true, destinationMasked });
  } catch (err) {
    console.error('Erro inesperado em send-signature-otp:', err);
    return jsonResponse({ error: 'Erro interno ao enviar o código.' }, 500);
  }
});
