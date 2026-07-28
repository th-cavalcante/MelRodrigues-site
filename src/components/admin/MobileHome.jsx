import React, { useEffect, useState } from 'react';
import { getDashboardStats } from '../../lib/dashboard';

const ADMIN_FIRST_NAMES = {
  'contato@melrodrigues.com.br': 'Mel',
};

const formatMoney = (v) =>
  `R$ ${(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const todayLabel = () =>
  new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' });

const MobileHome = ({ userEmail }) => {
  const [stats, setStats] = useState(null);
  const firstName = ADMIN_FIRST_NAMES[userEmail] || 'Admin';

  useEffect(() => {
    getDashboardStats().then(setStats).catch((err) => console.error('Erro ao carregar início:', err));
  }, []);

  if (!stats) {
    return <p className="admin-page-subtitle">Carregando...</p>;
  }

  const next = stats.upcoming[0];

  return (
    <div className="admin-mobile-home">
      <div>
        <div className="admin-mobile-home-greeting">Olá, {firstName}</div>
        <div className="admin-mobile-home-date">{todayLabel()}</div>
      </div>

      {next && (
        <div className="admin-mobile-next-card">
          <span className="admin-mobile-next-label">Próximo atendimento</span>
          <span className="admin-mobile-next-name">{next.name}</span>
          <span className="admin-mobile-next-meta">{next.service} · {next.when}</span>
        </div>
      )}

      <div className="admin-mobile-stats-scroll">
        <div className="admin-mobile-stat-card">
          <span className="admin-mobile-stat-label">Receita hoje</span>
          <span className="admin-mobile-stat-value">{formatMoney(stats.receitaHoje)}</span>
        </div>
        <div className="admin-mobile-stat-card">
          <span className="admin-mobile-stat-label">Agendamentos hoje</span>
          <span className="admin-mobile-stat-value">{stats.todayBookings.length}</span>
        </div>
      </div>

      <div>
        <div className="admin-card-title">Agenda de hoje</div>
        {stats.todayBookings.length === 0 && <p className="admin-sessions-empty">Nenhum agendamento para hoje.</p>}
        <div className="admin-mobile-today-list">
          {stats.todayBookings.map((b, i) => (
            <div key={i} className="admin-mobile-today-row">
              <div className="admin-mobile-today-info">
                <span className="admin-mobile-today-name">{b.name}</span>
                <span className="admin-mobile-today-service">{b.service}</span>
              </div>
              <span className="admin-mobile-today-time">{b.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MobileHome;
