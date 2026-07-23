import React, { useState } from 'react';

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

const SettingsView = () => {
  const [clinic, setClinic] = useState(initialClinicSettings);
  const [toggles, setToggles] = useState(initialToggles);

  const setClinicField = (field) => (e) => {
    setClinic((c) => ({ ...c, [field]: e.target.value }));
  };

  const toggleSetting = (key) => {
    setToggles((t) => ({ ...t, [key]: !t[key] }));
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
    </div>
  );
};

export default SettingsView;
