import React, { useEffect, useRef, useState } from 'react';
import { getWhatsAppStatus, getWhatsAppQrCode } from '../../lib/evolution';

const CHANNEL_COLOR = 'oklch(70% 0.17 155)';
const CHANNEL_BG = 'oklch(70% 0.17 155 / 0.14)';

const STATUS_COLORS = {
  Enviada: { color: 'oklch(70% 0.17 155)', bg: 'oklch(70% 0.17 155 / 0.14)' },
  Agendada: { color: 'oklch(70% 0.15 240)', bg: 'oklch(70% 0.15 240 / 0.14)' },
};

const INITIAL_AUTOMATIONS = [
  {
    id: 'au1',
    title: 'Confirmação automática',
    desc: 'Envia confirmação 24h antes do horário e aguarda resposta da cliente.',
    active: true,
  },
  {
    id: 'au2',
    title: 'Lembrete de agendamento',
    desc: 'Lembrete 2h antes do horário para reduzir faltas.',
    active: true,
  },
  {
    id: 'au3',
    title: 'Clientes inativos',
    desc: 'Mensagem de reengajamento para quem não agenda há 60+ dias.',
    active: false,
  },
];

const CAMPAIGNS = [
  {
    id: 'cp1',
    title: 'Reative sua beleza — volte com 15% OFF',
    audience: 'Inativos há 60+ dias',
    sent: 0,
    openRate: 0,
    clickRate: 0,
    status: 'Agendada',
  },
];

const WhatsAppConnectionCard = () => {
  const [state, setState] = useState('loading');
  const [qrCode, setQrCode] = useState(null);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState('');
  const statusIntervalRef = useRef(null);
  const qrRefreshIntervalRef = useRef(null);

  const clearTimers = () => {
    if (statusIntervalRef.current) clearInterval(statusIntervalRef.current);
    if (qrRefreshIntervalRef.current) clearInterval(qrRefreshIntervalRef.current);
    statusIntervalRef.current = null;
    qrRefreshIntervalRef.current = null;
  };

  const checkStatus = async () => {
    try {
      const data = await getWhatsAppStatus();
      setState(data.state);
      if (data.state === 'open') {
        clearTimers();
        setQrCode(null);
      }
    } catch (err) {
      console.error('Erro ao consultar status do WhatsApp:', err);
    }
  };

  useEffect(() => {
    checkStatus();
    return clearTimers;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchQrCode = async () => {
    try {
      const data = await getWhatsAppQrCode();
      setState(data.state);
      if (data.state === 'open') {
        setQrCode(null);
        clearTimers();
      } else if (data.qrcode) {
        setQrCode(data.qrcode);
      }
    } catch (err) {
      setError(err.message || 'Não foi possível gerar o QR Code.');
    }
  };

  const handleConnect = async () => {
    setError('');
    setConnecting(true);
    await fetchQrCode();
    setConnecting(false);

    clearTimers();
    statusIntervalRef.current = setInterval(checkStatus, 3000);
    qrRefreshIntervalRef.current = setInterval(fetchQrCode, 25000);
  };

  return (
    <div className="admin-mkt-section">
      <div className="admin-mkt-section-header">
        <span className="admin-mkt-section-title">WhatsApp da Clínica</span>
        {state === 'open' && <span className="admin-mkt-wpp-connected-badge">Conectado</span>}
      </div>
      <div className="admin-mkt-wpp-card">
        {state === 'open' ? (
          <p className="admin-mkt-wpp-text">
            O WhatsApp da clínica está conectado. As automações abaixo já podem enviar mensagens.
          </p>
        ) : qrCode ? (
          <div className="admin-mkt-wpp-qr-wrap">
            <img src={qrCode} alt="QR Code do WhatsApp" className="admin-mkt-wpp-qr-img" />
            <p className="admin-mkt-wpp-text">
              Abra o WhatsApp da clínica → Aparelhos conectados → Conectar um aparelho, e escaneie este código.
            </p>
          </div>
        ) : (
          <>
            <p className="admin-mkt-wpp-text">
              Conecte o WhatsApp da clínica pra ativar o envio automático de lembretes e confirmações.
            </p>
            <button type="button" className="admin-mkt-new-campaign-btn" onClick={handleConnect} disabled={connecting}>
              {connecting ? 'Gerando QR Code…' : 'Conectar WhatsApp'}
            </button>
          </>
        )}
        {error && <p className="admin-mkt-wpp-error">{error}</p>}
      </div>
    </div>
  );
};

const MarketingView = () => {
  const [automations, setAutomations] = useState(INITIAL_AUTOMATIONS);

  const toggleAutomation = (id) => {
    setAutomations((prev) => prev.map((au) => (au.id === id ? { ...au, active: !au.active } : au)));
  };

  return (
    <div className="admin-mkt">
      <WhatsAppConnectionCard />

      <div className="admin-mkt-section">
        <div className="admin-mkt-section-header">
          <span className="admin-mkt-section-title">
            Automações · {automations.filter((au) => au.active).length} ativas
          </span>
        </div>
        <div className="admin-mkt-automations-grid">
          {automations.map((au) => (
            <div key={au.id} className="admin-mkt-automation-card">
              <div className="admin-mkt-automation-top">
                <span className="admin-mkt-channel-badge" style={{ color: CHANNEL_COLOR, background: CHANNEL_BG }}>
                  WhatsApp
                </span>
                <button
                  type="button"
                  className={`admin-toggle-track ${au.active ? 'on' : ''}`}
                  onClick={() => toggleAutomation(au.id)}
                  aria-label={au.active ? 'Desativar automação' : 'Ativar automação'}
                >
                  <div className="admin-toggle-thumb" />
                </button>
              </div>
              <span className="admin-mkt-automation-title">{au.title}</span>
              <span className="admin-mkt-automation-desc">{au.desc}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="admin-mkt-section admin-mkt-campaigns">
        <div className="admin-mkt-section-header">
          <span className="admin-mkt-section-title">Campanhas</span>
          <button type="button" className="admin-mkt-new-campaign-btn" title="Em breve">
            + Nova campanha
          </button>
        </div>
        <div className="admin-mkt-campaigns-list">
          {CAMPAIGNS.map((cp) => {
            const statusStyle = STATUS_COLORS[cp.status] || STATUS_COLORS.Agendada;
            return (
              <div key={cp.id} className="admin-mkt-campaign-row">
                <span className="admin-mkt-channel-badge" style={{ color: CHANNEL_COLOR, background: CHANNEL_BG }}>
                  {cp.audience}
                </span>
                <div className="admin-mkt-campaign-title">{cp.title}</div>
                <div className="admin-mkt-campaign-stat">
                  <div className="admin-mkt-campaign-stat-label">Enviados</div>
                  <div className="admin-mkt-campaign-stat-value">{cp.sent}</div>
                </div>
                <div className="admin-mkt-campaign-stat">
                  <div className="admin-mkt-campaign-stat-label">Abertura</div>
                  <div className="admin-mkt-campaign-stat-value">{cp.openRate}%</div>
                </div>
                <div className="admin-mkt-campaign-stat">
                  <div className="admin-mkt-campaign-stat-label">Cliques</div>
                  <div className="admin-mkt-campaign-stat-value">{cp.clickRate}%</div>
                </div>
                <span
                  className="admin-mkt-status-badge"
                  style={{ color: statusStyle.color, background: statusStyle.bg }}
                >
                  {cp.status}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MarketingView;
