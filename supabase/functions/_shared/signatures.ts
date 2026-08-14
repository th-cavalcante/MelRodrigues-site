// Helpers compartilhados entre as Edge Functions do fluxo de assinatura
// robusta (OTP via WhatsApp, hash SHA-256, ID público de validação).

const SIGNATURE_ID_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // sem 0/O/1/I, pra evitar confusão

export const generateSignatureId = (): string => {
  const year = new Date().getFullYear();
  let suffix = '';
  const bytes = crypto.getRandomValues(new Uint8Array(8));
  for (const b of bytes) suffix += SIGNATURE_ID_ALPHABET[b % SIGNATURE_ID_ALPHABET.length];
  return `SIGN-${year}-${suffix}`;
};

export const generateOtpCode = (): string => {
  const n = crypto.getRandomValues(new Uint32Array(1))[0] % 1000000;
  return n.toString().padStart(6, '0');
};

const toHex = (buf: ArrayBuffer): string =>
  Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');

export const sha256Hex = async (data: string | Uint8Array): Promise<string> => {
  const bytes = typeof data === 'string' ? new TextEncoder().encode(data) : data;
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return toHex(digest);
};

/** Hash do código OTP amarrado ao subject_id, pra um hash vazado não servir pra outro registro. */
export const hashOtpCode = (code: string, subjectId: string): Promise<string> => sha256Hex(`${code}:${subjectId}`);

export const ipFromRequest = (req: Request): string | null =>
  req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || null;

export const userAgentFromRequest = (req: Request): string | null => req.headers.get('user-agent');

/** "(13) 99675-3432" -> "(13) 9****-3432" — só pra exibir de volta pro cliente confirmar que é o número certo. */
export const maskPhoneForDisplay = (phone: string | null | undefined): string => {
  const digits = (phone || '').replace(/\D/g, '');
  if (digits.length < 4) return '****';
  return `${'*'.repeat(Math.max(digits.length - 4, 0))}${digits.slice(-4)}`;
};

/** "123.456.789-01" -> "123.***.**9-01" — usado no bloco de assinatura do PDF. */
export const maskCpfForDocument = (cpf: string | null | undefined): string => {
  const digits = (cpf || '').replace(/\D/g, '');
  if (digits.length !== 11) return cpf || '';
  return `${digits.slice(0, 3)}.***.**${digits.slice(9, 10)}-${digits.slice(9)}`;
};

export const base64ToBytes = (base64: string): Uint8Array => {
  const clean = base64.includes(',') ? base64.split(',')[1] : base64;
  const binary = atob(clean);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
};

export type SubjectType = 'patient_contrato' | 'patient_termo' | 'rental_contract';

export const docKeyFromSubjectType = (subjectType: SubjectType): 'contrato' | 'termo' | null => {
  if (subjectType === 'patient_contrato') return 'contrato';
  if (subjectType === 'patient_termo') return 'termo';
  return null;
};
