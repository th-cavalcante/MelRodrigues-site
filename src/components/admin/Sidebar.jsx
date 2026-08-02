import React, { useState } from 'react';
import { IconGrid, IconCalendar, IconUser, IconChart, IconMonitor, IconTag, IconBolt, IconGear, IconClipboard } from './Icons';

const navConfig = [
  { key: 'dashboard', label: 'Dashboard', Icon: IconGrid },
  { key: 'agenda', label: 'Agenda', Icon: IconCalendar },
  { key: 'clients', label: 'Clientes', Icon: IconUser },
  { key: 'anamnese', label: 'Anamnese', Icon: IconClipboard },
  { key: 'financeiro', label: 'Financeiro', Icon: IconChart },
  { key: 'site', label: 'Gerenciar Site', Icon: IconMonitor },
  { key: 'tabela-preco', label: 'Tabela de Preço', Icon: IconTag },
  { key: 'marketing', label: 'Marketing', Icon: IconBolt },
  { key: 'settings', label: 'Configurações', Icon: IconGear },
];

const ADMIN_DISPLAY_NAMES = {
  'contato@melrodrigues.com.br': 'Mel Rodrigues',
};

const Sidebar = ({ tab, onSelectTab, onLogout, userEmail }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const displayName = ADMIN_DISPLAY_NAMES[userEmail] || 'Admin';

  const handleSelect = (key) => {
    onSelectTab(key);
    setMobileOpen(false);
  };

  return (
    <>
      <div className="admin-mobile-topbar">
        <div className="admin-mobile-topbar-logo">
          <img src="/images/logo.png" alt="MR Laser" />
        </div>
        <button
          type="button"
          className="admin-mobile-menu-btn"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label={mobileOpen ? 'Fechar menu' : 'Abrir menu'}
        >
          {mobileOpen ? '✕' : '☰'}
        </button>
      </div>

      {mobileOpen && (
        <div className="admin-mobile-backdrop" onClick={() => setMobileOpen(false)} />
      )}

      <aside className={`admin-sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
        <div className="admin-sidebar-header">
          <div className="admin-sidebar-logo">
            <img src="/images/logo.png" alt="MR Laser" />
          </div>
          <div className="admin-sidebar-subtitle">Painel Administrativo</div>
          <button
            type="button"
            className="admin-mobile-close-btn"
            onClick={() => setMobileOpen(false)}
            aria-label="Fechar menu"
          >
            ✕
          </button>
        </div>

        <nav className="admin-sidebar-nav">
          {navConfig.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => handleSelect(item.key)}
              className={`admin-sidebar-item ${tab === item.key ? 'active' : ''}`}
            >
              <span className="admin-sidebar-icon"><item.Icon /></span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          Logado como <strong>{displayName}</strong>
          <button type="button" className="admin-sidebar-logout" onClick={onLogout}>
            Sair
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
