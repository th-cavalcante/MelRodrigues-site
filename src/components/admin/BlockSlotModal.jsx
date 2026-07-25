import React, { useState } from 'react';
import { createBlockedSlot } from '../../lib/blockedSlots';

const BlockSlotModal = ({ initialDate, onClose, onCreated }) => {
  const [date, setDate] = useState(initialDate);
  const [wholeDay, setWholeDay] = useState(true);
  const [time, setTime] = useState('09:00');
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const created = await createBlockedSlot({ date, time: wholeDay ? null : time, reason });
      onCreated(created);
    } catch (err) {
      console.error('Erro ao bloquear horário:', err);
      setError(`Não foi possível bloquear: ${err.message || 'erro desconhecido'}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-agenda-modal-overlay">
      <form className="admin-agenda-modal" onSubmit={handleSubmit}>
        <h2 className="admin-agenda-modal-title">Bloquear Horário</h2>

        <div className="field-wrap">
          <label className="field-label">Dia</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="field-input" />
        </div>

        <label className="admin-agenda-block-wholeday">
          <input type="checkbox" checked={wholeDay} onChange={(e) => setWholeDay(e.target.checked)} />
          Bloquear o dia inteiro
        </label>

        {!wholeDay && (
          <div className="field-wrap">
            <label className="field-label">Horário</label>
            <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="field-input" />
          </div>
        )}

        <div className="field-wrap-last">
          <label className="field-label">Motivo (opcional)</label>
          <input
            type="text"
            placeholder="Ex: compromisso pessoal"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="field-input"
          />
        </div>

        {error && <div className="admin-login-error">{error}</div>}

        <div className="admin-agenda-modal-actions">
          <button type="button" onClick={onClose} className="admin-agenda-modal-cancel">
            CANCELAR
          </button>
          <button type="submit" disabled={saving} className="admin-open-client-btn admin-agenda-modal-save">
            {saving ? 'BLOQUEANDO...' : 'BLOQUEAR'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BlockSlotModal;
