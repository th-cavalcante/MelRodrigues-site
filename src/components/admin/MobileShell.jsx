import React, { useState } from 'react';
import MobileBottomNav from './MobileBottomNav';
import {
  IconX,
  IconCalendar,
  IconBan,
  IconChart,
  IconMonitor,
  IconTag,
  IconBolt,
  IconGear,
} from './Icons';

const TITLES = {
  dashboard: 'Início',
  agenda: 'Agenda',
  'agenda-completa': 'Agenda Completa',
  bloqueios: 'Bloqueio de Horários',
  clients: 'Clientes',
  financeiro: 'Financeiro',
  site: 'Gerenciar Site',
  'tabela-preco': 'Tabela de Preço',
  marketing: 'Marketing',
  settings: 'Configurações',
};

const MobileShell = ({ tab, onSelectTab, onNewAppointment, onLogout, children }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const goTo = (key) => {
    setMenuOpen(false);
    onSelectTab(key);
  };

  return (
    <div className="admin-mobile-shell">
      <div className="admin-mobile-shell-topbar">
        <span className="admin-mobile-shell-title">{TITLES[tab] || 'MR Laser'}</span>
      </div>

      <main className="admin-mobile-shell-main">{children}</main>

      <MobileBottomNav
        tab={tab}
        onSelectTab={onSelectTab}
        onNewAppointment={onNewAppointment}
        onOpenMenu={() => setMenuOpen(true)}
      />

      {menuOpen && (
        <div className="admin-mobile-menu-fullscreen">
          <div className="admin-mobile-menu-fullscreen-topbar">
            <span className="admin-mobile-shell-title">Menu</span>
            <button
              type="button"
              className="admin-mobile-menu-close-btn"
              onClick={() => setMenuOpen(false)}
              aria-label="Fechar menu"
            >
              <IconX />
            </button>
          </div>

          <div className="admin-mobile-menu-fullscreen-list">
            <button type="button" className="admin-mobile-menu-fullscreen-item" onClick={() => goTo('agenda-completa')}>
              <IconCalendar /> Agenda completa
            </button>
            <button type="button" className="admin-mobile-menu-fullscreen-item" onClick={() => goTo('bloqueios')}>
              <IconBan /> Bloqueio de Horários
            </button>
            <button type="button" className="admin-mobile-menu-fullscreen-item" onClick={() => goTo('financeiro')}>
              <IconChart /> Financeiro
            </button>
            <button type="button" className="admin-mobile-menu-fullscreen-item" onClick={() => goTo('site')}>
              <IconMonitor /> Gerenciar Site
            </button>
            <button type="button" className="admin-mobile-menu-fullscreen-item" onClick={() => goTo('tabela-preco')}>
              <IconTag /> Tabela de Preço
            </button>
            <button type="button" className="admin-mobile-menu-fullscreen-item" onClick={() => goTo('marketing')}>
              <IconBolt /> Marketing
            </button>
            <button type="button" className="admin-mobile-menu-fullscreen-item" onClick={() => goTo('settings')}>
              <IconGear /> Configurações
            </button>
          </div>

          <button type="button" className="admin-mobile-menu-fullscreen-logout" onClick={onLogout}>
            Sair
          </button>
        </div>
      )}
    </div>
  );
};

export default MobileShell;
