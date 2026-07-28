import React, { useEffect, useState } from 'react';
import BlockSlotModal from './BlockSlotModal';
import { listBlockedSlots, deleteBlockedSlot } from '../../lib/blockedSlots';
import { toISODate } from '../../lib/agendaConstants';

const addDays = (date, n) => {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
};

const dateLabel = (isoDate) =>
  new Date(`${isoDate}T00:00:00`).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });

const MobileBlockedSlots = () => {
  const [slots, setSlots] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const refetch = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    listBlockedSlots({ from: toISODate(today), to: toISODate(addDays(today, 60)) })
      .then(setSlots)
      .catch((err) => console.error('Erro ao carregar bloqueios:', err));
  };

  useEffect(() => {
    refetch();
  }, []);

  const handleUnblock = async (id) => {
    if (!window.confirm('Remover esse bloqueio?')) return;
    try {
      await deleteBlockedSlot(id);
      setSlots((s) => s.filter((b) => b.id !== id));
    } catch (err) {
      console.error('Erro ao remover bloqueio:', err);
    }
  };

  const sorted = [...slots].sort(
    (a, b) => a.blocked_date.localeCompare(b.blocked_date) || (a.blocked_time || '').localeCompare(b.blocked_time || '')
  );

  return (
    <div className="admin-mobile-blocks">
      <button type="button" onClick={() => setShowModal(true)} className="admin-open-client-btn admin-mobile-block-add-btn">
        + Bloquear Horário
      </button>

      {sorted.length === 0 && <p className="admin-sessions-empty">Nenhum horário bloqueado.</p>}

      <div className="admin-mobile-today-list">
        {sorted.map((b) => (
          <div key={b.id} className="admin-mobile-today-row">
            <div className="admin-mobile-today-info">
              <span className="admin-mobile-today-name">
                {dateLabel(b.blocked_date)} {b.blocked_time ? `· ${b.blocked_time.slice(0, 5)}` : '· Dia inteiro'}
              </span>
              <span className="admin-mobile-today-service">{b.reason || 'Sem motivo informado'}</span>
            </div>
            <button type="button" onClick={() => handleUnblock(b.id)} className="admin-mobile-unblock-btn">
              Remover
            </button>
          </div>
        ))}
      </div>

      {showModal && (
        <BlockSlotModal
          initialDate={toISODate(new Date())}
          initialTime={null}
          onClose={() => setShowModal(false)}
          onCreated={(created) => {
            setShowModal(false);
            setSlots((s) => [...s, ...created]);
          }}
        />
      )}
    </div>
  );
};

export default MobileBlockedSlots;
