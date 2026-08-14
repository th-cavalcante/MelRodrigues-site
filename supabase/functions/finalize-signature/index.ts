// Edge Function pública — conclui a assinatura de um documento: valida o
// signing_token emitido por verify-signature-otp, calcula o SHA-256 do PDF
// final no servidor (não confia em hash vindo do cliente), sobe o PDF pro
// Storage privado, congela o texto assinado em document_versions e grava a
// linha de assinatura + trilha de auditoria. Qualquer assinatura anterior
// válida do mesmo documento é marcada como "superseded", nunca sobrescrita.
//
// Body: {
//   subjectType, subjectId, signingToken, bodySnapshot, signerName,
//   signatureDataUrl (PNG base64 do traço), pdfBase64 (PDF final gerado no browser)
// }
//
// Deploy: supabase functions deploy finalize-signature --no-verify-jwt

import { serve } from 'https://deno.land/std@0.190.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import {
  sha256Hex,
  base64ToBytes,
  ipFromRequest,
  userAgentFromRequest,
  docKeyFromSubjectType,
  SubjectType,
} from '../_shared/signatures.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { subjectType, subjectId, signingToken, bodySnapshot, signerName, signatureDataUrl, pdfBase64 } =
      (await req.json()) as {
        subjectType: SubjectType;
        subjectId: string;
        signingToken: string;
        bodySnapshot: string;
        signerName: string;
        signatureDataUrl: string;
        pdfBase64: string;
      };

    if (!subjectType || !subjectId || !signingToken || !bodySnapshot || !signatureDataUrl || !pdfBase64) {
      return jsonResponse({ error: 'Dados incompletos para concluir a assinatura.' }, 400);
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const ip = ipFromRequest(req);
    const userAgent = userAgentFromRequest(req);

    // 1) Valida o signing_token — só existe depois de um OTP confirmado, e só pode ser usado uma vez.
    const { data: otpRow, error: otpError } = await supabaseAdmin
      .from('signature_otp_codes')
      .select('*')
      .eq('subject_type', subjectType)
      .eq('subject_id', subjectId)
      .eq('signing_token', signingToken)
      .is('signing_token_used_at', null)
      .not('verified_at', 'is', null)
      .maybeSingle();

    if (otpError || !otpRow) {
      return jsonResponse({ error: 'Autenticação inválida ou já utilizada. Refaça a verificação por código.' }, 401);
    }
    if (!otpRow.reserved_signature_id) {
      return jsonResponse({ error: 'Sessão de assinatura inválida.' }, 401);
    }

    const signatureId: string = otpRow.reserved_signature_id;

    if (subjectType === 'rental_contract') {
      const { data: booking } = await supabaseAdmin
        .from('rental_bookings')
        .select('landlord_signed_at')
        .eq('id', subjectId)
        .maybeSingle();
      if (!booking?.landlord_signed_at) {
        return jsonResponse({ error: 'A locadora ainda não revisou/assinou este contrato.' }, 409);
      }
    }

    await supabaseAdmin
      .from('signature_otp_codes')
      .update({ signing_token_used_at: new Date().toISOString() })
      .eq('id', otpRow.id);

    // 2) Hash do PDF final, calculado no servidor a partir dos bytes recebidos.
    const pdfBytes = base64ToBytes(pdfBase64);
    const documentHash = await sha256Hex(pdfBytes);
    const pdfStoragePath = `${subjectType}/${subjectId}/${signatureId}.pdf`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from('signed-documents')
      .upload(pdfStoragePath, pdfBytes, { contentType: 'application/pdf', upsert: false });
    if (uploadError) {
      console.error('Erro ao subir PDF assinado:', uploadError);
      return jsonResponse({ error: 'Não foi possível armazenar o documento assinado.' }, 500);
    }

    // 3) Congela o texto assinado numa nova versão do documento.
    const { count: priorVersions } = await supabaseAdmin
      .from('document_versions')
      .select('id', { count: 'exact', head: true })
      .eq('subject_type', subjectType)
      .eq('subject_id', subjectId);
    const versionNumber = (priorVersions || 0) + 1;

    const { data: versionRow, error: versionError } = await supabaseAdmin
      .from('document_versions')
      .insert({ subject_type: subjectType, subject_id: subjectId, version_number: versionNumber, body_snapshot: bodySnapshot })
      .select()
      .single();
    if (versionError || !versionRow) {
      console.error('Erro ao gravar versão do documento:', versionError);
      return jsonResponse({ error: 'Não foi possível registrar a versão do documento.' }, 500);
    }

    // 4) Busca CPF/telefone atuais pra guardar como snapshot no registro de auditoria.
    let cpfSnapshot: string | null = null;
    let phoneSnapshot: string | null = null;
    if (subjectType === 'rental_contract') {
      const { data } = await supabaseAdmin
        .from('rental_bookings')
        .select('rental_clients(cpf, phone)')
        .eq('id', subjectId)
        .maybeSingle();
      const client = data?.rental_clients as { cpf: string; phone: string } | null;
      cpfSnapshot = client?.cpf || null;
      phoneSnapshot = client?.phone || null;
    } else {
      const { data } = await supabaseAdmin.from('patients').select('cpf, phone').eq('id', subjectId).maybeSingle();
      cpfSnapshot = data?.cpf || null;
      phoneSnapshot = data?.phone || null;
    }

    const { data: lastConsent } = await supabaseAdmin
      .from('signature_audit_log')
      .select('occurred_at')
      .eq('subject_type', subjectType)
      .eq('subject_id', subjectId)
      .eq('event_type', 'consent_confirmed')
      .order('occurred_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    const consentConfirmedAt = lastConsent?.occurred_at || new Date().toISOString();

    const commonFields = {
      signature_id: signatureId,
      document_version_id: versionRow.id,
      signer_cpf_snapshot: cpfSnapshot,
      signer_phone_snapshot: phoneSnapshot,
      ip_address: ip,
      user_agent: userAgent,
      auth_method: 'whatsapp_otp',
      consent_confirmed_at: consentConfirmedAt,
      document_hash: documentHash,
      pdf_storage_path: pdfStoragePath,
      status: 'valid' as const,
      signature_data_url: signatureDataUrl,
    };

    // 5) Grava a assinatura na tabela certa, marcando qualquer válida anterior como superseded.
    if (subjectType === 'rental_contract') {
      await supabaseAdmin
        .from('rental_document_signatures')
        .update({ status: 'superseded' })
        .eq('rental_booking_id', subjectId)
        .eq('status', 'valid');

      const { error: insertError } = await supabaseAdmin.from('rental_document_signatures').insert({
        rental_booking_id: subjectId,
        client_name_snapshot: signerName,
        ...commonFields,
      });
      if (insertError) {
        console.error('Erro ao gravar assinatura da locação:', insertError);
        return jsonResponse({ error: 'Não foi possível registrar a assinatura.' }, 500);
      }
    } else {
      const docKey = docKeyFromSubjectType(subjectType);
      await supabaseAdmin
        .from('document_signatures')
        .update({ status: 'superseded' })
        .eq('patient_id', subjectId)
        .eq('doc_key', docKey)
        .eq('status', 'valid');

      const { error: insertError } = await supabaseAdmin.from('document_signatures').insert({
        patient_id: subjectId,
        doc_key: docKey,
        patient_name_snapshot: signerName,
        ...commonFields,
      });
      if (insertError) {
        console.error('Erro ao gravar assinatura do paciente:', insertError);
        return jsonResponse({ error: 'Não foi possível registrar a assinatura.' }, 500);
      }
    }

    // 6) Trilha de auditoria.
    const events = ['signature_completed', 'pdf_generated', 'hash_recorded', 'document_locked'];
    await supabaseAdmin.from('signature_audit_log').insert(
      events.map((event_type) => ({
        subject_type: subjectType,
        subject_id: subjectId,
        document_version_id: versionRow.id,
        event_type,
        ip_address: ip,
        user_agent: userAgent,
        metadata: event_type === 'hash_recorded' ? { document_hash: documentHash } : null,
      }))
    );

    return jsonResponse({ ok: true, signatureId, documentHash, pdfStoragePath, versionNumber });
  } catch (err) {
    console.error('Erro inesperado em finalize-signature:', err);
    return jsonResponse({ error: 'Erro interno ao concluir a assinatura.' }, 500);
  }
});
