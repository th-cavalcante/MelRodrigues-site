import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  isBiometricAvailable,
  isBiometricEnabled,
  registerBiometric,
  disableBiometric,
} from '../../lib/biometric';

const initialClinicSettings = {
  name: 'MR Laser',
  phone: '(11) 9 8765-4321',
  address: 'Av. Paulista, 1000 — São Paulo, SP',
};

const togglesMeta = [
  { key: 'email', label: 'Notificações por E-mail', desc: 'Receber resumo diário de agendamentos' },
  { key: 'sms', label: 'Notificações por SMS', desc: 'Alertas de novos agendamentos por SMS' },
  { key: 'whatsapp', label: 'Notificações por WhatsApp', desc: 'Lembretes automáticos para clientes' },
];

const initialToggles = { email: true, sms: false, whatsapp: true };

const SettingsView = ({ theme, onToggleTheme }) => {
  const { user } = useAuth();
  const [clinic, setClinic] = useState(initialClinicSettings);
  const [toggles, setToggles] = useState(initialToggles);
  const [bioSupported, setBioSupported] = useState(false);
  const [bioEnabled, setBioEnabled] = useState(isBiometricEnabled());
  const [bioBusy, setBioBusy] = useState(false);
  const [bioError, setBioError] = useState('');

  useEffect(() => {
    isBiometricAvailable().then(setBioSupported);
  }, []);

  const setClinicField = (field) => (e) => {
    setClinic((c) => ({ ...c, [field]: e.target.value }));
  };

  const toggleSetting = (key) => {
    setToggles((t) => ({ ...t, [key]: !t[key] }));
  };

  const handleToggleBiometric = async () => {
    setBioError('');
    if (bioEnabled) {
      disableBiometric();
      setBioEnabled(false);
      return;
    }
    setBioBusy(true);
    try {
      await registerBiometric(user?.email);
      setBioEnabled(true);
    } catch (err) {
      console.error('Erro ao ativar biometria:', err);
      setBioError('Não foi possível ativar. Verifique se este aparelho tem digital ou Face ID configurado.');
    } finally {
      setBioBusy(false);
    }
  };

  return (
    <div className="admin-settings-page">
      <div className="admin-page-header">
        <span className="section-eyebrow">Preferências</span>
        <h1 className="admin-page-title">Configurações</h1>
      </div>

      <div className="admin-card">
        <h3 className="admin-card-title">Dados da Clínica</h3>
        <label className="admin-small-label">Nome da Clínica</label>
        <input
          type="text"
          value={clinic.name}
          onChange={setClinicField('name')}
          className="field-input"
        />
        <div className="admin-settings-row">
          <div>
            <label className="admin-small-label admin-small-label-spaced">Telefone</label>
            <input
              type="text"
              value={clinic.phone}
              onChange={setClinicField('phone')}
              className="field-input"
            />
          </div>
          <div>
            <label className="admin-small-label admin-small-label-spaced">Endereço</label>
            <input
              type="text"
              value={clinic.address}
              onChange={setClinicField('address')}
              className="field-input"
            />
          </div>
        </div>
      </div>

      <div className="admin-card">
        <h3 className="admin-card-title admin-card-title-tight">Aparência</h3>
        <div className="admin-toggle-row">
          <div>
            <div className="admin-toggle-label">Modo escuro</div>
            <div className="admin-toggle-desc">Usar tema escuro no painel administrativo</div>
          </div>
          <button
            type="button"
            onClick={onToggleTheme}
            className={`admin-toggle-track ${theme === 'dark' ? 'on' : ''}`}
            aria-pressed={theme === 'dark'}
          >
            <span className="admin-toggle-thumb"></span>
          </button>
        </div>
      </div>

      <div className="admin-card">
        <h3 className="admin-card-title admin-card-title-tight">Notificações</h3>
        {togglesMeta.map((t) => (
          <div key={t.key} className="admin-toggle-row">
            <div>
              <div className="admin-toggle-label">{t.label}</div>
              <div className="admin-toggle-desc">{t.desc}</div>
            </div>
            <button
              type="button"
              onClick={() => toggleSetting(t.key)}
              className={`admin-toggle-track ${toggles[t.key] ? 'on' : ''}`}
              aria-pressed={toggles[t.key]}
            >
              <span className="admin-toggle-thumb"></span>
            </button>
          </div>
        ))}
      </div>

      {bioSupported && (
        <div className="admin-card">
          <h3 className="admin-card-title admin-card-title-tight">Segurança</h3>
          <div className="admin-toggle-row">
            <div>
              <div className="admin-toggle-label">Desbloqueio por Digital / Face ID</div>
              <div className="admin-toggle-desc">Exige biometria pra abrir o painel neste aparelho</div>
            </div>
            <button
              type="button"
              onClick={handleToggleBiometric}
              disabled={bioBusy}
              className={`admin-toggle-track ${bioEnabled ? 'on' : ''}`}
              aria-pressed={bioEnabled}
            >
              <span className="admin-toggle-thumb"></span>
            </button>
          </div>
          {bioError && <div className="admin-login-error">{bioError}</div>}
        </div>
      )}
    </div>
  );
};

export default SettingsView;
