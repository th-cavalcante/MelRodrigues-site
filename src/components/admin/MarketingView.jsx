import React, { useEffect, useRef, useState } from 'react';
import { getWhatsAppStatus, getWhatsAppQrCode, disconnectWhatsApp } from '../../lib/evolution';
import { listPatients } from '../../lib/patients';
import { fetchCampaigns, createCampaign, triggerCampaignSend } from '../../lib/campaigns';
import {
  fetchMessageTemplates,
  updateAutomation,
  setAutomationActive,
  createAutomation,
  deleteAutomation,
} from '../../lib/messageTemplates';

const CHANNEL_COLOR = 'oklch(70% 0.17 155)';
const CHANNEL_BG = 'oklch(70% 0.17 155 / 0.14)';

const STATUS_COLORS = {
  enviada: { color: 'oklch(70% 0.17 155)', bg: 'oklch(70% 0.17 155 / 0.14)' },
  enviando: { color: 'oklch(70% 0.15 240)', bg: 'oklch(70% 0.15 240 / 0.14)' },
  erro: { color: 'oklch(68% 0.19 25)', bg: 'oklch(68% 0.19 25 / 0.14)' },
};

const STATUS_LABELS = { enviada: 'Enviada', enviando: 'Enviando…', erro: 'Erro' };

const PREVIEW_VALUES = {
  nome: 'Ana Beatriz',
  servico: 'Design de sobrancelha',
  data: '15/08',
  hora: '14:30',
};

const renderPreview = (text) =>
  Object.entries(PREVIEW_VALUES).reduce((acc, [key, value]) => acc.replaceAll(`{{${key}}}`, value), text || '');

const TEMPLATE_VARIABLES = {
  booking_confirmed: '{{nome}}, {{data}}, {{hora}}',
  test_reminder: '{{nome}}, {{servico}}, {{data}}, {{hora}}',
  birthday: '{{nome}}',
  satisfaction_survey: '{{nome}}',
  inactive_clients: '{{nome}}',
  post_appointment: '{{nome}}',
};

const getTemplateVariables = (template) =>
  TEMPLATE_VARIABLES[template.key] ||
  (template.hours_before != null ? '{{nome}}, {{servico}}, {{data}}, {{hora}}' : '{{nome}}');

const currentMonthPatients = (patients) => {
  const currentMonth = String(new Date().getMonth() + 1).padStart(2, '0');
  return patients.filter((p) => p.birthdate && p.birthdate.slice(5, 7) === currentMonth);
};

