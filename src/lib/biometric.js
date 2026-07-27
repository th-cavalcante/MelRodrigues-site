// Trava de digital/Face ID na frente do painel administrativo. Usa o
// autenticador biométrico do próprio aparelho (WebAuthn) só como um
// "cadeado local" — não substitui o login do Supabase (que continua
// controlando quem de fato tem acesso), só impede que alguém com o
// celular destravado abra o painel sem confirmar a digital/rosto dono.
// Por isso a verificação é local, sem round-trip pro servidor: não
// estamos autenticando de novo, só confirmando que é o dono do aparelho.

const CREDENTIAL_KEY = 'mrlaser_biometric_credential_id';
const UNLOCKED_KEY = 'mrlaser_biometric_unlocked';

export const isBiometricSupported = () =>
  typeof window !== 'undefined' &&
  !!window.PublicKeyCredential &&
  typeof window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === 'function';

export const isBiometricAvailable = async () => {
  if (!isBiometricSupported()) return false;
  try {
    return await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  } catch (err) {
    console.error('Erro ao checar disponibilidade de biometria:', err);
    return false;
  }
};

export const isBiometricEnabled = () => !!localStorage.getItem(CREDENTIAL_KEY);

const randomBytes = (length) => window.crypto.getRandomValues(new Uint8Array(length));

const bytesToBase64 = (bytes) => btoa(String.fromCharCode(...new Uint8Array(bytes)));
const base64ToBytes = (b64) => Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));

/** Registra a digital/Face ID neste aparelho. Chamado uma vez, ao ativar
 * a trava em Configurações. */
export const registerBiometric = async (userEmail) => {
  const credential = await navigator.credentials.create({
    publicKey: {
      challenge: randomBytes(32),
      rp: { name: 'MR Laser Admin' },
      user: {
        id: randomBytes(16),
        name: userEmail || 'admin@mrlaser',
        displayName: userEmail || 'Admin MR Laser',
      },
      pubKeyCredParams: [
        { type: 'public-key', alg: -7 },
        { type: 'public-key', alg: -257 },
      ],
      authenticatorSelection: { authenticatorAttachment: 'platform', userVerification: 'required' },
      timeout: 60000,
      attestation: 'none',
    },
  });
  if (!credential) throw new Error('Não foi possível registrar a biometria.');
  localStorage.setItem(CREDENTIAL_KEY, bytesToBase64(credential.rawId));
  return true;
};

export const disableBiometric = () => {
  localStorage.removeItem(CREDENTIAL_KEY);
  sessionStorage.removeItem(UNLOCKED_KEY);
};

/** Pede a digital/Face ID e devolve true só se o aparelho confirmar. */
export const verifyBiometric = async () => {
  const stored = localStorage.getItem(CREDENTIAL_KEY);
  if (!stored) return false;
  const assertion = await navigator.credentials.get({
    publicKey: {
      challenge: randomBytes(32),
      allowCredentials: [{ id: base64ToBytes(stored), type: 'public-key' }],
      userVerification: 'required',
      timeout: 60000,
    },
  });
  return !!assertion;
};

export const isUnlockedThisSession = () => sessionStorage.getItem(UNLOCKED_KEY) === '1';
export const markUnlockedThisSession = () => sessionStorage.setItem(UNLOCKED_KEY, '1');

/** Chamado no logout — se outra pessoa logar depois no mesmo aparelho,
 * a trava de biometria (se ativa) precisa pedir a digital de novo. */
export const clearUnlockedSession = () => sessionStorage.removeItem(UNLOCKED_KEY);
