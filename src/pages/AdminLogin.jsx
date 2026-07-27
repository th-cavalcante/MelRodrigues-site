import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/AdminLogin.css';

const mapAuthError = (message) => {
  if (message === 'Invalid login credentials') return 'E-mail ou senha incorretos.';
  return 'Não foi possível entrar. Tente novamente.';
};

const initialForm = { email: '', password: '' };

const AdminLogin = () => {
  const [form, setForm] = useState(initialForm);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState('login'); // 'login' | 'forgot'
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);
  const navigate = useNavigate();
  const { signIn, sendPasswordReset } = useAuth();

  const handleField = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setError('');
  };

  const togglePassword = () => {
    setShowPassword((v) => !v);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const { email, password } = form;
    if (!email || !password) {
      setError('Preencha e-mail e senha para continuar.');
      return;
    }
    if (!email.includes('@')) {
      setError('Informe um e-mail válido.');
      return;
    }
    setLoading(true);
    setError('');
    const { error: authError } = await signIn(email, password);
    setLoading(false);
    if (authError) {
      setError(mapAuthError(authError.message));
      return;
    }
    navigate('/admin/dashboard');
  };

  const openForgotPassword = () => {
    setMode('forgot');
    setForgotEmail(form.email);
    setForgotSent(false);
    setError('');
  };

  const backToLogin = () => {
    setMode('login');
    setError('');
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    if (!forgotEmail || !forgotEmail.includes('@')) {
      setError('Informe um e-mail válido.');
      return;
    }
    setLoading(true);
    setError('');
    const { error: resetError } = await sendPasswordReset(forgotEmail.trim());
    setLoading(false);
    if (resetError) {
      setError('Não foi possível enviar o e-mail. Tente novamente.');
      return;
    }
    setForgotSent(true);
  };

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
          <div className="admin-login-eyebrow">Painel Administrativo</div>
        </div>

        {mode === 'login' && (
          <form onSubmit={handleLogin} autoComplete="on">
            <div className="field-wrap">
              <label className="field-label" htmlFor="login-email">E-mail</label>
              <input
                id="login-email"
                name="email"
                type="email"
                autoComplete="username"
                placeholder="seu@email.com"
                value={form.email}
                onChange={handleField('email')}
                className="field-input"
              />
            </div>

            <div className="field-wrap-tight">
              <label className="field-label" htmlFor="login-password">Senha</label>
              <div className="password-field">
                <input
                  id="login-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Digite sua senha"
                  value={form.password}
                  onChange={handleField('password')}
                  className="field-input"
                />
                <button
                  type="button"
                  onClick={togglePassword}
                  className="password-toggle"
                >
                  {showPassword ? 'OCULTAR' : 'MOSTRAR'}
                </button>
              </div>
            </div>

            <div className="admin-login-options">
              <span></span>
              <a href="#!" className="forgot-link" onClick={(e) => { e.preventDefault(); openForgotPassword(); }}>
                Esqueci minha senha
              </a>
            </div>

            {error && <div className="admin-login-error">{error}</div>}

            <button type="submit" className="admin-login-submit" disabled={loading}>
              {loading ? 'ENTRANDO...' : 'ENTRAR'}
            </button>
          </form>
        )}

        {mode === 'forgot' && !forgotSent && (
          <form onSubmit={handleForgotSubmit}>
            <p className="admin-login-forgot-hint">
              Informe o e-mail da sua conta. Vamos enviar um link para você redefinir a senha.
            </p>
            <div className="field-wrap">
              <label className="field-label" htmlFor="forgot-email">E-mail</label>
              <input
                id="forgot-email"
                type="email"
                placeholder="seu@email.com"
                value={forgotEmail}
                onChange={(e) => { setForgotEmail(e.target.value); setError(''); }}
                className="field-input"
              />
            </div>

            {error && <div className="admin-login-error">{error}</div>}

            <button type="submit" className="admin-login-submit" disabled={loading}>
              {loading ? 'ENVIANDO...' : 'ENVIAR LINK DE RECUPERAÇÃO'}
            </button>

            <button type="button" onClick={backToLogin} className="admin-login-back-link">
              ← Voltar para o login
            </button>
          </form>
        )}

        {mode === 'forgot' && forgotSent && (
          <div>
            <p className="admin-login-forgot-hint">
              Enviamos um link de recuperação para <strong>{forgotEmail}</strong>. Verifique sua
              caixa de entrada (e o spam) e clique no link para escolher uma nova senha.
            </p>
            <button type="button" onClick={backToLogin} className="admin-login-submit admin-login-back-btn">
              VOLTAR PARA O LOGIN
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

export default AdminLogin;
