import React from 'react';
import { IconGrid, IconCalendar, IconUser, IconPlus, IconMenu } from './Icons';

const NAV_ITEMS = [
  { key: 'dashboard', label: 'Início', Icon: IconGrid },
  { key: 'agenda', label: 'Agenda', Icon: IconCalendar },
  { key: 'novo', label: '', Icon: IconPlus, isFab: true },
  { key: 'clients', label: 'Clientes', Icon: IconUser },
  { key: 'menu', label: 'Menu', Icon: IconMenu, isMenu: true },
];

const MobileBottomNav = ({ tab, onSelectTab, onNewAppointment, onOpenMenu }) => (
  <nav className="admin-mobile-bottomnav">
    {NAV_ITEMS.map((item) => {
      const handleClick = () => {
        if (item.isFab) return onNewAppointment();
        if (item.isMenu) return onOpenMenu();
        return onSelectTab(item.key);
      };
      return (
        <button
          key={item.key}
          type="button"
          onClick={handleClick}
          className={`admin-mobile-bottomnav-btn ${!item.isFab && !item.isMenu && tab === item.key ? 'active' : ''}`}
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
      );
    })}
  </nav>
);

export default MobileBottomNav;
