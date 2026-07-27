import React, { useEffect, useState } from 'react';
import { verifyBiometric } from '../../lib/biometric';
import '../../styles/AdminLogin.css';

const BiometricLock = ({ onUnlock }) => {
  const [error, setError] = useState('');
  const [verifying, setVerifying] = useState(false);

  const handleUnlock = async () => {
    setError('');
    setVerifying(true);
    try {
      const ok = await verifyBiometric();
      if (ok) {
        onUnlock();
      } else {
        setError('Não foi possível confirmar sua identidade.');
      }
    } catch (err) {
      console.error('Erro ao verificar biometria:', err);
      setError('Autenticação cancelada ou não reconhecida.');
    } finally {
      setVerifying(false);
    }
  };

  // Já abre pedindo a digital/Face ID direto, sem precisar de um toque a mais.
  useEffect(() => {
    handleUnlock();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="admin-login-page">
      <div className="admin-login-lines" aria-hidden="true"></div>
      <div className="admin-login-letter" aria-hidden="true">M</div>

      <div className="admin-login-card">
        <div className="admin-login-header">
          <div className="admin-login-logo">
            <img src="/images/logo.png" alt="MR Laser" />
          </div>
          <div className="admin-login-divider"></div>
          <div className="admin-login-eyebrow">Painel Administrativo</div>
        </div>

        <p className="admin-login-forgot-hint" style={{ textAlign: 'center' }}>
          🔒 Confirme sua digital ou Face ID pra continuar.
        </p>

        {error && <div className="admin-login-error">{error}</div>}

        <button type="button" onClick={handleUnlock} disabled={verifying} className="admin-login-submit">
          {verifying ? 'VERIFICANDO...' : '👆 DESBLOQUEAR'}
        </button>

        <div className="admin-login-footer">
          Acesso restrito à equipe MR Laser.
        </div>
      </div>
    </div>
  );
};

export default BiometricLock;
