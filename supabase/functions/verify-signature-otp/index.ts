// Edge Function pública — confirma o código de 6 dígitos enviado por
// send-signature-otp. Em caso de sucesso, reserva um ID público de
// assinatura e devolve um signing_token de uso único, que finalize-signature
// exige pra concluir a assinatura (prova de que a autenticação aconteceu).
//
// Body: { subjectType, subjectId, code }
//
// Deploy: supabase functions deploy verify-signature-otp --no-verify-jwt

import { serve } from 'https://deno.land/std@0.190.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { generateSignatureId, hashOtpCode, ipFromRequest, userAgentFromRequest, SubjectType } from '../_shared/signatures.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { subjectType, subjectId, code } = (await req.json()) as {
      subjectType: SubjectType;
      subjectId: string;
      code: string;
    };
    if (!subjectType || !subjectId || !code) {
      return jsonResponse({ error: 'subjectType, subjectId e code são obrigatórios.' }, 400);
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const ip = ipFromRequest(req);
    const userAgent = userAgentFromRequest(req);

    const { data: otpRow, error: fetchError } = await supabaseAdmin
      .from('signature_otp_codes')
      .select('*')
      .eq('subject_type', subjectType)
      .eq('subject_id', subjectId)
      .is('verified_at', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (fetchError || !otpRow) {
      return jsonResponse({ error: 'Nenhum código pendente. Peça um novo código.' }, 400);
    }

    if (new Date(otpRow.expires_at).getTime() < Date.now()) {
      return jsonResponse({ error: 'Código expirado. Peça um novo código.' }, 400);
    }

    if (otpRow.attempts >= otpRow.max_attempts) {
      return jsonResponse({ error: 'Número máximo de tentativas excedido. Peça um novo código.' }, 429);
    }

    const submittedHash = await hashOtpCode(code, subjectId);
    if (submittedHash !== otpRow.code_hash) {
      await supabaseAdmin
        .from('signature_otp_codes')
        .update({ attempts: otpRow.attempts + 1 })
        .eq('id', otpRow.id);
      await supabaseAdmin.from('signature_audit_log').insert({
        subject_type: subjectType,
        subject_id: subjectId,
        event_type: 'otp_failed',
        ip_address: ip,
        user_agent: userAgent,
        metadata: { attempt: otpRow.attempts + 1 },
      });
      return jsonResponse({ error: 'Código incorreto.' }, 400);
    }

    const signatureId = generateSignatureId();
    const signingToken = crypto.randomUUID();

    const { error: updateError } = await supabaseAdmin
      .from('signature_otp_codes')
      .update({
        verified_at: new Date().toISOString(),
        reserved_signature_id: signatureId,
        signing_token: signingToken,
      })
      .eq('id', otpRow.id);
    if (updateError) {
      console.error('Erro ao confirmar OTP:', updateError);
      return jsonResponse({ error: 'Não foi possível confirmar o código.' }, 500);
    }

    await supabaseAdmin.from('signature_audit_log').insert({
      subject_type: subjectType,
      subject_id: subjectId,
      event_type: 'otp_verified',
      ip_address: ip,
      user_agent: userAgent,
    });

    return jsonResponse({ ok: true, signingToken, signatureId });
  } catch (err) {
    console.error('Erro inesperado em verify-signature-otp:', err);
    return jsonResponse({ error: 'Erro interno ao confirmar o código.' }, 500);
  }
});
