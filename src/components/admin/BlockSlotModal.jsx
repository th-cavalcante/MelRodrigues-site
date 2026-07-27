import React, { useRef, useState } from 'react';
import { createBlockedSlot, createBlockedSlots } from '../../lib/blockedSlots';

const buildSlots = (startMins, endMinsExclusive) => {
  const rows = [];
  for (let mins = startMins; mins < endMinsExclusive; mins += 30) {
    const h = String(Math.floor(mins / 60)).padStart(2, '0');
    const m = String(mins % 60).padStart(2, '0');
    rows.push(`${h}:${m}`);
  }
  return rows;
};

const MANHA_SLOTS = buildSlots(8 * 60, 12 * 60);
const TARDE_SLOTS = buildSlots(12 * 60, 19 * 60);
const CUSTOM_SLOTS = buildSlots(8 * 60, 21 * 60 + 30);

const MODES = [
  { key: 'inteiro', label: 'Dia inteiro (08:00 às 19:00)' },
  { key: 'manha', label: 'Manhã (08:00 às 12:00)' },
  { key: 'tarde', label: 'Tarde (12:00 às 19:00)' },
  { key: 'personalizado', label: 'Personalizado' },
];

const BlockSlotModal = ({ initialDate, initialTime, onClose, onCreated }) => {
  const [date, setDate] = useState(initialDate);
  const [mode, setMode] = useState(initialTime ? 'personalizado' : 'inteiro');
  const [customTimes, setCustomTimes] = useState(initialTime ? [initialTime] : []);
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const submittingRef = useRef(false);

  const toggleCustomTime = (time) => {
    setCustomTimes((ts) => (ts.includes(time) ? ts.filter((t) => t !== time) : [...ts, time]));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submittingRef.current) return;
    if (mode === 'personalizado' && customTimes.length === 0) {
      setError('Selecione ao menos um horário.');
      return;
    }
    submittingRef.current = true;
    setError('');
    setSaving(true);
    try {
      let created;
      if (mode === 'inteiro') {
        created = [await createBlockedSlot({ date, time: null, reason })];
      } else if (mode === 'manha') {
        created = await createBlockedSlots({ date, times: MANHA_SLOTS, reason });
      } else if (mode === 'tarde') {
        created = await createBlockedSlots({ date, times: TARDE_SLOTS, reason });
      } else {
        created = await createBlockedSlots({ date, times: customTimes, reason });
      }
      onCreated(created);
    } catch (err) {
      console.error('Erro ao bloquear horário:', err);
      setError(`Não foi possível bloquear: ${err.message || 'erro desconhecido'}`);
    } finally {
      submittingRef.current = false;
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

        <div className="field-wrap">
          <label className="field-label">Horário</label>
          <div className="admin-agenda-block-modes">
            {MODES.map((m) => (
              <label key={m.key} className="admin-agenda-block-mode">
                <input
                  type="radio"
                  name="block-mode"
                  checked={mode === m.key}
                  onChange={() => setMode(m.key)}
                />
                {m.label}
              </label>
            ))}
          </div>
        </div>

        {mode === 'personalizado' && (
          <div className="field-wrap">
            <div className="admin-agenda-services-grid">
              {CUSTOM_SLOTS.map((t) => (
                <label key={t} className="admin-agenda-block-mode admin-agenda-block-slot">
                  <input type="checkbox" checked={customTimes.includes(t)} onChange={() => toggleCustomTime(t)} />
                  {t}
                </label>
              ))}
            </div>
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
