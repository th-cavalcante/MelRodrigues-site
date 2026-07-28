import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/admin/Sidebar';
import MobileShell from '../components/admin/MobileShell';
import AccessDenied from '../components/admin/AccessDenied';
import BiometricLock from '../components/admin/BiometricLock';
import DashboardView from '../components/admin/DashboardView';
import MobileHome from '../components/admin/MobileHome';
import MobileAgenda from '../components/admin/MobileAgenda';
import MobileBlockedSlots from '../components/admin/MobileBlockedSlots';
import SiteManagerView from '../components/admin/SiteManagerView';
import ClientsView from '../components/admin/ClientsView';
import AgendaView from '../components/admin/AgendaView';
import NewAppointmentModal from '../components/admin/NewAppointmentModal';
import FinanceiroView from '../components/admin/FinanceiroView';
import SettingsView from '../components/admin/SettingsView';
import { useAuth } from '../context/AuthContext';
import { listPatients } from '../lib/patients';
import { toISODate } from '../lib/agendaConstants';
import { isBiometricEnabled, isUnlockedThisSession, markUnlockedThisSession, clearUnlockedSession } from '../lib/biometric';
import { useIsMobile } from '../hooks/useIsMobile';
import '../styles/AdminPanel.css';

const AdminPanel = () => {
  const [tab, setTab] = useState('dashboard');
  const [clients, setClients] = useState([]);
  const [unlocked, setUnlocked] = useState(() => !isBiometricEnabled() || isUnlockedThisSession());
  const [theme, setTheme] = useState(() => localStorage.getItem('mrlaser_admin_theme') || 'light');
  const [showQuickNewAppt, setShowQuickNewAppt] = useState(false);
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const toggleTheme = () => {
    setTheme((t) => {
      const next = t === 'dark' ? 'light' : 'dark';
      localStorage.setItem('mrlaser_admin_theme', next);
      return next;
    });
  };

  useEffect(() => {
    if (!user) return;
    // Refaz a busca sempre que entrar nessas abas — pacientes se
    // cadastram sozinhos pela Agenda Online a qualquer momento, então a
    // lista carregada só no login fica desatualizada rapidinho.
    if (!['clients', 'agenda', 'agenda-completa', 'dashboard'].includes(tab)) return;
    listPatients()
      .then(setClients)
      .catch((err) => console.error('Erro ao carregar pacientes:', err));
  }, [user, tab]);

  const handleLogout = async () => {
    await signOut();
    clearUnlockedSession();
    navigate('/admin/login');
  };

  if (loading) {
    return null;
  }

  if (!user) {
    return <AccessDenied />;
  }

  if (!unlocked) {
    return (
      <BiometricLock
        onUnlock={() => {
          markUnlockedThisSession();
          setUnlocked(true);
        }}
      />
    );
  }

  const views = (
    <>
      {tab === 'dashboard' && (isMobile ? <MobileHome userEmail={user.email} /> : <DashboardView />)}
      {tab === 'site' && <SiteManagerView />}
      {tab === 'clients' && <ClientsView clients={clients} setClients={setClients} />}
      {tab === 'agenda' && (isMobile ? <MobileAgenda /> : <AgendaView clients={clients} setClients={setClients} />)}
      {tab === 'agenda-completa' && <AgendaView clients={clients} setClients={setClients} />}
      {tab === 'bloqueios' && <MobileBlockedSlots />}
      {tab === 'financeiro' && <FinanceiroView />}
      {tab === 'settings' && <SettingsView />}
    </>
  );

  const quickNewAppt = showQuickNewAppt && (
    <NewAppointmentModal
      clients={clients}
      setClients={setClients}
      bookingDate={toISODate(new Date())}
      onClose={() => setShowQuickNewAppt(false)}
      onCreated={() => {
        setShowQuickNewAppt(false);
        setTab('agenda');
      }}
    />
  );

  if (isMobile) {
    return (
      <div className="admin-panel" data-theme={theme}>
        <MobileShell
          tab={tab}
          onSelectTab={setTab}
          onNewAppointment={() => setShowQuickNewAppt(true)}
          onLogout={handleLogout}
          theme={theme}
          onToggleTheme={toggleTheme}
        >
          {views}
        </MobileShell>
        {quickNewAppt}
      </div>
    );
  }

  return (
    <div className="admin-panel" data-theme={theme}>
      <Sidebar
        tab={tab}
        onSelectTab={setTab}
        onLogout={handleLogout}
        userEmail={user.email}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
      <main className="admin-main">{views}</main>
    </div>
  );
};

export default AdminPanel;
