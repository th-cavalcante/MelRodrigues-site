import React from 'react';
import { Link } from 'react-router-dom';
import '../../styles/AccessDenied.css';

const AccessDenied = ({ loginPath = '/admin/login' }) => {
  return (
    <div className="access-denied-page">
      <div className="access-denied-card">
        <span className="access-denied-icon">🔒</span>
        <span className="section-eyebrow">Acesso Restrito</span>
        <h1 className="access-denied-title">Acesso Negado</h1>
        <p className="access-denied-text">
          Você precisa estar autenticado com a permissão correta para ver
          esta página.
        </p>
        <Link to={loginPath} className="access-denied-button">
          VOLTAR PARA O LOGIN
        </Link>
      </div>
    </div>
  );
};

export default AccessDenied;
