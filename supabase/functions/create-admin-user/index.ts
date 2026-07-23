// Edge Function — cria uma conta de acesso ao painel administrativo
// (mesmo nível de acesso do admin) e dispara o e-mail de "definir senha"
// (reaproveita o mesmo fluxo de recuperação de senha do app).
//
// Só pode ser chamada por alguém já autenticado no painel (deploy SEM
// --no-verify-jwt, então o próprio gateway do Supabase exige um JWT válido).
//
// Deploy: supabase functions deploy create-admin-user

import { serve } from 'https://deno.land/std@0.190.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { email, siteUrl } = await req.json();

    if (!email || !email.includes('@') || !siteUrl) {
      return new Response(JSON.stringify({ error: 'E-mail inválido.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY');

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    const { error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      email_confirm: true,
    });

    if (createError && createError.code !== 'email_exists') {
      console.error('Erro ao criar usuário admin:', createError);
      return new Response(JSON.stringify({ error: 'Não foi possível criar a conta.' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseAnon = createClient(supabaseUrl, anonKey);
    const { error: resetError } = await supabaseAnon.auth.resetPasswordForEmail(email, {
      redirectTo: `${siteUrl}/admin/redefinir-senha`,
    });

    if (resetError) {
      console.error('Erro ao enviar e-mail de definição de senha:', resetError);
      return new Response(JSON.stringify({ error: 'Conta criada, mas falhou o envio do e-mail.' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Erro inesperado em create-admin-user:', err);
    return new Response(JSON.stringify({ error: 'Erro interno ao criar a conta.' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
