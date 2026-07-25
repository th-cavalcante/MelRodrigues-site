import React, { useEffect, useState } from 'react';
import { getPatientAttendanceStats } from '../../lib/bookings';
import { fetchLaserServices } from '../../lib/services';
import { STATUS_OPTIONS, PAYMENT_STATUS_OPTIONS, PAYMENT_METHOD_OPTIONS, buildWhatsAppLink } from '../../lib/agendaConstants';

const SERVICE_SLOTS = 10;

const toServiceSlots = (service) => {
  const parts = (service || '').split(',').map((s) => s.trim()).filter(Boolean);
  return Array.from({ length: SERVICE_SLOTS }, (_, i) => parts[i] || '');
};

const BookingDrawer = ({ booking, patient, onUpdate, onDelete, onClose }) => {
  const [fields, setFields] = useState({
    notes: booking.notes || '',
  });
  const [notesSaved, setNotesSaved] = useState(false);
  const [stats, setStats] = useState(null);
  const [laserServices, setLaserServices] = useState([]);
  const [editingServices, setEditingServices] = useState(false);
  const [serviceSlots, setServiceSlots] = useState(() => toServiceSlots(booking.service));

  useEffect(() => {
    setFields({ notes: booking.notes || '' });
    setServiceSlots(toServiceSlots(booking.service));
    setEditingServices(false);
  }, [booking.id, booking.notes, booking.service]);

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

  const handleLocalChange = (key) => (e) => {
    setFields((f) => ({ ...f, [key]: e.target.value }));
    setNotesSaved(false);
  };

  const handleSaveNotes = () => {
    onUpdate({ notes: fields.notes });
    setNotesSaved(true);
    setTimeout(() => setNotesSaved(false), 2000);
  };

  const handleServiceSlotChange = (index) => (e) => {
    setServiceSlots((s) => s.map((v, i) => (i === index ? e.target.value : v)));
  };

  const selectedServices = serviceSlots.filter(Boolean);

  const handleSaveServices = () => {
    const valor = selectedServices.reduce((sum, name) => {
      const found = laserServices.find((s) => s.name === name);
      return sum + (found ? Number(found.price) : 0);
    }, 0);
    onUpdate({ service: selectedServices.join(', '), valor });
    setEditingServices(false);
  };

  const handleDelete = () => {
    if (window.confirm('Tem certeza que deseja excluir este agendamento?')) {
      onDelete();
    }
  };

  const anamneseOk = !!(patient && patient.status !== 'pending');
  const contratoOk = !!(patient && patient.hasContrato);
  const clientName = booking.patients ? booking.patients.name : patient ? patient.name : '—';
  const phone = booking.patients ? booking.patients.phone : patient ? patient.phone : null;
  const whatsappLink = buildWhatsAppLink(phone, `Olá ${clientName || ''}, confirmando seu horário na MR Laser.`);
  const valorLabel = booking.valor ? `R$ ${Number(booking.valor).toFixed(2).replace('.', ',')}` : 'Incluso no pacote';

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
            <input
              type="date"
              value={booking.booking_date}
              onChange={(e) => onUpdate({ booking_date: e.target.value })}
              className="field-input"
            />
          </div>
          <div>
            <label className="admin-small-label">Horário</label>
            <input
              type="time"
              value={(booking.booking_time || '').slice(0, 5)}
              onChange={(e) => onUpdate({ booking_time: e.target.value })}
              className="field-input"
            />
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

        <div className="admin-agenda-drawer-section-title-row">
          <div className="admin-agenda-drawer-section-title">Detalhes da Sessão</div>
          {!editingServices && (
            <button type="button" onClick={() => setEditingServices(true)} className="admin-agenda-edit-services-btn">
              ✎ Editar serviços
            </button>
          )}
        </div>

        {!editingServices && (
          <div className="admin-agenda-drawer-detail-row"><span>Serviço:</span> <strong>{booking.service}</strong></div>
        )}

        {editingServices && (
          <div className="admin-agenda-services-edit">
            <div className="admin-agenda-services-grid">
              {serviceSlots.map((value, i) => (
                <select key={i} value={value} onChange={handleServiceSlotChange(i)} className="field-input">
                  <option value="">{i === 0 ? 'Selecione a região' : 'Região adicional (opcional)'}</option>
                  {laserServices.map((s) => (
                    <option key={s.id} value={s.name}>{s.name}</option>
                  ))}
                </select>
              ))}
            </div>
            <div className="admin-agenda-services-edit-actions">
              <button type="button" onClick={() => { setServiceSlots(toServiceSlots(booking.service)); setEditingServices(false); }} className="admin-agenda-modal-cancel">
                CANCELAR
              </button>
              <button type="button" onClick={handleSaveServices} disabled={selectedServices.length === 0} className="admin-open-client-btn">
                SALVAR SERVIÇOS
              </button>
            </div>
          </div>
        )}

        <div className="admin-agenda-drawer-detail-row"><span>Equipamento:</span> <strong>{booking.equipment || '—'}</strong></div>
        <div className="admin-agenda-drawer-detail-row"><span>Sessão nº:</span> <strong>{booking.session_num ?? '—'}</strong></div>

        <div className="admin-agenda-drawer-section-title">Financeiro</div>
        <div className="admin-agenda-financeiro-row">
          <div className="admin-agenda-valor">{valorLabel}</div>
          <select
            value={booking.payment_status}
            onChange={(e) => onUpdate({ payment_status: e.target.value })}
            className="field-input admin-agenda-filter-select"
          >
            {PAYMENT_STATUS_OPTIONS.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
        <div className="admin-agenda-payment-method-field">
          <label className="admin-small-label">Forma de Pagamento</label>
          <select
            value={booking.payment_method || ''}
            onChange={(e) => onUpdate({ payment_method: e.target.value || null })}
            className="field-input"
          >
            <option value="">Não informado</option>
            {PAYMENT_METHOD_OPTIONS.map((m) => (
              <option key={m.value} value={m.value}>{m.icon} {m.label}</option>
            ))}
          </select>
        </div>

        <div className="admin-agenda-drawer-section-title">Notas Internas</div>
        <textarea
          rows="3"
          value={fields.notes}
          onChange={handleLocalChange('notes')}
          placeholder="Ex: cliente sensível na região, usar resfriamento máximo..."
          className="field-input field-textarea"
        />
        <button type="button" onClick={handleSaveNotes} className="admin-open-client-btn admin-agenda-save-notes-btn">
          {notesSaved ? 'Salvo ✓' : 'SALVAR NOTAS'}
        </button>

        <div className="admin-agenda-drawer-section-title admin-agenda-drawer-section-title-spaced">Status do Agendamento</div>
        <select
          value={booking.status}
          onChange={(e) => onUpdate({ status: e.target.value })}
          className="field-input"
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>

        <button type="button" onClick={handleDelete} className="admin-delete-btn admin-agenda-drawer-delete-btn">
          Excluir Agendamento
        </button>
      </div>
    </>
  );
};

export default BookingDrawer;
