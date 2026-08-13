import React, { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import SignatureCanvas from '../components/SignatureCanvas';
import { getRentalBookingForDocs, submitRentalSignature, uploadRentalSelfie } from '../lib/rentals';
import { buildRentalContractBody } from '../components/admin/rentalContract';
import { IconCheckCircle, IconAlertCircle } from '../components/admin/Icons';
import '../styles/ClienteDocumentos.css';
import '../styles/FichaAnamneseModal.css';

const todayLabel = new Date().toLocaleDateString('pt-BR');

const RentalContrato = () => {
  const [searchParams] = useSearchParams();
  const rentalBookingId = searchParams.get('rental');

  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [agreed, setAgreed] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [signing, setSigning] = useState(false);
  const [signError, setSignError] = useState('');
  const signatureRef = useRef(null);

  const [step, setStep] = useState(null); // null | 'selfie' | 'done'
  const [selfiePreview, setSelfiePreview] = useState(null);
  const [selfieUploading, setSelfieUploading] = useState(false);
  const [selfieError, setSelfieError] = useState('');

  useEffect(() => {
    if (!rentalBookingId) {
      setLoading(false);
      return;
    }
    getRentalBookingForDocs(rentalBookingId)
      .then(setClient)
      .catch((err) => {
        console.error('Erro ao carregar dados da locação:', err);
        setError('Não foi possível carregar os dados. Peça um novo link à clínica.');
      })
      .finally(() => setLoading(false));
  }, [rentalBookingId]);

  const handleClearSignature = () => {
    signatureRef.current && signatureRef.current.clear();
    setHasSignature(false);
  };

  const confirmSign = async () => {
    if (!agreed || !hasSignature || !rentalBookingId) return;
    const dataUrl = signatureRef.current ? signatureRef.current.toDataURL() : null;
    setSigning(true);
    setSignError('');
    try {
      await submitRentalSignature(rentalBookingId, dataUrl, client?.name);
      setStep('selfie');
    } catch (err) {
      console.error('Erro ao assinar contrato:', err);
      setSignError('Não foi possível registrar a assinatura. Tente novamente.');
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

      {client && step === null && (
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
            Li e concordo com os termos descritos acima e confirmo minha assinatura digital.
          </label>

          <div className="cliente-signature-box">
            <div className="cliente-signature-label">Assine no campo abaixo</div>
            <SignatureCanvas
              ref={signatureRef}
              className="cliente-signature-canvas"
              onStrokeEnd={() => setHasSignature(true)}
            />
            <div className="cliente-signature-footer">
              <span className="cliente-signature-meta">ASSINATURA DIGITAL · {todayLabel}</span>
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
              disabled={!agreed || !hasSignature || signing}
              className="cliente-modal-confirm"
            >
              {signing ? 'ENVIANDO...' : 'CONFIRMAR ASSINATURA'}
            </button>
          </div>
        </>
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
          </div>
        </div>
      )}
    </div>
  );
};

export default RentalContrato;
