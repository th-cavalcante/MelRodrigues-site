import React, { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import SignatureCanvas from '../components/SignatureCanvas';
import { getRentalBookingForDocs, uploadRentalSelfie } from '../lib/rentals';
import { buildRentalContractBody } from '../components/admin/rentalContract';
import { buildSignedPdf } from '../lib/signedPdf';
import { logSignatureEvent, sendSignatureOtp, verifySignatureOtp, finalizeSignature } from '../lib/signatures';
import { IconCheckCircle, IconAlertCircle } from '../components/admin/Icons';
import '../styles/ClienteDocumentos.css';
import '../styles/FichaAnamneseModal.css';

const SUBJECT_TYPE = 'rental_contract';
const OTP_RESEND_SECONDS = 60;

const RentalContrato = () => {
  const [searchParams] = useSearchParams();
  const rentalBookingId = searchParams.get('rental');

  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // step: null (leitura) | 'otp' | 'sign' | 'selfie' | 'done'
  const [step, setStep] = useState(null);
  const [agreed, setAgreed] = useState(false);

  const [otpSending, setOtpSending] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpDestination, setOtpDestination] = useState('');
  const [otpError, setOtpError] = useState('');
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [signingToken, setSigningToken] = useState(null);
  const [signatureId, setSignatureId] = useState(null);

  const [hasSignature, setHasSignature] = useState(false);
  const [signing, setSigning] = useState(false);
  const [signError, setSignError] = useState('');
  const signatureRef = useRef(null);

  const [selfiePreview, setSelfiePreview] = useState(null);
  const [selfieUploading, setSelfieUploading] = useState(false);
  const [selfieError, setSelfieError] = useState('');

  useEffect(() => {
    if (!rentalBookingId) {
      setLoading(false);
      return;
    }
    getRentalBookingForDocs(rentalBookingId)
      .then((data) => {
        setClient(data);
        if (data && !data.already_signed) {
          logSignatureEvent(SUBJECT_TYPE, rentalBookingId, 'viewed');
        }
      })
      .catch((err) => {
        console.error('Erro ao carregar dados da locação:', err);
        setError('Não foi possível carregar os dados. Peça um novo link à clínica.');
      })
      .finally(() => setLoading(false));
  }, [rentalBookingId]);

  useEffect(() => {
    if (resendCooldown <= 0) return undefined;
    const t = setTimeout(() => setResendCooldown((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  const handleClearSignature = () => {
    signatureRef.current && signatureRef.current.clear();
    setHasSignature(false);
  };

  const requestOtp = async () => {
    setOtpSending(true);
    setOtpError('');
    try {
      logSignatureEvent(SUBJECT_TYPE, rentalBookingId, 'consent_confirmed');
      const { destinationMasked } = await sendSignatureOtp(SUBJECT_TYPE, rentalBookingId);
      setOtpDestination(destinationMasked || '');
      setStep('otp');
      setResendCooldown(OTP_RESEND_SECONDS);
    } catch (err) {
      console.error('Erro ao enviar código de verificação:', err);
      setSignError(err.message || 'Não foi possível enviar o código de verificação. Tente novamente.');
    } finally {
      setOtpSending(false);
    }
  };

  const confirmOtp = async () => {
    if (otpCode.length !== 6) return;
    setOtpVerifying(true);
    setOtpError('');
    try {
      const { signingToken: token, signatureId: id } = await verifySignatureOtp(SUBJECT_TYPE, rentalBookingId, otpCode);
      setSigningToken(token);
      setSignatureId(id);
      setStep('sign');
    } catch (err) {
      console.error('Erro ao confirmar código:', err);
      setOtpError(err.message || 'Código incorreto. Tente novamente.');
    } finally {
      setOtpVerifying(false);
    }
  };

  const confirmSign = async () => {
    if (!hasSignature || !rentalBookingId || !signingToken) return;
    const signatureDataUrl = signatureRef.current ? signatureRef.current.toDataURL() : null;
    setSigning(true);
    setSignError('');
    try {
      const bodySnapshot = buildRentalContractBody(client);
      const validationUrl = `${window.location.origin}/validar/${signatureId}`;
      const { base64 } = await buildSignedPdf({
        title: 'Contrato de Locação — Hakon 4D',
        body: bodySnapshot,
        signatureDataUrl,
        signerName: client?.name,
        cpf: client?.cpf,
        signedAtLabel: new Date().toLocaleString('pt-BR'),
        signatureId,
        validationUrl,
      });

      await finalizeSignature({
        subjectType: SUBJECT_TYPE,
        subjectId: rentalBookingId,
        signingToken,
        bodySnapshot,
        signerName: client?.name,
        signatureDataUrl,
        pdfBase64: base64,
      });

      setStep('selfie');
    } catch (err) {
      console.error('Erro ao assinar contrato:', err);
      setSignError(err.message || 'Não foi possível registrar a assinatura. Tente novamente.');
    } finally {
      setSigning(false);
    }
  };

  const handleSelfieSelected = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setSelfiePreview(URL.createObjectURL(file));
    setSelfieUploading(true);
    setSelfieError('');
    try {
      await uploadRentalSelfie(rentalBookingId, file);
      setStep('done');
    } catch (err) {
      console.error('Erro ao enviar selfie:', err);
      setSelfieError('Não foi possível enviar a foto. Tente novamente.');
    } finally {
      setSelfieUploading(false);
    }
  };

  const contractBody = client ? buildRentalContractBody(client) : '';

  return (
    <div className="cliente-page ficha-publica-page">
      <nav className="cliente-nav">
        <div className="cliente-logo">
          <img src="/images/logo.png" alt="MR Laser" />
        </div>
        <div className="cliente-nav-right">
          <Link to="/" className="cliente-logout">
            Voltar ao site
          </Link>
        </div>
      </nav>

      <section className="cliente-header">
        <span className="section-eyebrow">Locação Hakon 4D</span>
        <h1 className="cliente-title">Contrato de Locação</h1>
        <p className="cliente-subtitle">
          {!rentalBookingId
            ? 'Este link está incompleto ou inválido. Peça à clínica um novo link.'
            : 'Leia o contrato abaixo com atenção e assine ao final.'}
        </p>
      </section>

      {loading && <p className="cliente-subtitle">Carregando...</p>}
      {error && (
        <div className="admin-login-error">
          <IconAlertCircle size={14} /> <span>{error}</span>
        </div>
      )}

      {client && client.already_signed && step === null && (
        <div className="ficha-modal-overlay">
          <div className="ficha-modal ficha-modal-narrow ficha-welcome-step">
            <div className="ficha-welcome-icon ficha-welcome-icon-check">
              <IconCheckCircle size={28} />
            </div>
            <h2 className="ficha-modal-title">Contrato já assinado</h2>
            <p className="ficha-modal-subtitle">Este contrato já foi assinado anteriormente. Qualquer dúvida, fale com a clínica.</p>
          </div>
        </div>
      )}

      {client && !client.already_signed && !client.landlord_signed_at && step === null && (
        <div className="ficha-modal-overlay">
          <div className="ficha-modal ficha-modal-narrow ficha-welcome-step">
            <h2 className="ficha-modal-title">Aguardando a clínica</h2>
            <p className="ficha-modal-subtitle">A locadora ainda está revisando este contrato. Você receberá um novo aviso assim que puder assinar.</p>
          </div>
        </div>
      )}

      {client && !client.already_signed && client.landlord_signed_at && step === null && (
        <>
          <div className="cliente-modal-body-text ficha-modal-clinical-header" style={{ whiteSpace: 'pre-wrap' }}>
            {contractBody}
          </div>

          <label className="cliente-agree-label">
            <input
              type="checkbox"
              checked={agreed}
              onChange={() => setAgreed((v) => !v)}
              className="cliente-agree-checkbox"
            />
            Declaro que li e concordo com os termos descritos acima e que estou realizando pessoalmente esta assinatura eletrônica.
          </label>

          {signError && (
            <div className="admin-login-error">
              <IconAlertCircle size={14} /> <span>{signError}</span>
            </div>
          )}

          <div className="cliente-modal-actions">
            <button
              type="button"
              onClick={requestOtp}
              disabled={!agreed || otpSending}
              className="cliente-modal-confirm"
            >
              {otpSending ? 'ENVIANDO CÓDIGO...' : 'CONTINUAR PARA VERIFICAÇÃO'}
            </button>
          </div>
        </>
      )}

      {step === 'otp' && (
        <div className="ficha-modal-overlay">
          <div className="ficha-modal ficha-modal-narrow">
            <div className="ficha-modal-header">
              <span className="section-eyebrow">Verificação</span>
              <h2 className="ficha-modal-title">Digite o código</h2>
            </div>
            <p className="cliente-otp-hint">
              Enviamos um código de 6 dígitos por WhatsApp para o número terminado em <strong>{otpDestination}</strong>. Ele confirma que é você quem está assinando.
            </p>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              className="cliente-otp-input"
              autoFocus
            />
            {otpError && (
              <div className="admin-login-error">
                <IconAlertCircle size={14} /> <span>{otpError}</span>
              </div>
            )}
            <button
              type="button"
              onClick={requestOtp}
              disabled={resendCooldown > 0 || otpSending}
              className="cliente-otp-resend"
            >
              {resendCooldown > 0 ? `Reenviar código (${resendCooldown}s)` : 'Reenviar código'}
            </button>
            <div className="cliente-modal-actions">
              <button
                type="button"
                onClick={confirmOtp}
                disabled={otpCode.length !== 6 || otpVerifying}
                className="cliente-modal-confirm"
              >
                {otpVerifying ? 'VERIFICANDO...' : 'CONFIRMAR CÓDIGO'}
              </button>
            </div>
          </div>
        </div>
      )}

      {step === 'sign' && (
        <div className="ficha-modal-overlay">
          <div className="ficha-modal">
            <div className="ficha-modal-header">
              <span className="section-eyebrow">Verificado ✓</span>
              <h2 className="ficha-modal-title">Assine no campo abaixo</h2>
            </div>
            <div className="cliente-signature-box">
              <SignatureCanvas
                ref={signatureRef}
                className="cliente-signature-canvas"
                onStrokeEnd={() => setHasSignature(true)}
              />
              <div className="cliente-signature-footer">
                <span className="cliente-signature-meta">ASSINATURA DIGITAL · {new Date().toLocaleDateString('pt-BR')}</span>
                <button type="button" onClick={handleClearSignature} className="cliente-signature-clear">
                  Limpar
                </button>
              </div>
            </div>
            {signError && (
              <div className="admin-login-error">
                <IconAlertCircle size={14} /> <span>{signError}</span>
              </div>
            )}
            <div className="cliente-modal-actions">
              <button
                type="button"
                onClick={confirmSign}
                disabled={!hasSignature || signing}
                className="cliente-modal-confirm"
              >
                {signing ? 'ENVIANDO...' : 'CONFIRMAR ASSINATURA'}
              </button>
            </div>
          </div>
        </div>
      )}

      {step === 'selfie' && (
        <div className="ficha-modal-overlay">
          <div className="ficha-modal ficha-modal-narrow">
            <div className="ficha-modal-header">
              <span className="section-eyebrow">Quase lá</span>
              <h2 className="ficha-modal-title">Tire uma selfie</h2>
              <p className="ficha-modal-subtitle">
                Para concluir a assinatura do contrato, precisamos de uma foto do seu rosto.
              </p>
            </div>

            <div className="ficha-selfie-body">
              {selfiePreview && <img src={selfiePreview} alt="" className="ficha-selfie-preview" />}
              <label className={`save-button ficha-selfie-btn ${selfieUploading ? 'disabled' : ''}`}>
                {selfieUploading ? 'ENVIANDO...' : selfiePreview ? 'TIRAR OUTRA FOTO' : 'TIRAR FOTO'}
                <input
                  type="file"
                  accept="image/*"
                  capture="user"
                  onChange={handleSelfieSelected}
                  disabled={selfieUploading}
                  className="ficha-selfie-input"
                />
              </label>
              {selfieError && (
                <div className="admin-login-error">
                  <IconAlertCircle size={14} /> <span>{selfieError}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {step === 'done' && (
        <div className="ficha-modal-overlay">
          <div className="ficha-modal ficha-modal-narrow ficha-welcome-step">
            <div className="ficha-welcome-icon ficha-welcome-icon-check">
              <IconCheckCircle size={28} />
            </div>
            <h2 className="ficha-modal-title">Tudo certo!</h2>
            <p className="ficha-modal-subtitle">Seu contrato de locação foi assinado com sucesso. Obrigado!</p>
            {signatureId && <div className="cliente-signature-id">ID da assinatura: {signatureId}</div>}
          </div>
        </div>
      )}
    </div>
  );
};

export default RentalContrato;
