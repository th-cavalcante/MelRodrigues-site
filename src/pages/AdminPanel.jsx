import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/admin/Sidebar';
import AccessDenied from '../components/admin/AccessDenied';
import BiometricLock from '../components/admin/BiometricLock';
import DashboardView from '../components/admin/DashboardView';
import SiteManagerView from '../components/admin/SiteManagerView';
import ClientsView from '../components/admin/ClientsView';
import AgendaView from '../components/admin/AgendaView';
import FinanceiroView from '../components/admin/FinanceiroView';
import CadastroPacienteView from '../components/admin/CadastroPacienteView';
import SettingsView from '../components/admin/SettingsView';
import { useAuth } from '../context/AuthContext';
import { listPatients } from '../lib/patients';
import { isBiometricEnabled, isUnlockedThisSession, markUnlockedThisSession, clearUnlockedSession } from '../lib/biometric';
import '../styles/AdminPanel.css';

const AdminPanel = () => {
  const [tab, setTab] = useState('dashboard');
  const [clients, setClients] = useState([]);
  const [unlocked, setUnlocked] = useState(() => !isBiometricEnabled() || isUnlockedThisSession());
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    // Refaz a busca sempre que entrar nessas abas — pacientes se
    // cadastram sozinhos pela Agenda Online a qualquer momento, então a
    // lista carregada só no login fica desatualizada rapidinho.
    if (!['clients', 'agenda', 'dashboard'].includes(tab)) return;
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

  return (
    <div className="admin-panel">
      <Sidebar tab={tab} onSelectTab={setTab} onLogout={handleLogout} userEmail={user.email} />
      <main className="admin-main">
        {tab === 'dashboard' && <DashboardView />}
        {tab === 'site' && <SiteManagerView />}
        {tab === 'clients' && <ClientsView clients={clients} setClients={setClients} />}
        {tab === 'agenda' && <AgendaView clients={clients} setClients={setClients} />}
        {tab === 'financeiro' && <FinanceiroView />}
        {tab === 'cadastro' && <CadastroPacienteView onPatientCreated={() => listPatients().then(setClients)} />}
        {tab === 'settings' && <SettingsView />}
      </main>
    </div>
  );
};

export default AdminPanel;
