import React, { useState } from 'react';
import MobileBottomNav from './MobileBottomNav';
import { IconDots, IconMonitor, IconGear, IconLogOut, IconSun, IconMoon } from './Icons';

const TITLES = {
  dashboard: 'Início',
  agenda: 'Agenda',
  clients: 'Clientes',
  financeiro: 'Financeiro',
  site: 'Gerenciar Site',
  settings: 'Configurações',
};

const MobileShell = ({ tab, onSelectTab, onNewAppointment, onLogout, theme, onToggleTheme, children }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const goTo = (key) => {
    setMenuOpen(false);
    onSelectTab(key);
  };

  return (
    <div className="admin-mobile-shell">
      <div className="admin-mobile-shell-topbar">
        <span className="admin-mobile-shell-title">{TITLES[tab] || 'MR Laser'}</span>
        <button type="button" className="admin-mobile-dots-btn" onClick={() => setMenuOpen((v) => !v)} aria-label="Mais opções">
          <IconDots />
        </button>
      </div>

      {menuOpen && (
        <>
          <div className="admin-mobile-menu-backdrop" onClick={() => setMenuOpen(false)} />
          <div className="admin-mobile-menu-sheet">
            <button type="button" className="admin-mobile-menu-item" onClick={() => goTo('site')}>
              <IconMonitor /> Gerenciar Site
            </button>
            <button type="button" className="admin-mobile-menu-item" onClick={() => goTo('settings')}>
              <IconGear /> Configurações
            </button>
            <button
              type="button"
              className="admin-mobile-menu-item"
              onClick={() => { setMenuOpen(false); onToggleTheme(); }}
            >
              {theme === 'dark' ? <IconSun /> : <IconMoon />} {theme === 'dark' ? 'Modo claro' : 'Modo escuro'}
            </button>
            <button type="button" className="admin-mobile-menu-item" onClick={onLogout}>
              <IconLogOut /> Sair
            </button>
          </div>
        </>
      )}

      <main className="admin-mobile-shell-main">{children}</main>

      <MobileBottomNav tab={tab} onSelectTab={onSelectTab} onNewAppointment={onNewAppointment} />
    </div>
  );
};

export default MobileShell;
