import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getSessionForConfirmation, confirmSession } from '../lib/patients';
import '../styles/ConfirmarSessao.css';

const ConfirmarSessao = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session');

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checked, setChecked] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!sessionId) {
      setLoading(false);
      return;
    }
    getSessionForConfirmation(sessionId)
      .then((data) => {
        setSession(data);
        if (data && data.confirmed_at) setConfirmed(true);
      })
      .catch((err) => {
        console.error('Erro ao carregar sessão:', err);
        setError('Não foi possível carregar os dados da sessão.');
      })
      .finally(() => setLoading(false));
  }, [sessionId]);

  const handleConfirm = async () => {
    if (!checked) return;
    setSubmitting(true);
    setError('');
    try {
      await confirmSession(sessionId);
      setConfirmed(true);
    } catch (err) {
      console.error('Erro ao confirmar sessão:', err);
      setError('Não foi possível confirmar. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="confirmar-page">
      <div className="confirmar-content">
        {!sessionId && (
          <div className="confirmar-card">
            <p className="confirmar-subtitle">Este link está incompleto ou inválido.</p>
          </div>
        )}

        {sessionId && loading && (
          <div className="confirmar-card">
            <p className="confirmar-subtitle">Carregando...</p>
          </div>
        )}

        {sessionId && !loading && !session && (
          <div className="confirmar-card">
            <p className="confirmar-subtitle">Sessão não encontrada.</p>
          </div>
        )}

        {sessionId && !loading && session && !confirmed && (
          <div className="confirmar-card">
            <span className="section-eyebrow">Antes do seu atendimento</span>
            <h1 className="confirmar-title">Confirme sua sessão</h1>
            <p className="confirmar-subtitle">
              Olá, {session.patient_name || 'paciente'}! Confirme abaixo sua
              presença na Sessão {session.session_num}
              {session.session_date
                ? ` do dia ${new Date(session.session_date).toLocaleDateString('pt-BR')}`
                : ''}
              .
            </p>

            <label className="confirmar-check-label">
              <input
                type="checkbox"
                checked={checked}
                onChange={() => setChecked((v) => !v)}
                className="confirmar-checkbox"
              />
              Confirmo minha presença nesta sessão
            </label>

            {error && <div className="admin-login-error">{error}</div>}

            <button
              type="button"
              onClick={handleConfirm}
              disabled={!checked || submitting}
              className="confirmar-btn"
            >
              {submitting ? 'ENVIANDO...' : 'ENVIAR'}
            </button>
          </div>
        )}

        {confirmed && (
          <div className="confirmar-card confirmar-thanks">
            <div className="confirmar-thanks-icon">✓</div>
            <h1 className="confirmar-title">Obrigado pela sua confirmação!</h1>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConfirmarSessao;
