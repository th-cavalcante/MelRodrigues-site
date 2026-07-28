import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { IconEye, IconEyeOff, IconAlertCircle, IconCheckCircle, IconChevronLeft } from '../components/admin/Icons';
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
      <Link to="/" className="admin-login-back">
        <span>←</span> Voltar ao site
      </Link>

      <div className="admin-login-wrap">
        <div className="admin-login-brand">
          <img src="/images/logo.png" alt="MR Laser" className="admin-login-brand-logo" />
          <span className="admin-login-brand-tagline">Painel Administrativo</span>
        </div>

        <div className="admin-login-card">
          {mode === 'login' && (
            <>
              <div className="admin-login-heading">
                <span className="admin-login-title">Bem-vindo de volta</span>
                <span className="admin-login-subtitle">Entre com sua conta para continuar</span>
              </div>

              <form onSubmit={handleLogin} autoComplete="on" className="admin-login-form">
                <div className="ll-field">
                  <label className="ll-label" htmlFor="login-email">E-mail</label>
                  <input
                    id="login-email"
                    name="email"
                    type="email"
                    autoComplete="username"
                    placeholder="seu@email.com"
                    value={form.email}
                    onChange={handleField('email')}
                    className="ll-input"
                  />
                </div>

                <div className="ll-field">
                  <div className="ll-label-row">
                    <label className="ll-label" htmlFor="login-password">Senha</label>
                    <a href="#!" className="ll-link" onClick={(e) => { e.preventDefault(); openForgotPassword(); }}>
                      Esqueceu a senha?
                    </a>
                  </div>
                  <div className="ll-password-field">
                    <input
                      id="login-password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      placeholder="••••••••"
                      value={form.password}
                      onChange={handleField('password')}
                      className="ll-input"
                    />
                    <button type="button" onClick={togglePassword} className="ll-eye-toggle" aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}>
                      {showPassword ? <IconEyeOff /> : <IconEye />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="ll-error">
                    <IconAlertCircle />
                    <span>{error}</span>
                  </div>
                )}

                <button type="submit" className="ll-submit" disabled={loading}>
                  {loading ? <span className="ll-spinner" /> : 'Entrar'}
                </button>
              </form>
            </>
          )}

          {mode === 'forgot' && !forgotSent && (
            <>
              <div className="admin-login-heading">
                <span className="admin-login-title">Recuperar senha</span>
                <span className="admin-login-subtitle">Enviaremos um link de redefinição para seu e-mail</span>
              </div>

              <form onSubmit={handleForgotSubmit} className="admin-login-form">
                <div className="ll-field">
                  <label className="ll-label" htmlFor="forgot-email">E-mail</label>
                  <input
                    id="forgot-email"
                    type="email"
                    placeholder="seu@email.com"
                    value={forgotEmail}
                    onChange={(e) => { setForgotEmail(e.target.value); setError(''); }}
                    className="ll-input"
                  />
                </div>

                {error && (
                  <div className="ll-error">
                    <IconAlertCircle />
                    <span>{error}</span>
                  </div>
                )}

                <button type="submit" className="ll-submit" disabled={loading}>
                  {loading ? <span className="ll-spinner" /> : 'Enviar link'}
                </button>
              </form>

              <button type="button" onClick={backToLogin} className="ll-back-btn">
                <IconChevronLeft size={14} /> Voltar para o login
              </button>
            </>
          )}

          {mode === 'forgot' && forgotSent && (
            <>
              <div className="admin-login-heading">
                <span className="admin-login-title">Recuperar senha</span>
                <span className="admin-login-subtitle">Enviaremos um link de redefinição para seu e-mail</span>
              </div>

              <div className="ll-success">
                <div className="ll-success-icon">
                  <IconCheckCircle />
                </div>
                <span className="ll-success-text">
                  Link enviado para <strong>{forgotEmail}</strong>. Verifique sua caixa de entrada (e o spam).
                </span>
              </div>

              <button type="button" onClick={backToLogin} className="ll-back-btn">
                <IconChevronLeft size={14} /> Voltar para o login
              </button>
            </>
          )}
        </div>

        <span className="admin-login-footer">Acesso restrito à equipe MR Laser.</span>
      </div>
    </div>
  );
};

export default AdminLogin;
