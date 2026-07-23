import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/AdminLogin.css';

const AdminResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const navigate = useNavigate();
  const { user, passwordRecovery, updatePassword, setPasswordRecovery } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
      setError('A senha precisa ter pelo menos 6 caracteres.');
      return;
    }
    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }
    setLoading(true);
    setError('');
    const { error: updateError } = await updatePassword(password);
    setLoading(false);
    if (updateError) {
      setError('Não foi possível redefinir a senha. O link pode ter expirado — solicite um novo.');
      return;
    }
    setPasswordRecovery(false);
    setDone(true);
  };

  const canReset = passwordRecovery || user;

  return (
    <div className="admin-login-page">
      <div className="admin-login-lines" aria-hidden="true"></div>
      <div className="admin-login-letter" aria-hidden="true">M</div>

      <Link to="/" className="admin-login-back">
        <span>←</span> Voltar ao site
      </Link>

      <div className="admin-login-card">
        <div className="admin-login-header">
          <div className="admin-login-logo">
            <img src="/images/logo.png" alt="MR Laser" />
          </div>
          <div className="admin-login-divider"></div>
          <div className="admin-login-eyebrow">Redefinir Senha</div>
        </div>

        {!canReset && !done && (
          <p className="admin-login-forgot-hint">
            Esse link de redefinição é inválido ou expirou. Volte ao login e clique em
            "Esqueci minha senha" para solicitar um novo.
          </p>
        )}

        {canReset && !done && (
          <form onSubmit={handleSubmit}>
            <p className="admin-login-forgot-hint">Escolha uma nova senha para sua conta.</p>

            <div className="field-wrap">
              <label className="field-label" htmlFor="reset-password">Nova senha</label>
              <div className="password-field">
                <input
                  id="reset-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  className="field-input"
                />
                <button type="button" onClick={() => setShowPassword((v) => !v)} className="password-toggle">
                  {showPassword ? 'OCULTAR' : 'MOSTRAR'}
                </button>
              </div>
            </div>

            <div className="field-wrap-tight">
              <label className="field-label" htmlFor="reset-password-confirm">Confirme a nova senha</label>
              <input
                id="reset-password-confirm"
                type={showPassword ? 'text' : 'password'}
                placeholder="Repita a senha"
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }}
                className="field-input"
              />
            </div>

            {error && <div className="admin-login-error">{error}</div>}

            <button type="submit" className="admin-login-submit" disabled={loading} style={{ marginTop: '22px' }}>
              {loading ? 'SALVANDO...' : 'SALVAR NOVA SENHA'}
            </button>
          </form>
        )}

        {done && (
          <div>
            <p className="admin-login-forgot-hint">
              Senha redefinida com sucesso! Você já pode acessar o painel.
            </p>
            <button
              type="button"
              onClick={() => navigate('/admin/dashboard')}
              className="admin-login-submit"
            >
              IR PARA O PAINEL
            </button>
          </div>
        )}

        <div className="admin-login-footer">
          Acesso restrito à equipe MR Laser.
        </div>
      </div>
    </div>
  );
};

export default AdminResetPassword;
