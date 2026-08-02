import React, { useState } from 'react';
import { IconClipboard } from './Icons';

const AnamneseLinkView = () => {
  const [copied, setCopied] = useState(false);
  const link = `${window.location.origin}/cliente/anamnese`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Erro ao copiar link:', err);
    }
  };

  return (
    <div>
      <div className="admin-page-header">
        <span className="section-eyebrow">Área Clínica</span>
        <h1 className="admin-page-title">Anamnese</h1>
        <p className="admin-page-subtitle">
          Envie este link pra quem só quer saber se pode fazer a depilação a laser
          antes de marcar um horário. Ao preencher, a pessoa já fica cadastrada no
          sistema — depois é só abrir o cadastro dela em Clientes pra agendar a
          avaliação.
        </p>
      </div>

      <div className="admin-card">
        <div className="admin-card-title">Link da Ficha de Anamnese</div>
        <div className="admin-anamnese-linkbox">
          <div className="admin-anamnese-link-icon"><IconClipboard size={20} /></div>
          <input type="text" readOnly value={link} className="field-input admin-anamnese-link-input" />
          <button type="button" onClick={handleCopy} className="admin-open-client-btn">
            {copied ? 'Copiado ✓' : '🔗 Copiar Link'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnamneseLinkView;
