import React, { useEffect, useState } from 'react';
import { getPatientAttendanceStats } from '../../lib/bookings';
import { fetchLaserServices } from '../../lib/services';
import { STATUS_OPTIONS, PAYMENT_STATUS_OPTIONS, PAYMENT_METHOD_OPTIONS, COMPLEMENTARY_SERVICE_OPTIONS, buildWhatsAppLink } from '../../lib/agendaConstants';

const MAX_SERVICE_SLOTS = 10;

const toServiceSlots = (service) => {
  const parts = (service || '').split(',').map((s) => s.trim()).filter(Boolean);
  return parts.length > 0 ? parts : [''];
};

const buildDraft = (booking) => ({
  date: booking.booking_date,
  time: (booking.booking_time || '').slice(0, 5),
  serviceSlots: toServiceSlots(booking.service),
  valor: booking.valor != null ? String(booking.valor) : '',
  complementaryService: booking.complementary_service || '',
  paymentStatus: booking.payment_status,
  paymentMethod: booking.payment_method || '',
  notes: booking.notes || '',
  status: booking.status,
});

const BookingDrawer = ({ booking, patient, onUpdate, onDelete, onClose }) => {
  const [draft, setDraft] = useState(() => buildDraft(booking));
  const [stats, setStats] = useState(null);
  const [laserServices, setLaserServices] = useState([]);

  useEffect(() => {
    setDraft(buildDraft(booking));
  }, [booking]);

  useEffect(() => {
    let cancelled = false;
    getPatientAttendanceStats(booking.patient_id)
      .then((s) => {
        if (!cancelled) setStats(s);
      })
      .catch((err) => console.error('Erro ao carregar histórico de presença:', err));
    return () => {
      cancelled = true;
    };
  }, [booking.patient_id]);

  useEffect(() => {
    fetchLaserServices().then(setLaserServices).catch((err) => console.error('Erro ao carregar tabela de preço:', err));
  }, []);

  const setField = (key) => (e) => {
    setDraft((d) => ({ ...d, [key]: e.target.value }));
  };

  // Recalcula o valor a partir dos serviços só quando o admin de fato troca
  // um serviço aqui no card — assim o valor com desconto dado na criação do
  // agendamento (Novo Agendamento) não é apagado só por abrir e salvar o
  // card sem mexer nos serviços.
  const handleServiceSlotChange = (index) => (e) => {
    const value = e.target.value;
    setDraft((d) => {
      const newSlots = d.serviceSlots.map((v, i) => (i === index ? value : v));
      const newTotal = newSlots.filter(Boolean).reduce((sum, name) => {
        const found = laserServices.find((s) => s.name === name);
        return sum + (found ? Number(found.price) : 0);
      }, 0);
      return { ...d, serviceSlots: newSlots, valor: String(newTotal) };
    });
  };

  const addServiceSlot = () => {
    setDraft((d) => (d.serviceSlots.length < MAX_SERVICE_SLOTS ? { ...d, serviceSlots: [...d.serviceSlots, ''] } : d));
  };

  const handleDelete = () => {
    if (window.confirm('Tem certeza que deseja excluir este agendamento?')) {
      onDelete();
    }
  };

  const selectedServices = draft.serviceSlots.filter(Boolean);

  const handleSaveAll = () => {
    onUpdate({
      booking_date: draft.date,
      booking_time: draft.time,
      service: selectedServices.join(', '),
      complementary_service: draft.complementaryService || null,
      valor: Number(draft.valor) || 0,
      payment_status: draft.paymentStatus,
      payment_method: draft.paymentMethod || null,
      notes: draft.notes,
      status: draft.status,
    });
    onClose();
  };

  const anamneseOk = !!(patient && patient.status !== 'pending');
  const contratoOk = !!(patient && patient.hasContrato);
  const clientName = booking.patients ? booking.patients.name : patient ? patient.name : '—';
  const phone = booking.patients ? booking.patients.phone : patient ? patient.phone : null;
  const whatsappLink = buildWhatsAppLink(phone, `Olá ${clientName || ''}, confirmando seu horário na MR Laser.`);
  const valorLabel = draft.valor ? `R$ ${Number(draft.valor).toFixed(2).replace('.', ',')}` : 'Incluso no pacote';

  return (
    <>
      <div onClick={onClose} className="admin-agenda-drawer-backdrop" />
      <div className="admin-agenda-drawer">
        <button type="button" onClick={onClose} className="admin-agenda-drawer-close">×</button>

        <div className="admin-agenda-drawer-header">
          <div className="admin-agenda-drawer-avatar">{(clientName || '?').charAt(0)}</div>
          <div>
            <div className="admin-agenda-drawer-name">{clientName}</div>
            {stats && (
              <div className="admin-agenda-drawer-attendance">
                {stats.faltas} falta(s) · {stats.presencas} presença(s)
              </div>
            )}
          </div>
        </div>

        {whatsappLink && (
          <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="admin-open-client-btn admin-agenda-whatsapp-btn">
            💬 Confirmar via WhatsApp
          </a>
        )}

        <div className="admin-agenda-drawer-section-title">Data e Horário</div>
        <div className="admin-cadastro-row admin-agenda-datetime-row">
          <div>
            <label className="admin-small-label">Data</label>
            <input type="date" value={draft.date} onChange={setField('date')} className="field-input" />
          </div>
          <div>
            <label className="admin-small-label">Horário</label>
            <input type="time" value={draft.time} onChange={setField('time')} className="field-input" />
          </div>
        </div>

        <div className="admin-agenda-drawer-section-title">Status de Documentação</div>
        <div className="admin-agenda-docs-badges">
          <div className={`admin-agenda-doc-badge ${anamneseOk ? 'admin-agenda-doc-badge-ok' : ''}`}>
            📋 Anamnese<br /><strong>{anamneseOk ? 'Preenchida' : 'Pendente'}</strong>
          </div>
          <div className={`admin-agenda-doc-badge ${contratoOk ? 'admin-agenda-doc-badge-ok' : ''}`}>
            ✍️ Contrato<br /><strong>{contratoOk ? 'Assinado' : 'Pendente'}</strong>
          </div>
        </div>

        {booking.health_alert && (
          <div className="admin-agenda-health-banner">
            ⚠️ <strong>Alerta de saúde:</strong> {booking.health_reason}
          </div>
        )}

        <div className="admin-agenda-drawer-section-title">Detalhes da Sessão</div>
        <div className="field-wrap">
          <div className="admin-agenda-services-grid">
            {draft.serviceSlots.map((value, i) => (
              <select key={i} value={value} onChange={handleServiceSlotChange(i)} className="field-input">
                <option value="">{i === 0 ? 'Selecione a região' : 'Região adicional (opcional)'}</option>
                {laserServices.map((s) => (
                  <option key={s.id} value={s.name}>{s.name}</option>
                ))}
              </select>
            ))}
          </div>
          {draft.serviceSlots[draft.serviceSlots.length - 1] && draft.serviceSlots.length < MAX_SERVICE_SLOTS && (
            <button type="button" onClick={addServiceSlot} className="admin-appt-add-btn">
              + Adicionar serviço
            </button>
          )}
        </div>

        <div className="field-wrap">
          <label className="admin-small-label">Serviço Complementar</label>
          <select value={draft.complementaryService} onChange={setField('complementaryService')} className="field-input">
            <option value="">Nenhum</option>
            {COMPLEMENTARY_SERVICE_OPTIONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div className="admin-agenda-drawer-detail-row"><span>Sessão nº:</span> <strong>{booking.session_num ?? '—'}</strong></div>

        <div className="admin-agenda-drawer-section-title">Financeiro</div>
        <div className="admin-agenda-financeiro-row">
          <div className="admin-agenda-valor">{valorLabel}</div>
          <select value={draft.paymentStatus} onChange={setField('paymentStatus')} className="field-input admin-agenda-filter-select">
            {PAYMENT_STATUS_OPTIONS.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
        <div className="admin-agenda-payment-method-field">
          <label className="admin-small-label">Forma de Pagamento</label>
          <select value={draft.paymentMethod} onChange={setField('paymentMethod')} className="field-input">
            <option value="">Não informado</option>
            {PAYMENT_METHOD_OPTIONS.map((m) => (
              <option key={m.value} value={m.value}>{m.icon} {m.label}</option>
            ))}
          </select>
        </div>

        <div className="admin-agenda-drawer-section-title">Notas Internas</div>
        <textarea
          rows="3"
          value={draft.notes}
          onChange={setField('notes')}
          placeholder="Ex: cliente sensível na região, usar resfriamento máximo..."
          className="field-input field-textarea"
        />

        <div className="admin-agenda-drawer-section-title admin-agenda-drawer-section-title-spaced">Status do Agendamento</div>
        <select value={draft.status} onChange={setField('status')} className="field-input">
          {STATUS_OPTIONS.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>

        <button type="button" onClick={handleSaveAll} className="admin-open-client-btn admin-agenda-save-all-btn">
          SALVAR ALTERAÇÕES
        </button>

        <button type="button" onClick={handleDelete} className="admin-delete-btn admin-agenda-drawer-delete-btn">
          Excluir Agendamento
        </button>
      </div>
    </>
  );
};

export default BookingDrawer;
