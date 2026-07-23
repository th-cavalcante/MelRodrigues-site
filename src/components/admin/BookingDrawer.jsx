import React, { useEffect, useState } from 'react';
import { getPatientAttendanceStats } from '../../lib/bookings';
import { STATUS_OPTIONS, PAYMENT_STATUS_OPTIONS, PAYMENT_METHOD_OPTIONS, buildWhatsAppLink } from '../../lib/agendaConstants';

const area = (service) => {
  const idx = service.indexOf(' — ');
  return idx === -1 ? '—' : service.slice(idx + 3);
};

const BookingDrawer = ({ booking, patient, onUpdate, onClose }) => {
  const [fields, setFields] = useState({
    joules: booking.joules || '',
    ms: booking.ms || '',
    passadas: booking.passadas || '',
    notes: booking.notes || '',
  });
  const [stats, setStats] = useState(null);

  useEffect(() => {
    setFields({
      joules: booking.joules || '',
      ms: booking.ms || '',
      passadas: booking.passadas || '',
      notes: booking.notes || '',
    });
  }, [booking.id, booking.joules, booking.ms, booking.passadas, booking.notes]);

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

  const handleLocalChange = (key) => (e) => {
    setFields((f) => ({ ...f, [key]: e.target.value }));
  };

  const handleBlurPersist = (key) => () => {
    onUpdate({ [key]: fields[key] });
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
        <div className="admin-agenda-drawer-detail-row"><span>Serviço:</span> <strong>{booking.service}</strong></div>
        <div className="admin-agenda-drawer-detail-row"><span>Área tratada:</span> <strong>{area(booking.service)}</strong></div>
        <div className="admin-agenda-drawer-detail-row"><span>Equipamento:</span> <strong>{booking.equipment || '—'}</strong></div>
        <div className="admin-agenda-drawer-detail-row"><span>Sessão nº:</span> <strong>{booking.session_num ?? '—'}</strong></div>
        <div className="admin-agenda-drawer-grid3">
          <div>
            <label className="admin-small-label">Joules</label>
            <input
              type="text"
              value={fields.joules}
              onChange={handleLocalChange('joules')}
              onBlur={handleBlurPersist('joules')}
              className="field-input"
            />
          </div>
          <div>
            <label className="admin-small-label">Milissegundos</label>
            <input
              type="text"
              value={fields.ms}
              onChange={handleLocalChange('ms')}
              onBlur={handleBlurPersist('ms')}
              className="field-input"
            />
          </div>
          <div>
            <label className="admin-small-label">Passadas</label>
            <input
              type="text"
              value={fields.passadas}
              onChange={handleLocalChange('passadas')}
              onBlur={handleBlurPersist('passadas')}
              className="field-input"
            />
          </div>
        </div>

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
          onBlur={handleBlurPersist('notes')}
          placeholder="Ex: cliente sensível na região, usar resfriamento máximo..."
          className="field-input field-textarea"
        />

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
      </div>
    </>
  );
};

export default BookingDrawer;
