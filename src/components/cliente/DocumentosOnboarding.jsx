import React, { useEffect, useRef, useState } from 'react';
import SignatureCanvas from '../SignatureCanvas';
import FichaAnamneseModal from './FichaAnamneseModal';
import { downloadFichaPdf } from './fichaPdf';
import { downloadDocPdf } from './docPdf';
import { docsMeta } from './documentTemplates';
import { getPatientForDocs, submitSignature } from '../../lib/patients';
import '../../styles/ClienteDocumentos.css';

const todayLabel = new Date().toLocaleDateString('pt-BR');

/**
 * Shared "fill anamnese + sign contrato/termo" flow.
 * Used both by the client-facing documents page and the admin's patient onboarding tab.
 */
const DocumentosOnboarding = ({ patientId, clientName, onAnamneseSaved, onDocSigned, lockDocuments, hideFicha }) => {
  const [anamnese, setAnamnese] = useState(null);
  const [loadingAnamnese, setLoadingAnamnese] = useState(!!hideFicha);
  const [fichaModalOpen, setFichaModalOpen] = useState(false);
  const [signed, setSigned] = useState({ contrato: false, termo: false });
  const [signatures, setSignatures] = useState({ contrato: null, termo: null });
  const [activeDocKey, setActiveDocKey] = useState(null);
  const [agreed, setAgreed] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [signError, setSignError] = useState('');
  const [signing, setSigning] = useState(false);
  const signatureRef = useRef(null);

  useEffect(() => {
    if (!hideFicha || !patientId) return;
    getPatientForDocs(patientId)
      .then(setAnamnese)
      .catch((err) => console.error('Erro ao carregar dados do paciente:', err))
      .finally(() => setLoadingAnamnese(false));
  }, [hideFicha, patientId]);

  const isAnamnesePreenchida = !!(anamnese && anamnese.nome && anamnese.cpf);
  const displayName = (anamnese && anamnese.nome) || clientName;

  const openModal = (key) => {
    if ((!isAnamnesePreenchida && !hideFicha) || lockDocuments) return;
    setActiveDocKey(key);
    setAgreed(false);
    setHasSignature(false);
    setSignError('');
  };

  const closeModal = () => {
    signatureRef.current && signatureRef.current.clear();
    setActiveDocKey(null);
    setAgreed(false);
    setHasSignature(false);
  };

  const handleClearSignature = () => {
    signatureRef.current && signatureRef.current.clear();
    setHasSignature(false);
  };

  const confirmSign = async () => {
    if (!agreed || !hasSignature || !activeDocKey || !patientId) return;
    const dataUrl = signatureRef.current ? signatureRef.current.toDataURL() : null;
    setSigning(true);
    setSignError('');
    try {
      await submitSignature(patientId, activeDocKey, dataUrl, displayName);
      setSignatures((s) => ({ ...s, [activeDocKey]: dataUrl }));
      setSigned((s) => ({ ...s, [activeDocKey]: true }));
      if (onDocSigned) {
        onDocSigned(activeDocKey, { fileName: `${activeDocKey}-assinatura.png`, url: dataUrl });
      }
      setActiveDocKey(null);
      setAgreed(false);
      setHasSignature(false);
    } catch (err) {
      console.error('Erro ao assinar documento:', err);
      setSignError('Não foi possível registrar a assinatura. Tente novamente.');
    } finally {
      setSigning(false);
    }
  };

  const activeMeta = activeDocKey ? docsMeta[activeDocKey] : null;
  const activeBody = activeMeta ? activeMeta.buildBody(anamnese) : null;

  if (hideFicha && loadingAnamnese) {
    return <p className="cliente-subtitle">Carregando seus dados...</p>;
  }

  return (
    <>
      <section className="cliente-docs">
        {!hideFicha && (
          <div className="cliente-doc-card">
            <div className="cliente-doc-icon">📋</div>
            <div className="cliente-doc-info">
              <div className="cliente-doc-title">Ficha de Anamnese</div>
              <div className="cliente-doc-status">
                {isAnamnesePreenchida ? 'Preenchida ✓' : 'Aguardando preenchimento'}
              </div>
            </div>
            <div className="cliente-doc-btn-group">
              {isAnamnesePreenchida && (
                <button
                  type="button"
                  onClick={() => downloadFichaPdf(anamnese)}
                  className="cliente-doc-btn cliente-doc-btn-secondary"
                >
                  BAIXAR PDF
                </button>
              )}
              <button
                type="button"
                onClick={() => setFichaModalOpen(true)}
                className="cliente-doc-btn"
              >
                {isAnamnesePreenchida ? 'EDITAR FICHA' : 'PREENCHER FICHA'}
              </button>
            </div>
          </div>
        )}

        {hideFicha && Object.entries(docsMeta).map(([key, meta]) => {
          const isSigned = signed[key];
          const blocked = lockDocuments || (!hideFicha && !isAnamnesePreenchida && !isSigned);
          return (
            <div key={key} className={`cliente-doc-card ${lockDocuments && !isSigned ? 'locked' : ''}`}>
              <div className="cliente-doc-icon">{meta.icon}</div>
              <div className="cliente-doc-info">
                <div className="cliente-doc-title">{meta.title}</div>
                <div className="cliente-doc-status">
                  {isSigned
                    ? 'Assinado digitalmente ✓'
                    : lockDocuments
                      ? 'Indisponível no momento'
                      : blocked
                        ? 'Preencha a Ficha de Anamnese primeiro'
                        : 'Aguardando assinatura'}
                </div>
              </div>
              {isSigned && signatures[key] && (
                <img
                  src={signatures[key]}
                  alt={`Assinatura de ${displayName}`}
                  className="cliente-signed-thumb"
                />
              )}
              <div className="cliente-doc-btn-group">
                {isSigned && (
                  <button
                    type="button"
                    onClick={() =>
                      downloadDocPdf({
                        title: meta.title,
                        body: meta.buildBody(anamnese),
                        signatureDataUrl: signatures[key],
                        patientName: displayName,
                        dateLabel: todayLabel,
                      })
                    }
                    className="cliente-doc-btn cliente-doc-btn-secondary"
                  >
                    BAIXAR PDF
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => openModal(key)}
                  disabled={isSigned || blocked}
                  className={`cliente-doc-btn ${isSigned ? 'signed' : ''}`}
                >
                  {isSigned ? 'ASSINADO' : key === 'contrato' ? 'ASSINAR CONTRATO' : 'ASSINAR TERMO'}
                </button>
              </div>
            </div>
          );
        })}
      </section>

      {fichaModalOpen && (
        <FichaAnamneseModal
          patientId={patientId}
          initialData={anamnese}
          onClose={() => setFichaModalOpen(false)}
          onSaved={(data) => {
            setAnamnese(data);
            if (onAnamneseSaved) onAnamneseSaved(data);
          }}
        />
      )}

      {activeMeta && (
        <div className="cliente-modal-overlay">
          <div className="cliente-modal">
            <div className="cliente-modal-header">
              <span className="section-eyebrow">Assinatura Digital</span>
              <h2 className="cliente-modal-title">{activeMeta.title}</h2>
            </div>

            <div className="cliente-modal-body-text">{activeBody}</div>

            <label className="cliente-agree-label">
              <input
                type="checkbox"
                checked={agreed}
                onChange={() => setAgreed((v) => !v)}
                className="cliente-agree-checkbox"
              />
              Li e concordo com os termos descritos acima e confirmo minha
              assinatura digital.
            </label>

            <div className="cliente-signature-box">
              <div className="cliente-signature-label">
                Assine no campo abaixo
              </div>
              <SignatureCanvas
                ref={signatureRef}
                className="cliente-signature-canvas"
                onStrokeEnd={() => setHasSignature(true)}
              />
              <div className="cliente-signature-footer">
                <span className="cliente-signature-meta">
                  ASSINATURA DIGITAL · {todayLabel}
                </span>
                <button
                  type="button"
                  onClick={handleClearSignature}
                  className="cliente-signature-clear"
                >
                  Limpar
                </button>
              </div>
            </div>

            {signError && <div className="admin-login-error">{signError}</div>}

            <div className="cliente-modal-actions">
              <button type="button" onClick={closeModal} className="cliente-modal-cancel">
                CANCELAR
              </button>
              <button
                type="button"
                onClick={confirmSign}
                disabled={!agreed || !hasSignature || signing}
                className="cliente-modal-confirm"
              >
                {signing ? 'ENVIANDO...' : 'CONFIRMAR ASSINATURA'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DocumentosOnboarding;