const WhatsAppConnectionCard = () => {
  const [state, setState] = useState('loading');
  const [qrCode, setQrCode] = useState(null);
  const [connecting, setConnecting] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
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

  const handleDisconnect = async () => {
    if (!window.confirm('Desconectar o WhatsApp da clínica? As automações param de funcionar até reconectar.')) {
      return;
    }
    setError('');
    setDisconnecting(true);
    try {
      await disconnectWhatsApp();
      clearTimers();
      setState('close');
      setQrCode(null);
    } catch (err) {
      setError(err.message || 'Não foi possível desconectar o WhatsApp.');
    } finally {
      setDisconnecting(false);
    }
  };

  return (
    <div className="admin-mkt-section">
      <div className="admin-mkt-section-header">
        <span className="admin-mkt-section-title">WhatsApp da Clínica</span>
        {state === 'open' && <span className="admin-mkt-wpp-connected-badge">Conectado</span>}
      </div>
      <div className="admin-mkt-wpp-card">
        {state === 'open' ? (
          <>
            <p className="admin-mkt-wpp-text">
              O WhatsApp da clínica está conectado. As automações abaixo já podem enviar mensagens.
            </p>
            <button
              type="button"
              className="admin-mkt-modal-cancel-btn admin-mkt-wpp-disconnect-btn"
              onClick={handleDisconnect}
              disabled={disconnecting}
            >
              {disconnecting ? 'Desconectando…' : 'Desconectar WhatsApp'}
            </button>
          </>
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

const TemplateEditModal = ({ template, onClose, onSaved, onDeleted }) => {
  const [draft, setDraft] = useState(template.body);
  const [hoursBefore, setHoursBefore] = useState(template.hours_before ?? '');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  const isReminder = template.hours_before !== null && template.hours_before !== undefined;

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const payload = { body: draft };
      if (isReminder) payload.hoursBefore = Number(hoursBefore) || 1;
      await updateAutomation(template.key, payload);
      onSaved(template.key, { body: draft, ...(isReminder ? { hours_before: payload.hoursBefore } : {}) });
    } catch (err) {
      setError(err.message || 'Não foi possível salvar.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Excluir esta automação? Essa ação não pode ser desfeita.')) return;
    setDeleting(true);
    setError('');
    try {
      await deleteAutomation(template.key);
      onDeleted(template.key);
    } catch (err) {
      setError(err.message || 'Não foi possível excluir.');
      setDeleting(false);
    }
  };

  return (
    <div className="admin-mkt-modal-overlay" onClick={onClose}>
      <div className="admin-mkt-modal" onClick={(e) => e.stopPropagation()}>
        <div className="admin-mkt-modal-header">
          <span className="admin-mkt-modal-title">Editar mensagem — {template.label}</span>
          <button type="button" className="admin-mkt-modal-close" onClick={onClose} aria-label="Fechar">
            ✕
          </button>
        </div>

        {isReminder && (
          <div className="admin-mkt-modal-field">
            <label className="admin-mkt-modal-label">Enviar quantas horas antes do horário</label>
            <input
              type="number"
              min="1"
              max="72"
              className="field-input"
              value={hoursBefore}
              onChange={(e) => setHoursBefore(e.target.value)}
            />
          </div>
        )}

        <div className="admin-mkt-modal-field">
          <label className="admin-mkt-modal-label">Variáveis disponíveis: {getTemplateVariables(template)}</label>
          <textarea
            className="field-input admin-mkt-campaign-textarea"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={6}
          />
        </div>

        <div className="admin-mkt-modal-field">
          <label className="admin-mkt-modal-label">Pré-visualização</label>
          <div className="admin-mkt-preview-bubble">{renderPreview(draft)}</div>
        </div>

        {error && <p className="admin-mkt-wpp-error">{error}</p>}

        <div className="admin-mkt-modal-actions">
          {template.is_custom && (
            <button type="button" className="admin-mkt-modal-delete-btn" onClick={handleDelete} disabled={deleting}>
              {deleting ? 'Excluindo…' : 'Excluir'}
            </button>
          )}
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

const CreateAutomationModal = ({ onClose, onCreated }) => {
  const [label, setLabel] = useState('');
  const [description, setDescription] = useState('');
  const [hoursBefore, setHoursBefore] = useState('2');
  const [body, setBody] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async () => {
    if (!label.trim() || !body.trim() || !hoursBefore) {
      setError('Preencha o nome, as horas antes e a mensagem.');
      return;
    }
    setError('');
    setSaving(true);
    try {
      const automation = await createAutomation({
        label,
        description: description || `Lembrete enviado ${hoursBefore}h antes do horário.`,
        hoursBefore: Number(hoursBefore),
        body,
      });
      onCreated(automation);
    } catch (err) {
      setError(err.message || 'Não foi possível criar a automação.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-mkt-modal-overlay" onClick={onClose}>
      <div className="admin-mkt-modal" onClick={(e) => e.stopPropagation()}>
        <div className="admin-mkt-modal-header">
          <span className="admin-mkt-modal-title">Criar nova automação</span>
          <button type="button" className="admin-mkt-modal-close" onClick={onClose} aria-label="Fechar">
            ✕
          </button>
        </div>

        <p className="admin-mkt-wpp-text">
          A nova automação envia a mensagem sozinha um número de horas antes do horário do agendamento — o mesmo
          gatilho do "Lembrete de agendamento".
        </p>

        <div className="admin-mkt-modal-field">
          <label className="admin-mkt-modal-label">Nome da automação</label>
          <input
            type="text"
            className="field-input"
            placeholder="Ex: Lembrete 1 dia antes"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
          />
        </div>

        <div className="admin-mkt-modal-field">
          <label className="admin-mkt-modal-label">Descrição (opcional)</label>
          <input
            type="text"
            className="field-input"
            placeholder="Ex: Reforço enviado na véspera"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="admin-mkt-modal-field">
          <label className="admin-mkt-modal-label">Enviar quantas horas antes do horário</label>
          <input
            type="number"
            min="1"
            max="72"
            className="field-input"
            value={hoursBefore}
            onChange={(e) => setHoursBefore(e.target.value)}
          />
        </div>

        <div className="admin-mkt-modal-field">
          <label className="admin-mkt-modal-label">
            Mensagem — variáveis: {'{{nome}}, {{servico}}, {{data}}, {{hora}}'}
          </label>
          <textarea
            className="field-input admin-mkt-campaign-textarea"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={5}
          />
        </div>

        <div className="admin-mkt-modal-field">
          <label className="admin-mkt-modal-label">Pré-visualização</label>
          <div className="admin-mkt-preview-bubble">{renderPreview(body)}</div>
        </div>

        {error && <p className="admin-mkt-wpp-error">{error}</p>}

        <div className="admin-mkt-modal-actions">
          <button type="button" className="admin-mkt-modal-cancel-btn" onClick={onClose}>
            Cancelar
          </button>
          <button type="button" className="admin-mkt-new-campaign-btn" onClick={handleCreate} disabled={saving}>
            {saving ? 'Criando…' : 'Criar automação'}
          </button>
        </div>
      </div>
    </div>
  );
};

const AutomationsSection = () => {
  const [automations, setAutomations] = useState([]);
  const [editingKey, setEditingKey] = useState(null);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    fetchMessageTemplates()
      .then(setAutomations)
      .catch((err) => console.error('Erro ao buscar automações:', err));
  }, []);

  const toggleActive = async (automation) => {
    const next = !automation.active;
    setAutomations((prev) => prev.map((a) => (a.key === automation.key ? { ...a, active: next } : a)));
    try {
      await setAutomationActive(automation.key, next);
    } catch (err) {
      console.error('Erro ao atualizar automação:', err);
      setAutomations((prev) => prev.map((a) => (a.key === automation.key ? { ...a, active: !next } : a)));
    }
  };

  const activeCount = automations.filter((a) => a.active).length;
  const editingAutomation = automations.find((a) => a.key === editingKey) || null;

  return (
    <div className="admin-mkt-section">
      <div className="admin-mkt-section-header">
        <span className="admin-mkt-section-title">Automações · {activeCount} ativas</span>
        <button type="button" className="admin-mkt-new-campaign-btn" onClick={() => setShowCreate(true)}>
          + Criar nova automação
        </button>
      </div>
      <div className="admin-mkt-automations-grid">
        {automations.map((au) => (
          <div key={au.key} className="admin-mkt-automation-card">
            <div className="admin-mkt-automation-top">
              <span className="admin-mkt-channel-badge" style={{ color: CHANNEL_COLOR, background: CHANNEL_BG }}>
                WhatsApp
              </span>
              <button
                type="button"
                className={`admin-toggle-track ${au.active ? 'on' : ''}`}
                onClick={() => toggleActive(au)}
                aria-label={au.active ? 'Desativar automação' : 'Ativar automação'}
              >
                <div className="admin-toggle-thumb" />
              </button>
            </div>
            <span className="admin-mkt-automation-title">{au.label}</span>
            <span className="admin-mkt-automation-desc">
              {au.description}
              {au.hours_before != null && ` (${au.hours_before}h antes)`}
            </span>
            <button type="button" className="admin-mkt-template-edit-btn" onClick={() => setEditingKey(au.key)}>
              Editar mensagem
            </button>
          </div>
        ))}
      </div>

      {editingAutomation && (
        <TemplateEditModal
          template={editingAutomation}
          onClose={() => setEditingKey(null)}
          onSaved={(key, fields) => {
            setAutomations((prev) => prev.map((a) => (a.key === key ? { ...a, ...fields } : a)));
            setEditingKey(null);
          }}
          onDeleted={(key) => {
            setAutomations((prev) => prev.filter((a) => a.key !== key));
            setEditingKey(null);
          }}
        />
      )}

      {showCreate && (
        <CreateAutomationModal
          onClose={() => setShowCreate(false)}
          onCreated={(automation) => {
            setAutomations((prev) => [...prev, automation]);
            setShowCreate(false);
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

            <div className="admin-mkt-modal-field">
              <label className="admin-mkt-modal-label">Pré-visualização</label>
              <div className="admin-mkt-preview-bubble">{renderPreview(message)}</div>
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
