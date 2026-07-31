import React, { useEffect, useRef, useState } from 'react';
import { getWhatsAppStatus, getWhatsAppQrCode, sendBirthdayMessage } from '../../lib/evolution';
import { listPatients } from '../../lib/patients';
import { fetchCampaigns, createCampaign, triggerCampaignSend } from '../../lib/campaigns';
import { fetchMessageTemplates, updateMessageTemplate } from '../../lib/messageTemplates';

const CHANNEL_COLOR = 'oklch(70% 0.17 155)';
const CHANNEL_BG = 'oklch(70% 0.17 155 / 0.14)';

const STATUS_COLORS = {
  enviada: { color: 'oklch(70% 0.17 155)', bg: 'oklch(70% 0.17 155 / 0.14)' },
  enviando: { color: 'oklch(70% 0.15 240)', bg: 'oklch(70% 0.15 240 / 0.14)' },
  erro: { color: 'oklch(68% 0.19 25)', bg: 'oklch(68% 0.19 25 / 0.14)' },
};

const STATUS_LABELS = { enviada: 'Enviada', enviando: 'Enviando…', erro: 'Erro' };

const INITIAL_AUTOMATIONS = [
  {
    id: 'au1',
    title: 'Confirmação automática',
    desc: 'Envia confirmação por WhatsApp assim que o pagamento do sinal é aprovado.',
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

const TEMPLATE_VARIABLES = {
  booking_confirmed: '{{nome}}, {{data}}, {{hora}}',
  test_reminder: '{{nome}}, {{servico}}, {{data}}, {{hora}}',
  birthday: '{{nome}}',
};

const currentMonthPatients = (patients) => {
  const currentMonth = String(new Date().getMonth() + 1).padStart(2, '0');
  return patients.filter((p) => p.birthdate && p.birthdate.slice(5, 7) === currentMonth);
};

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

const BirthdaysSection = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sendState, setSendState] = useState({});

  useEffect(() => {
    listPatients()
      .then((all) => setPatients(currentMonthPatients(all)))
      .catch((err) => console.error('Erro ao buscar aniversariantes:', err))
      .finally(() => setLoading(false));
  }, []);

  const handleSend = async (patientId) => {
    setSendState((prev) => ({ ...prev, [patientId]: 'sending' }));
    try {
      await sendBirthdayMessage(patientId);
      setSendState((prev) => ({ ...prev, [patientId]: 'sent' }));
    } catch (err) {
      console.error('Erro ao enviar mensagem de aniversário:', err);
      setSendState((prev) => ({ ...prev, [patientId]: 'error' }));
    }
  };

  return (
    <div className="admin-mkt-section">
      <div className="admin-mkt-section-header">
        <span className="admin-mkt-section-title">Aniversariantes do Mês · {patients.length}</span>
      </div>
      {loading ? (
        <p className="admin-mkt-wpp-text">Carregando…</p>
      ) : patients.length === 0 ? (
        <p className="admin-mkt-wpp-text">Nenhum paciente faz aniversário este mês.</p>
      ) : (
        <div className="admin-mkt-birthday-list">
          {patients.map((p) => {
            const status = sendState[p.id];
            return (
              <div key={p.id} className="admin-mkt-birthday-row">
                <span className="admin-mkt-birthday-name">{p.name || 'Sem nome'}</span>
                <button
                  type="button"
                  className="admin-mkt-birthday-btn"
                  onClick={() => handleSend(p.id)}
                  disabled={status === 'sending'}
                >
                  {status === 'sending'
                    ? 'Enviando…'
                    : status === 'sent'
                    ? 'Enviado ✓'
                    : status === 'error'
                    ? 'Tentar de novo'
                    : '🎉 Enviar parabéns'}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const CampaignsSection = ({ birthdayCount }) => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const loadCampaigns = () => {
    fetchCampaigns()
      .then(setCampaigns)
      .catch((err) => console.error('Erro ao buscar campanhas:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadCampaigns();
  }, []);

  const handleSubmit = async () => {
    if (!title.trim() || !message.trim()) {
      setError('Preencha o título e a mensagem.');
      return;
    }
    setError('');
    setSending(true);
    try {
      const campaign = await createCampaign({
        title,
        messageBody: message,
        audience: 'aniversariantes_mes',
        targetCount: birthdayCount,
      });
      await triggerCampaignSend(campaign.id);
      setTitle('');
      setMessage('');
      setShowForm(false);
      loadCampaigns();
    } catch (err) {
      setError(err.message || 'Não foi possível enviar a campanha.');
    } finally {
      setSending(false);
    }
  };

  const closeModal = () => {
    setShowForm(false);
    setError('');
  };

  return (
    <div className="admin-mkt-section admin-mkt-campaigns">
      <div className="admin-mkt-section-header">
        <span className="admin-mkt-section-title">Campanhas</span>
        <button type="button" className="admin-mkt-new-campaign-btn" onClick={() => setShowForm(true)}>
          + Nova campanha
        </button>
      </div>

      {showForm && (
        <div className="admin-mkt-modal-overlay" onClick={closeModal}>
          <div className="admin-mkt-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-mkt-modal-header">
              <span className="admin-mkt-modal-title">Nova campanha</span>
              <button type="button" className="admin-mkt-modal-close" onClick={closeModal} aria-label="Fechar">
                ✕
              </button>
            </div>

            <div className="admin-mkt-modal-field">
              <label className="admin-mkt-modal-label">Público</label>
              <p className="admin-mkt-wpp-text">
                <strong>Aniversariantes do mês</strong> ({birthdayCount} paciente(s))
              </p>
            </div>

            <div className="admin-mkt-modal-field">
              <label className="admin-mkt-modal-label">Título da campanha</label>
              <input
                type="text"
                className="field-input"
                placeholder="Ex: Presente de aniversário"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="admin-mkt-modal-field">
              <label className="admin-mkt-modal-label">Mensagem</label>
              <textarea
                className="field-input admin-mkt-campaign-textarea"
                placeholder="Mensagem (use {{nome}} pra personalizar)"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
              />
            </div>

            {error && <p className="admin-mkt-wpp-error">{error}</p>}

            <div className="admin-mkt-modal-actions">
              <button type="button" className="admin-mkt-modal-cancel-btn" onClick={closeModal}>
                Cancelar
              </button>
              <button type="button" className="admin-mkt-new-campaign-btn" onClick={handleSubmit} disabled={sending}>
                {sending ? 'Enviando…' : 'Enviar campanha'}
              </button>
            </div>
          </div>
        </div>
      )}

      {!loading && campaigns.length === 0 && (
        <p className="admin-mkt-wpp-text">Nenhuma campanha criada ainda.</p>
      )}

      <div className="admin-mkt-campaigns-list">
        {campaigns.map((cp) => {
          const statusStyle = STATUS_COLORS[cp.status] || STATUS_COLORS.enviando;
          return (
            <div key={cp.id} className="admin-mkt-campaign-row">
              <span className="admin-mkt-channel-badge" style={{ color: CHANNEL_COLOR, background: CHANNEL_BG }}>
                Aniversariantes
              </span>
              <div className="admin-mkt-campaign-title">{cp.title}</div>
              <div className="admin-mkt-campaign-stat">
                <div className="admin-mkt-campaign-stat-label">Enviados</div>
                <div className="admin-mkt-campaign-stat-value">
                  {cp.sent_count}/{cp.target_count}
                </div>
              </div>
              <span
                className="admin-mkt-status-badge"
                style={{ color: statusStyle.color, background: statusStyle.bg }}
              >
                {STATUS_LABELS[cp.status] || cp.status}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const MessageTemplatesSection = () => {
  const [templates, setTemplates] = useState([]);
  const [drafts, setDrafts] = useState({});
  const [saving, setSaving] = useState({});
  const [saved, setSaved] = useState({});

  useEffect(() => {
    fetchMessageTemplates()
      .then((data) => {
        setTemplates(data);
        setDrafts(Object.fromEntries(data.map((t) => [t.key, t.body])));
      })
      .catch((err) => console.error('Erro ao buscar mensagens:', err));
  }, []);

  const handleSave = async (key) => {
    setSaving((prev) => ({ ...prev, [key]: true }));
    try {
      await updateMessageTemplate(key, drafts[key]);
      setSaved((prev) => ({ ...prev, [key]: true }));
      setTimeout(() => setSaved((prev) => ({ ...prev, [key]: false })), 2000);
    } catch (err) {
      console.error('Erro ao salvar mensagem:', err);
    } finally {
      setSaving((prev) => ({ ...prev, [key]: false }));
    }
  };

  return (
    <div className="admin-mkt-section">
      <div className="admin-mkt-section-header">
        <span className="admin-mkt-section-title">Editar Mensagens</span>
      </div>
      <div className="admin-mkt-template-list">
        {templates.map((t) => (
          <div key={t.key} className="admin-mkt-template-card">
            <span className="admin-mkt-template-label">{t.label}</span>
            <span className="admin-mkt-template-vars">Variáveis: {TEMPLATE_VARIABLES[t.key] || '—'}</span>
            <textarea
              className="field-input admin-mkt-campaign-textarea"
              value={drafts[t.key] ?? ''}
              onChange={(e) => setDrafts((prev) => ({ ...prev, [t.key]: e.target.value }))}
              rows={4}
            />
            <button
              type="button"
              className="admin-mkt-birthday-btn"
              onClick={() => handleSave(t.key)}
              disabled={saving[t.key]}
            >
              {saving[t.key] ? 'Salvando…' : saved[t.key] ? 'Salvo ✓' : 'Salvar'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

const MarketingView = () => {
  const [automations, setAutomations] = useState(INITIAL_AUTOMATIONS);
  const [birthdayCount, setBirthdayCount] = useState(0);

  useEffect(() => {
    listPatients()
      .then((all) => setBirthdayCount(currentMonthPatients(all).length))
      .catch(() => {});
  }, []);

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

      <BirthdaysSection />
      <CampaignsSection birthdayCount={birthdayCount} />
      <MessageTemplatesSection />
    </div>
  );
};

export default MarketingView;
