import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AccessDenied from '../components/admin/AccessDenied';
import DocumentosOnboarding from '../components/cliente/DocumentosOnboarding';
import '../styles/ClienteDocumentos.css';

const ClienteDocumentos = () => {
  const [role] = useState(() => sessionStorage.getItem('mrlaser_role'));
  const [clientName] = useState(
    () => sessionStorage.getItem('mrlaser_client_name') || 'Camila Rodrigues'
  );
  const navigate = useNavigate();

  if (role !== 'cliente') {
    return <AccessDenied loginPath="/admin/login" />;
  }

  const handleLogout = () => {
    sessionStorage.removeItem('mrlaser_role');
    sessionStorage.removeItem('mrlaser_client_name');
    navigate('/admin/login');
  };

  return (
    <div className="cliente-page">
      <nav className="cliente-nav">
        <div className="cliente-logo">
          <img src="/images/logo.png" alt="MR Laser" />
        </div>
        <div className="cliente-nav-right">
          <span className="cliente-greeting">
            Olá, <strong>{clientName}</strong>
          </span>
          <button type="button" className="cliente-logout" onClick={handleLogout}>
            Sair
          </button>
        </div>
      </nav>

      <section className="cliente-header">
        <span className="section-eyebrow">Área da Cliente</span>
        <h1 className="cliente-title">Documentos Pendentes</h1>
        <p className="cliente-subtitle">
          Antes de iniciar seu tratamento, precisamos que você revise e
          assine os documentos abaixo.
        </p>
      </section>

      <DocumentosOnboarding clientName={clientName} />
    </div>
  );
};

export default ClienteDocumentos;
