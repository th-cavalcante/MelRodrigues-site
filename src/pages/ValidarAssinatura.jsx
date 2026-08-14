import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getSignatureForValidation } from '../lib/signatures';
import { IconAlertCircle, IconCheckCircle } from '../components/admin/Icons';
import '../styles/ClienteDocumentos.css';

const SUBJECT_LABELS = {
  rental_contract: 'Contrato de Locação — Hakon 4D',
  patient_contrato: 'Contrato de Prestação de Serviço',
  patient_termo: 'Termo de Consentimento Livre e Esclarecido',
};

const STATUS_LABELS = {
  valid: 'ASSINADO',
  superseded: 'SUBSTITUÍDO POR NOVA VERSÃO',
  canceled: 'CANCELADO',
};

const ValidarAssinatura = () => {
  const { signatureId } = useParams();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!signatureId) {
      setLoading(false);
      return;
    }
    getSignatureForValidation(signatureId)
      .then((data) => {
        if (!data) setError('Nenhuma assinatura encontrada com este ID.');
        else setResult(data);
      })
      .catch((err) => {
        console.error('Erro ao validar assinatura:', err);
        setError('Não foi possível consultar este registro agora. Tente novamente.');
      })
      .finally(() => setLoading(false));
  }, [signatureId]);

  return (
    <div className="cliente-page">
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

      <div className="cliente-validation-page">
        <span className="section-eyebrow">Validação de Assinatura</span>
        <h1 className="cliente-title">Registro de Assinatura Eletrônica</h1>

        {loading && <p className="cliente-subtitle">Consultando...</p>}

        {error && (
          <div className="admin-login-error">
            <IconAlertCircle size={14} /> <span>{error}</span>
          </div>
        )}

        {result && (
          <>
            <div className={`cliente-validation-status ${result.status}`}>
              <IconCheckCircle size={14} /> {STATUS_LABELS[result.status] || result.status?.toUpperCase()}
            </div>

            <dl className="cliente-validation-fields">
              <dt>Documento</dt>
              <dd>{SUBJECT_LABELS[result.subject_type] || result.subject_type}</dd>

              <dt>Signatário</dt>
              <dd>{result.signer_name || '—'}</dd>

              <dt>Data da assinatura</dt>
              <dd>{result.signed_at ? new Date(result.signed_at).toLocaleString('pt-BR') : '—'}</dd>

              <dt>ID da assinatura</dt>
              <dd>{result.signature_id}</dd>

              <dt>Versão do documento</dt>
              <dd>{result.version_number || 1}</dd>
            </dl>

            <p className="cliente-subtitle" style={{ fontSize: '13px' }}>
              Este documento possui registro eletrônico de assinatura e integridade no sistema da MR Laser.
              Esta página não constitui certificação ICP-Brasil — trata-se de evidência técnica de assinatura
              eletrônica simples, registrada com trilha de auditoria interna.
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default ValidarAssinatura;
