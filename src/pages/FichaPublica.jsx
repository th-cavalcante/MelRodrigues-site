import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import DocumentosOnboarding from '../components/cliente/DocumentosOnboarding';
import '../styles/ClienteDocumentos.css';
import '../styles/FichaPublica.css';

const FichaPublica = () => {
  const [searchParams] = useSearchParams();
  const docsUnlocked = searchParams.get('docs') === 'liberado';
  const patientId = searchParams.get('patient');

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
        <span className="section-eyebrow">Antes do seu atendimento</span>
        <h1 className="cliente-title">{docsUnlocked ? 'Assinatura de Documentos' : 'Ficha de Anamnese'}</h1>
        <p className="cliente-subtitle">
          {patientId
            ? docsUnlocked
              ? 'Assine abaixo o contrato de prestação de serviço e o termo de consentimento.'
              : 'Preencha seus dados abaixo com atenção. O contrato e o termo de consentimento ficam disponíveis em uma etapa posterior.'
            : 'Este link está incompleto ou inválido. Peça à clínica um novo link.'}
        </p>
      </section>

      {patientId && (
        <DocumentosOnboarding
          patientId={patientId}
          clientName="Paciente"
          lockDocuments={!docsUnlocked}
          hideFicha={docsUnlocked}
        />
      )}
    </div>
  );
};

export default FichaPublica;
