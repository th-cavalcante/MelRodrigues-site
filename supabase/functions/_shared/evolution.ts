// Helper compartilhado entre Edge Functions que precisam mandar mensagem de
// WhatsApp via Evolution API (instância própria rodando na VPS).
//
// Segredos lidos (já configurados via `supabase secrets set`):
//   EVOLUTION_API_URL, EVOLUTION_API_KEY, EVOLUTION_INSTANCE_NAME

export const sendWhatsAppText = async (
  number: string,
  text: string
): Promise<{ ok: boolean; error?: string }> => {
  const apiUrl = Deno.env.get('EVOLUTION_API_URL');
  const apiKey = Deno.env.get('EVOLUTION_API_KEY');
  const instanceName = Deno.env.get('EVOLUTION_INSTANCE_NAME');

  if (!apiUrl || !apiKey || !instanceName) {
    return { ok: false, error: 'Secrets da Evolution API não configurados.' };
  }

  // Sem timeout, se o WhatsApp da clínica cair (instância desconectada), o
  // fetch pode ficar pendurado até o runtime da function matar a execução —
  // aí o front só vê "Connection Closed", sem dica nenhuma do que houve.
  // Com AbortController, falha rápido e com uma mensagem que aponta a causa.
  let res: Response;
  try {
    res = await fetch(`${apiUrl}/message/sendText/${instanceName}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: apiKey },
      body: JSON.stringify({ number, text }),
      signal: AbortSignal.timeout(20000),
    });
  } catch (err) {
    const timedOut = err instanceof Error && err.name === 'TimeoutError';
    return {
      ok: false,
      error: timedOut
        ? 'O WhatsApp da clínica não respondeu a tempo — provavelmente está desconectado. Reconecte em Marketing.'
        : 'Não foi possível conectar ao WhatsApp da clínica.',
    };
  }
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    return { ok: false, error: data?.message || data?.response?.message || 'Falha ao enviar mensagem.' };
  }
  return { ok: true };
};

/** "Rua Tal, 61" ou "(13) 99675-3432" -> "5513996753432". */
export const formatPhoneForEvolution = (phone: string | null | undefined): string | null => {
  const digits = (phone || '').replace(/\D/g, '');
  if (!digits) return null;
  return digits.startsWith('55') ? digits : `55${digits}`;
};

export const getTemplate = async (
  supabaseAdmin: any,
  key: string,
  fallback: string
): Promise<string> => {
  const { data } = await supabaseAdmin.from('message_templates').select('body').eq('key', key).maybeSingle();
  return data?.body || fallback;
};

export const fillTemplate = (body: string, vars: Record<string, string>): string =>
  Object.entries(vars).reduce((acc, [key, value]) => acc.replaceAll(`{{${key}}}`, value ?? ''), body);
