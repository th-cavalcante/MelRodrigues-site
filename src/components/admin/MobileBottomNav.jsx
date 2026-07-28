import React from 'react';
import { IconGrid, IconCalendar, IconChart, IconUser, IconPlus } from './Icons';

const NAV_ITEMS = [
  { key: 'dashboard', label: 'Início', Icon: IconGrid },
  { key: 'agenda', label: 'Agenda', Icon: IconCalendar },
  { key: 'novo', label: '', Icon: IconPlus, isFab: true },
  { key: 'financeiro', label: 'Financeiro', Icon: IconChart },
  { key: 'clients', label: 'Clientes', Icon: IconUser },
];

const MobileBottomNav = ({ tab, onSelectTab, onNewAppointment }) => (
  <nav className="admin-mobile-bottomnav">
    {NAV_ITEMS.map((item) => (
      <button
        key={item.key}
        type="button"
        onClick={() => (item.isFab ? onNewAppointment() : onSelectTab(item.key))}
        className={`admin-mobile-bottomnav-btn ${!item.isFab && tab === item.key ? 'active' : ''}`}
      >
        {item.isFab ? (
          <span className="admin-mobile-fab">
            <item.Icon />
          </span>
        ) : (
          <>
            <item.Icon size={19} />
            <span>{item.label}</span>
          </>
        )}
      </button>
    ))}
  </nav>
);

export default MobileBottomNav;
