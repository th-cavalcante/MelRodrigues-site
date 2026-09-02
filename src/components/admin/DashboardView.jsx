import React, { useEffect, useState } from 'react';
import { getDashboardStats } from '../../lib/dashboard';
import { bookingServiceLabel } from '../../lib/agendaConstants';

const DashboardView = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardStats()
      .then(setStats)
      .catch((err) => console.error('Erro ao carregar dashboard:', err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="admin-page-header">
        <span className="section-eyebrow">Visão Geral</span>
        <h1 className="admin-page-title">Dashboard</h1>
      </div>

      {loading && <p>Carregando...</p>}

      {!loading && stats && (
        <>
          <div className="admin-metrics-grid">
            {stats.metrics.map((m) => (
              <div key={m.label} className="admin-card admin-metric-card">
                <div className="admin-metric-label">{m.label}</div>
                <div className="admin-metric-value">{m.value}</div>
                <div className={`admin-metric-trend ${m.positive ? 'positive' : ''}`}>{m.trend}</div>
              </div>
            ))}
          </div>

          <div className="admin-card admin-today-card">
            <h3 className="admin-card-title">Agendados Hoje</h3>
            {stats.todayBookings.length === 0 && <p className="admin-sessions-empty">Nenhum agendamento para hoje.</p>}
            {stats.todayBookings.map((b, i) => (
              <div key={i} className="admin-upcoming-row">
                <div className="admin-upcoming-name">{b.name}</div>
                <div className="admin-upcoming-meta">{b.time} · {bookingServiceLabel(b)}</div>
              </div>
            ))}
          </div>

          <div className="admin-dashboard-grid">
            <div className="admin-card">
              <h3 className="admin-card-title">Atividade Recente</h3>
              {stats.activity.length === 0 && <p className="admin-sessions-empty">Nenhuma atividade recente.</p>}
              {stats.activity.map((a, i) => (
                <div key={i} className="admin-activity-row">
                  <div>
                    <div className="admin-activity-text">{a.text}</div>
                    <div className="admin-activity-time">{a.time}</div>
                  </div>
                  <span className="admin-badge" style={{ background: a.color }}>{a.badge}</span>
                </div>
              ))}
            </div>

            <div className="admin-card">
              <h3 className="admin-card-title">Próximos Agendamentos</h3>
              {stats.upcoming.length === 0 && <p className="admin-sessions-empty">Nenhum agendamento futuro.</p>}
              {stats.upcoming.map((u, i) => (
                <div key={i} className="admin-upcoming-row">
                  <div className="admin-upcoming-name">{u.name}</div>
                  <div className="admin-upcoming-meta">{u.when} · {bookingServiceLabel(u)}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DashboardView;
