import React, { useCallback, useEffect, useState } from 'react';
import { getFinancialData } from '../../lib/finance';
import { toISODate, PAYMENT_METHOD_OPTIONS, buildWhatsAppLink } from '../../lib/agendaConstants';

const PERIODS = [
  { key: 'mes', label: 'Este Mês' },
  { key: '30dias', label: 'Últimos 30 dias' },
  { key: 'trimestre', label: 'Trimestre' },
];

const METHOD_COLORS = {
  'Cartão': '#B08D57',
  'Pix': '#8C7444',
  'Dinheiro': '#C9A46A',
  'Boleto': '#D8CBB0',
  'Não informado': '#B7B7B7',
};

const METHOD_ICONS = PAYMENT_METHOD_OPTIONS.reduce((acc, m) => ({ ...acc, [m.value]: m.icon }), {});

const formatMoney = (v) =>
  `R$ ${(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/** Mensagem de confirmação pronta pra recepção mandar com 1 clique — sem
 * API paga, sem automação: só um link wa.me com o texto já preenchido. */
const buildConfirmationMessage = (p) => {
  const dateLabel = `${p.booking_date.slice(8, 10)}/${p.booking_date.slice(5, 7)}`;
  const timeLabel = (p.booking_time || '').slice(0, 5);
  const name = p.patients ? p.patients.name : '';
  return `Olá ${name}! Seu pagamento foi confirmado ✅ Seu agendamento na MR Laser está marcado para ${dateLabel} às ${timeLabel}. Qualquer dúvida, estamos à disposição!`;
};

const addDays = (date, n) => {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
};

const getRangeForPeriod = (period) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (period === 'mes') {
    const start = new Date(today.getFullYear(), today.getMonth(), 1);
    return { from: toISODate(start), to: toISODate(today) };
  }
  if (period === 'trimestre') {
    return { from: toISODate(addDays(today, -89)), to: toISODate(today) };
  }
  return { from: toISODate(addDays(today, -29)), to: toISODate(today) };
};

const FinanceiroView = () => {
  const [period, setPeriod] = useState('mes');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refetch = useCallback(() => {
    setLoading(true);
    setError('');
    const { from, to } = getRangeForPeriod(period);
    getFinancialData({ from, to })
      .then(setData)
      .catch((err) => {
        console.error('Erro ao carregar dados financeiros:', err);
        setError('Não foi possível carregar os dados financeiros.');
      })
      .finally(() => setLoading(false));
  }, [period]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  if (loading || !data) {
    return (
      <div>
        <div className="admin-page-header">
          <span className="section-eyebrow">Gestão Financeira</span>
          <h1 className="admin-page-title">Dashboard de Entradas</h1>
        </div>
        {error ? <div className="admin-login-error">{error}</div> : <p className="admin-page-subtitle">Carregando...</p>}
      </div>
    );
  }

  const kpis = [
    { label: 'Faturamento Total', value: formatMoney(data.faturamentoTotal) },
    { label: 'Ticket Médio por Cliente', value: formatMoney(data.ticketMedio) },
    { label: 'Sessões Realizadas', value: String(data.sessoesRealizadas) },
    { label: 'Sessões Pagas', value: String(data.sessoesPagas) },
  ];

  const maxDaily = Math.max(1, ...data.dailyEntries.map((e) => e.value));
  const totalMethods = data.paymentMethods.reduce((s, m) => s + m.value, 0);
  let acc = 0;
  const pieSlices = data.paymentMethods.map((m) => {
    const start = acc;
    const pct = totalMethods ? (m.value / totalMethods) * 100 : 0;
    acc += pct;
    return { ...m, pct, start, end: acc, color: METHOD_COLORS[m.label] || '#B7B7B7' };
  });
  const pieGradient = totalMethods
    ? `conic-gradient(${pieSlices.map((s) => `${s.color} ${s.start}% ${s.end}%`).join(', ')})`
    : 'conic-gradient(oklch(90% 0.006 85) 0% 100%)';

  const maxService = Math.max(1, ...data.topServices.map((s) => s.value));

  return (
    <div>
      <div className="admin-fin-header-row">
        <div>
          <span className="section-eyebrow">Gestão Financeira</span>
          <h1 className="admin-page-title">Dashboard de Entradas</h1>
        </div>
        <div className="admin-agenda-view-switch">
          {PERIODS.map((p) => (
            <button
              key={p.key}
              type="button"
              onClick={() => setPeriod(p.key)}
              className={`admin-agenda-view-btn ${period === p.key ? 'admin-agenda-view-btn-active' : ''}`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="admin-fin-kpi-grid">
        {kpis.map((k) => (
          <div key={k.label} className="admin-card admin-fin-kpi-card">
            <div className="admin-fin-kpi-label">{k.label}</div>
            <div className="admin-fin-kpi-value">{k.value}</div>
          </div>
        ))}
      </div>

      <div className="admin-fin-charts-row">
        <div className="admin-card">
          <h3 className="admin-card-title">Evolução de Entradas</h3>
          {data.dailyEntries.length === 0 ? (
            <p className="admin-page-subtitle">Sem entradas pagas neste período.</p>
          ) : (
            <div className="admin-fin-bar-chart">
              {data.dailyEntries.map((e) => (
                <div key={e.date} className="admin-fin-bar-col">
                  <div className="admin-fin-bar" style={{ height: `${(e.value / maxDaily) * 100}%` }} />
                  <span className="admin-fin-bar-label">{e.date.slice(8, 10)}/{e.date.slice(5, 7)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="admin-card">
          <h3 className="admin-card-title">Meios de Pagamento</h3>
          <div className="admin-fin-pie" style={{ background: pieGradient }}>
            <div className="admin-fin-pie-hole" />
          </div>
          <div className="admin-fin-pie-legend">
            {pieSlices.length === 0 && <p className="admin-page-subtitle">Sem entradas pagas neste período.</p>}
            {pieSlices.map((s) => (
              <div key={s.label} className="admin-fin-legend-row">
                <span className="admin-fin-legend-dot" style={{ background: s.color }} />
                <span className="admin-fin-legend-label">{METHOD_ICONS[s.label] || ''} {s.label}</span>
                <strong>{s.pct.toFixed(0)}%</strong>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="admin-card admin-fin-services-card">
        <h3 className="admin-card-title">Serviços mais Lucrativos</h3>
        {data.topServices.length === 0 ? (
          <p className="admin-page-subtitle">Sem entradas pagas neste período.</p>
        ) : (
          <div className="admin-fin-service-list">
            {data.topServices.map((s, i) => (
              <div key={s.label} className="admin-fin-service-row">
                <span className="admin-fin-service-rank">{i + 1}º</span>
                <span className="admin-fin-service-label">{s.label}</span>
                <div className="admin-fin-service-track">
                  <div className="admin-fin-service-bar" style={{ width: `${(s.value / maxService) * 100}%` }} />
                </div>
                <span className="admin-fin-service-value">{formatMoney(s.value)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="admin-fin-forecast-row">
        <div className="admin-card">
          <h3 className="admin-card-title admin-card-title-tight">Valores a Receber</h3>
          <div className="admin-fin-forecast-value">{formatMoney(data.receivables)}</div>
          <div className="admin-page-subtitle">Agendamentos futuros ainda não pagos</div>
        </div>
        <div className="admin-fin-overdue-card">
          <h3 className="admin-card-title admin-card-title-tight admin-fin-overdue-title">⚠️ Cobranças Pendentes</h3>
          <div className="admin-fin-forecast-value admin-fin-overdue-title">{formatMoney(data.overdue)}</div>
          <div className="admin-fin-overdue-desc">Sessões já realizadas e ainda não pagas</div>
        </div>
      </div>

      <div className="admin-card admin-fin-table-card">
        <h3 className="admin-card-title">Últimas Entradas</h3>
        <div className="admin-fin-table-row admin-fin-table-header">
          <div>Data</div>
          <div>Cliente</div>
          <div>Serviço</div>
          <div></div>
          <div className="admin-fin-table-value-col">Valor</div>
          <div></div>
        </div>
        {data.recentPayments.map((p) => {
          const phone = p.patients ? p.patients.phone : null;
          const waLink = buildWhatsAppLink(phone, buildConfirmationMessage(p));
          return (
            <div key={p.id} className="admin-fin-table-row">
              <div className="admin-fin-table-date">
                {p.booking_date.slice(8, 10)}/{p.booking_date.slice(5, 7)} · {(p.booking_time || '').slice(0, 5)}
              </div>
              <div className="admin-fin-table-client">{p.patients ? p.patients.name : '—'}</div>
              <div className="admin-fin-table-service">{p.service}</div>
              <div className="admin-fin-table-icon" title={p.payment_method || 'Não informado'}>
                {METHOD_ICONS[p.payment_method] || '❔'}
              </div>
              <div className="admin-fin-table-value-col admin-fin-table-value">{formatMoney(p.valor)}</div>
              {waLink ? (
                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="admin-fin-table-whatsapp"
                  title="Enviar confirmação via WhatsApp"
                >
                  💬
                </a>
              ) : (
                <span className="admin-fin-table-whatsapp admin-fin-table-whatsapp-disabled" title="Paciente sem telefone cadastrado">
                  💬
                </span>
              )}
            </div>
          );
        })}
        {data.recentPayments.length === 0 && (
          <div className="admin-sessions-empty">Nenhuma entrada paga neste período.</div>
        )}
      </div>
    </div>
  );
};

export default FinanceiroView;
