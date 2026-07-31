import React, { useEffect, useRef, useState } from 'react';
import { getWhatsAppStatus, getWhatsAppQrCode } from '../../lib/evolution';
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

// Estrutura dos 6 cards igual ao mockup Teagá — cada um ligado a um
// message_template editável. active/toggle é só visual por enquanto (só a
// Confirmação automática de fato dispara sozinha, via mp-webhook); os
// outros ainda não têm gatilho automático implementado.
const AUTOMATIONS = [
  {
    templateKey: 'booking_confirmed',
    title: 'Confirmação automática',
    desc: 'Envia confirmação por WhatsApp assim que o pagamento do sinal é aprovado.',
    defaultActive: true,
  },
  {
    templateKey: 'test_reminder',
    title: 'Lembrete de agendamento',
    desc: 'Mensagem usada para lembrar a cliente do horário marcado.',
    defaultActive: true,
  },
  {
    templateKey: 'birthday',
    title: 'Aniversariantes do mês',
    desc: 'Mensagem de parabéns enviada via campanha para quem faz aniversário no mês.',
    defaultActive: true,
  },
  {
    templateKey: 'satisfaction_survey',
    title: 'Pesquisa de satisfação',
    desc: 'Mensagem para avaliar o atendimento após a sessão.',
    defaultActive: false,
  },
  {
    templateKey: 'inactive_clients',
    title: 'Clientes inativos',
    desc: 'Mensagem de reengajamento para quem não agenda há 60+ dias.',
    defaultActive: false,
  },
  {
    templateKey: 'post_appointment',
    title: 'Pós-atendimento',
    desc: 'Dicas de cuidado enviadas no dia seguinte ao procedimento.',
    defaultActive: false,
  },
];

const TEMPLATE_VARIABLES = {
  booking_confirmed: '{{nome}}, {{data}}, {{hora}}',
  test_reminder: '{{nome}}, {{servico}}, {{data}}, {{hora}}',
  birthday: '{{nome}}',
  satisfaction_survey: '{{nome}}',
  inactive_clients: '{{nome}}',
  post_appointment: '{{nome}}',
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

const TemplateEditModal = ({ template, onClose, onSaved }) => {
  const [draft, setDraft] = useState(template.body);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      await updateMessageTemplate(template.key, draft);
      onSaved(template.key, draft);
    } catch (err) {
      setError(err.message || 'Não foi possível salvar.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-mkt-modal-overlay" onClick={onClose}>
      <div className="admin-mkt-modal" onClick={(e) => e.stopPropagation()}>
        <div className="admin-mkt-modal-header">
          <span className="admin-mkt-modal-title">{template.label}</span>
          <button type="button" className="admin-mkt-modal-close" onClick={onClose} aria-label="Fechar">
            ✕
          </button>
        </div>

        <div className="admin-mkt-modal-field">
          <label className="admin-mkt-modal-label">Variáveis disponíveis: {TEMPLATE_VARIABLES[template.key] || '—'}</label>
          <textarea
            className="field-input admin-mkt-campaign-textarea"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={6}
          />
        </div>

        {error && <p className="admin-mkt-wpp-error">{error}</p>}

        <div className="admin-mkt-modal-actions">
          <button type="button" className="admin-mkt-modal-cancel-btn" onClick={onClose}>
            Cancelar
          </button>
          <button type="button" className="admin-mkt-new-campaign-btn" onClick={handleSave} disabled={saving}>
            {saving ? 'Salvando…' : 'Salvar mensagem'}
          </button>
        </div>
      </div>
    </div>
  );
};

const AutomationsSection = () => {
  const [templates, setTemplates] = useState({});
  const [activeMap, setActiveMap] = useState(() =>
    Object.fromEntries(AUTOMATIONS.map((a) => [a.templateKey, a.defaultActive]))
  );
  const [editingKey, setEditingKey] = useState(null);

  useEffect(() => {
    fetchMessageTemplates()
      .then((data) => setTemplates(Object.fromEntries(data.map((t) => [t.key, t]))))
      .catch((err) => console.error('Erro ao buscar mensagens:', err));
  }, []);

  const toggleActive = (key) => {
    setActiveMap((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const activeCount = Object.values(activeMap).filter(Boolean).length;
  const editingTemplate = editingKey ? templates[editingKey] : null;

  return (
    <div className="admin-mkt-section">
      <div className="admin-mkt-section-header">
        <span className="admin-mkt-section-title">Automações · {activeCount} ativas</span>
      </div>
      <div className="admin-mkt-automations-grid">
        {AUTOMATIONS.map((au) => (
          <div key={au.templateKey} className="admin-mkt-automation-card">
            <div className="admin-mkt-automation-top">
              <span className="admin-mkt-channel-badge" style={{ color: CHANNEL_COLOR, background: CHANNEL_BG }}>
                WhatsApp
              </span>
              <button
                type="button"
                className={`admin-toggle-track ${activeMap[au.templateKey] ? 'on' : ''}`}
                onClick={() => toggleActive(au.templateKey)}
                aria-label={activeMap[au.templateKey] ? 'Desativar automação' : 'Ativar automação'}
              >
                <div className="admin-toggle-thumb" />
              </button>
            </div>
            <span className="admin-mkt-automation-title">{au.title}</span>
            <span className="admin-mkt-automation-desc">{au.desc}</span>
            <button
              type="button"
              className="admin-mkt-template-edit-btn"
              onClick={() => setEditingKey(au.templateKey)}
              disabled={!templates[au.templateKey]}
            >
              Editar mensagem
            </button>
          </div>
        ))}
      </div>

      {editingTemplate && (
        <TemplateEditModal
          template={editingTemplate}
          onClose={() => setEditingKey(null)}
          onSaved={(key, body) => {
            setTemplates((prev) => ({ ...prev, [key]: { ...prev[key], body } }));
            setEditingKey(null);
          }}
        />
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
              <div className="admin-mkt-campaign-stat">
                <div className="admin-mkt-campaign-stat-label">Abertura</div>
                <div className="admin-mkt-campaign-stat-value">—</div>
              </div>
              <div className="admin-mkt-campaign-stat">
                <div className="admin-mkt-campaign-stat-label">Cliques</div>
                <div className="admin-mkt-campaign-stat-value">—</div>
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

const MarketingView = () => {
  const [birthdayCount, setBirthdayCount] = useState(0);

  useEffect(() => {
    listPatients()
      .then((all) => setBirthdayCount(currentMonthPatients(all).length))
      .catch(() => {});
  }, []);

  return (
    <div className="admin-mkt">
      <WhatsAppConnectionCard />
      <AutomationsSection />
      <CampaignsSection birthdayCount={birthdayCount} />
    </div>
  );
};

export default MarketingView;
