import React, { useCallback, useEffect, useState } from 'react';
import BookingDrawer from './BookingDrawer';
import NewAppointmentModal from './NewAppointmentModal';
import BlockSlotModal from './BlockSlotModal';
import { listBookings, updateBooking, deleteBooking } from '../../lib/bookings';
import { listBlockedSlots, deleteBlockedSlot } from '../../lib/blockedSlots';
import { ROOMS, STATUS_OPTIONS, BLOCKED_SLOTS, toISODate } from '../../lib/agendaConstants';

const VIEW_MODES = [
  { key: 'dia', label: 'Dia' },
  { key: 'semana', label: 'Semana' },
  { key: 'mes', label: 'Mês' },
  { key: 'lista', label: 'Lista' },
];

const WEEKDAY_LABELS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

const TIME_ROWS = (() => {
  const rows = [];
  for (let mins = 8 * 60; mins <= 21 * 60; mins += 30) {
    const h = String(Math.floor(mins / 60)).padStart(2, '0');
    const m = String(mins % 60).padStart(2, '0');
    rows.push(`${h}:${m}`);
  }
  return rows;
})();

const startOfWeek = (date) => {
  const d = new Date(date);
  d.setDate(d.getDate() - d.getDay());
  d.setHours(0, 0, 0, 0);
  return d;
};

const addDays = (date, n) => {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
};

const statusMeta = (status) => STATUS_OPTIONS.find((s) => s.value === status) || STATUS_OPTIONS[0];

const bookingTimeLabel = (booking) => (booking.booking_time || '').slice(0, 5);

const docsIcon = (patient) => {
  const anamnese = !!(patient && patient.status !== 'pending');
  const contrato = !!(patient && patient.hasContrato);
  if (anamnese && contrato) return '✓';
  if (anamnese || contrato) return '·';
  return '!';
};

const AgendaView = ({ clients }) => {
  const [agendaView, setAgendaView] = useState('dia');
  const [agendaOffset, setAgendaOffset] = useState(0);
  const [filters, setFilters] = useState({ room: 'Todas', status: 'Todos' });
  const [bookings, setBookings] = useState([]);
  const [blockedSlots, setBlockedSlots] = useState([]);
  const [activeBookingId, setActiveBookingId] = useState(null);
  const [showNewApt, setShowNewApt] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const handleCopyAgendaLink = async () => {
    const url = `${window.location.origin}/cliente/agendar`;
    try {
      await navigator.clipboard.writeText(url);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (err) {
      console.error('Erro ao copiar link:', err);
    }
  };

  const baseDate = addDays(new Date(), agendaOffset);

  const getVisibleRange = useCallback(() => {
    if (agendaView === 'semana') {
      const start = startOfWeek(baseDate);
      return { from: toISODate(start), to: toISODate(addDays(start, 6)) };
    }
    if (agendaView === 'mes') {
      const monthStart = new Date(baseDate.getFullYear(), baseDate.getMonth(), 1);
      const gridStart = startOfWeek(monthStart);
      return { from: toISODate(gridStart), to: toISODate(addDays(gridStart, 41)) };
    }
    const iso = toISODate(baseDate);
    return { from: iso, to: iso };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agendaView, agendaOffset]);

  const refetch = useCallback(() => {
    const { from, to } = getVisibleRange();
    listBookings({ from, to })
      .then(setBookings)
      .catch((err) => console.error('Erro ao carregar agenda:', err));
    listBlockedSlots({ from, to })
      .then(setBlockedSlots)
      .catch((err) => console.error('Erro ao carregar bloqueios:', err));
  }, [getVisibleRange]);

  useEffect(() => {
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agendaView, agendaOffset]);

  const matchesFilters = (b) =>
    (filters.room === 'Todas' || b.room === filters.room) &&
    (filters.status === 'Todos' || statusMeta(b.status).label === filters.status);

  const activeBooking = bookings.find((b) => b.id === activeBookingId) || null;

  const handleFieldUpdate = async (bookingId, fields) => {
    try {
      const updated = await updateBooking(bookingId, fields);
      setBookings((bs) => bs.map((b) => (b.id === bookingId ? updated : b)));
    } catch (err) {
      console.error('Erro ao atualizar agendamento:', err);
      const isSlotConflict = err?.code === '23505';
      window.alert(isSlotConflict ? 'Já existe um agendamento nesse horário.' : 'Não foi possível salvar essa alteração.');
    }
  };

  const handleCreated = (booking) => {
    setShowNewApt(false);
    if (booking?.booking_date) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const target = new Date(`${booking.booking_date}T00:00:00`);
      const diffDays = Math.round((target - today) / 86400000);
      setAgendaView('dia');
      setAgendaOffset(diffDays);
    }
    refetch();
  };

  const handleDelete = async (bookingId) => {
    try {
      await deleteBooking(bookingId);
      setBookings((bs) => bs.filter((b) => b.id !== bookingId));
      setActiveBookingId(null);
    } catch (err) {
      console.error('Erro ao excluir agendamento:', err);
    }
  };

  const handleBlockCreated = (block) => {
    setShowBlockModal(false);
    setBlockedSlots((bs) => [...bs, block]);
  };

  const handleUnblock = async (blockId) => {
    if (!window.confirm('Remover esse bloqueio?')) return;
    try {
      await deleteBlockedSlot(blockId);
      setBlockedSlots((bs) => bs.filter((b) => b.id !== blockId));
    } catch (err) {
      console.error('Erro ao remover bloqueio:', err);
    }
  };

  const dateLabel = baseDate.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
  });

  const todayISO = toISODate(baseDate);
  const dayBookings = bookings.filter((b) => b.booking_date === todayISO && matchesFilters(b));

  const renderBookingCard = (b) => {
    const meta = statusMeta(b.status);
    return (
      <button
        key={b.id}
        type="button"
        onClick={() => setActiveBookingId(b.id)}
        className="admin-agenda-booking-card"
        style={{ borderLeftColor: meta.color }}
      >
        <div className="admin-agenda-booking-top">
          <span className="admin-agenda-booking-client">{b.patients ? b.patients.name : '—'}</span>
          <span className="admin-agenda-booking-icons">
            {b.health_alert && <span title={b.health_reason}>⚠️</span>}
            <span title="Documentos">{docsIcon(b.patients)}</span>
          </span>
        </div>
        <div className="admin-agenda-booking-service">{b.service}</div>
        <span className="admin-agenda-status-pill" style={{ color: meta.color, borderColor: meta.color }}>
          {meta.label}
        </span>
      </button>
    );
  };

  const dayBlockedSlots = blockedSlots.filter((bs) => bs.blocked_date === todayISO);
  const wholeDayBlock = dayBlockedSlots.find((bs) => !bs.blocked_time);

  const renderDiaView = () => (
    <div className="admin-agenda-day-grid">
      <div className="admin-agenda-timegrid-col">
        {wholeDayBlock && (
          <div className="admin-agenda-day-blocked-banner">
            <span>🚫 Este dia está bloqueado{wholeDayBlock.reason ? `: ${wholeDayBlock.reason}` : ''}</span>
            <button type="button" onClick={() => handleUnblock(wholeDayBlock.id)} className="admin-agenda-unblock-btn">
              Remover bloqueio
            </button>
          </div>
        )}

        <div className="admin-card admin-agenda-timegrid">
          {TIME_ROWS.map((time) => {
            const booking = dayBookings.find((b) => bookingTimeLabel(b) === time);
            const blocked = BLOCKED_SLOTS.find(
              (bl) => bl.time === time && (bl.matchAll || filters.room === bl.room)
            );
            const dynamicBlock = dayBlockedSlots.find(
              (bs) => bs.blocked_time && bs.blocked_time.slice(0, 5) === time
            );
            return (
              <div key={time} className="admin-agenda-time-row">
                <div className="admin-agenda-time-label">{time}</div>
                <div className="admin-agenda-time-cell">
                  {booking ? (
                    renderBookingCard(booking)
                  ) : dynamicBlock ? (
                    <button
                      type="button"
                      onClick={() => handleUnblock(dynamicBlock.id)}
                      className="admin-agenda-blocked admin-agenda-blocked-dynamic"
                      title="Clique para remover o bloqueio"
                    >
                      🚫 {dynamicBlock.reason || 'Bloqueado'}
                    </button>
                  ) : blocked ? (
                    <div className="admin-agenda-blocked">{blocked.label}</div>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="admin-agenda-sidebar">
        <div className="admin-card">
          <h3 className="admin-card-title">Resumo do Dia</h3>
          <div className="admin-agenda-summary-row">
            <span>Agendamentos</span>
            <strong>{dayBookings.length}</strong>
          </div>
          <div className="admin-agenda-summary-row">
            <span>Confirmados</span>
            <strong>{dayBookings.filter((b) => b.status === 'confirmado').length}</strong>
          </div>
          <div className="admin-agenda-summary-row">
            <span>Pendentes</span>
            <strong>{dayBookings.filter((b) => b.status === 'pendente').length}</strong>
          </div>
          <div className="admin-agenda-summary-row">
            <span>Alertas de saúde</span>
            <strong>{dayBookings.filter((b) => b.health_alert).length}</strong>
          </div>
        </div>

        <div className="admin-card">
          <h3 className="admin-card-title">Legenda de Status</h3>
          {STATUS_OPTIONS.map((s) => (
            <div key={s.value} className="admin-agenda-legend-row">
              <span className="admin-agenda-legend-dot" style={{ background: s.color }} />
              {s.label}
            </div>
          ))}
        </div>

        <div className="admin-agenda-help-box">
          <strong>⚠️ Alerta de saúde</strong> e <strong>📋/✍️</strong> indicam pendência de documentação
          — visíveis diretamente nos cards.
        </div>
      </div>
    </div>
  );

  const renderSemanaView = () => {
    const weekStart = startOfWeek(baseDate);
    const todayZero = new Date();
    todayZero.setHours(0, 0, 0, 0);
    return (
      <div className="admin-card admin-agenda-week-grid">
        {WEEKDAY_LABELS.map((wd, i) => {
          const d = addDays(weekStart, i);
          const iso = toISODate(d);
          const dOffset = Math.round((d - todayZero) / 86400000);
          const bookingsForDay = bookings.filter((b) => b.booking_date === iso && matchesFilters(b));
          const isSelected = iso === todayISO;
          const dayBlocked = blockedSlots.some((bs) => bs.blocked_date === iso && !bs.blocked_time);
          return (
            <button
              key={wd + i}
              type="button"
              onClick={() => {
                setAgendaOffset(dOffset);
                setAgendaView('dia');
              }}
              className={`admin-agenda-week-day ${isSelected ? 'admin-agenda-week-day-active' : ''} ${dayBlocked ? 'admin-agenda-week-day-blocked' : ''}`}
            >
              <div className="admin-agenda-week-day-header">
                <div className="admin-agenda-week-day-name">{wd}</div>
                <div className="admin-agenda-week-day-num">{d.getDate()}</div>
              </div>
              <div className="admin-agenda-week-day-body">
                {dayBlocked && <div className="admin-agenda-week-empty">🚫 Bloqueado</div>}
                {!dayBlocked && bookingsForDay.slice(0, 3).map((b) => (
                  <div
                    key={b.id}
                    className="admin-agenda-week-chip"
                    style={{ borderLeftColor: statusMeta(b.status).color }}
                  >
                    {bookingTimeLabel(b)} · {b.patients ? b.patients.name : '—'}
                  </div>
                ))}
                {!dayBlocked && bookingsForDay.length === 0 && (
                  <div className="admin-agenda-week-empty">Sem agendamentos</div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    );
  };

  const renderMesView = () => {
    const monthStart = new Date(baseDate.getFullYear(), baseDate.getMonth(), 1);
    const gridStart = startOfWeek(monthStart);
    const cells = [];
    const todayZero = new Date();
    todayZero.setHours(0, 0, 0, 0);
    for (let i = 0; i < 42; i++) {
      const cellDate = addDays(gridStart, i);
      const inMonth = cellDate.getMonth() === baseDate.getMonth();
      const iso = toISODate(cellDate);
      const hasBookings = bookings.some((b) => b.booking_date === iso && matchesFilters(b));
      const dayBlocked = blockedSlots.some((bs) => bs.blocked_date === iso && !bs.blocked_time);
      const cellOffset = Math.round((cellDate - todayZero) / 86400000);
      cells.push({ cellDate, inMonth, iso, hasBookings, dayBlocked, cellOffset });
    }
    return (
      <div className="admin-card admin-agenda-month">
        <div className="admin-agenda-month-headers">
          {WEEKDAY_LABELS.map((wd) => (
            <div key={wd} className="admin-agenda-month-header">{wd}</div>
          ))}
        </div>
        <div className="admin-agenda-month-grid">
          {cells.map((c) => (
            <button
              key={c.iso}
              type="button"
              disabled={!c.inMonth}
              onClick={() => {
                setAgendaOffset(c.cellOffset);
                setAgendaView('dia');
              }}
              className={`admin-agenda-month-cell ${c.iso === todayISO ? 'admin-agenda-month-cell-active' : ''} ${c.dayBlocked ? 'admin-agenda-week-day-blocked' : ''}`}
              style={{ visibility: c.inMonth ? 'visible' : 'hidden' }}
            >
              <span className="admin-agenda-month-num">{c.cellDate.getDate()} {c.dayBlocked && '🚫'}</span>
              {c.hasBookings && <span className="admin-agenda-month-dot" />}
            </button>
          ))}
        </div>
      </div>
    );
  };

  const renderListaView = () => {
    const rows = dayBookings.slice().sort((a, b) => bookingTimeLabel(a).localeCompare(bookingTimeLabel(b)));
    return (
      <div className="admin-card admin-agenda-list">
        <div className="admin-agenda-list-row admin-agenda-list-header">
          <div>Hora</div>
          <div>Cliente</div>
          <div>Serviço</div>
          <div>Status</div>
          <div>Documentos</div>
        </div>
        {rows.map((b) => {
          const meta = statusMeta(b.status);
          return (
            <button
              key={b.id}
              type="button"
              onClick={() => setActiveBookingId(b.id)}
              className="admin-agenda-list-row admin-agenda-list-body-row"
            >
              <div>{bookingTimeLabel(b)}</div>
              <div>
                {b.patients ? b.patients.name : '—'} {b.health_alert && <span title={b.health_reason}>⚠️</span>}
              </div>
              <div>{b.service}</div>
              <div>
                <span className="admin-agenda-status-pill" style={{ color: meta.color, borderColor: meta.color }}>
                  {meta.label}
                </span>
              </div>
              <div className="admin-agenda-list-docs">
                Anamnese: {b.patients && b.patients.status !== 'pending' ? '✓' : '—'} · Contrato:{' '}
                {b.patients && b.patients.hasContrato ? '✓' : '—'}
              </div>
            </button>
          );
        })}
        {rows.length === 0 && (
          <div className="admin-agenda-list-empty">Nenhum agendamento para este dia.</div>
        )}
      </div>
    );
  };

  return (
    <div>
      <div className="admin-agenda-header-row">
        <div>
          <span className="section-eyebrow">Área Clínica</span>
          <h1 className="admin-page-title">Agenda</h1>
        </div>
        <div className="admin-agenda-header-actions">
          <div className="admin-agenda-view-switch">
            {VIEW_MODES.map((v) => (
              <button
                key={v.key}
                type="button"
                onClick={() => setAgendaView(v.key)}
                className={`admin-agenda-view-btn ${agendaView === v.key ? 'admin-agenda-view-btn-active' : ''}`}
              >
                {v.label}
              </button>
            ))}
          </div>
          <button type="button" onClick={handleCopyAgendaLink} className="admin-open-client-btn">
            {linkCopied ? 'Copiado ✓' : '🔗 Copiar Link de Agenda'}
          </button>
          <button type="button" onClick={() => setShowBlockModal(true)} className="admin-open-client-btn">
            🚫 Bloquear Horário
          </button>
        </div>
      </div>

      <div className="admin-card admin-agenda-datenav">
        <button type="button" onClick={() => setAgendaOffset((o) => o - 1)} className="admin-agenda-nav-btn">
          ‹
        </button>
        <div className="admin-agenda-date-label">{dateLabel}</div>
        <button type="button" onClick={() => setAgendaOffset((o) => o + 1)} className="admin-agenda-nav-btn">
          ›
        </button>
        <button type="button" onClick={() => setAgendaOffset(0)} className="admin-open-client-btn">
          HOJE
        </button>
      </div>

      <div className="admin-agenda-filters">
        <select
          value={filters.room}
          onChange={(e) => setFilters((f) => ({ ...f, room: e.target.value }))}
          className="field-input admin-agenda-filter-select"
        >
          <option value="Todas">Todas as salas</option>
          {ROOMS.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
        <select
          value={filters.status}
          onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
          className="field-input admin-agenda-filter-select"
        >
          <option value="Todos">Todos os status</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s.value} value={s.label}>{s.label}</option>
          ))}
        </select>
      </div>

      {agendaView === 'dia' && renderDiaView()}
      {agendaView === 'semana' && renderSemanaView()}
      {agendaView === 'mes' && renderMesView()}
      {agendaView === 'lista' && renderListaView()}

      <button type="button" onClick={() => setShowNewApt(true)} className="admin-agenda-fab">
        + NOVO AGENDAMENTO
      </button>

      {activeBooking && (
        <BookingDrawer
          booking={activeBooking}
          patient={clients.find((c) => c.id === activeBooking.patient_id)}
          onUpdate={(fields) => handleFieldUpdate(activeBooking.id, fields)}
          onDelete={() => handleDelete(activeBooking.id)}
          onClose={() => setActiveBookingId(null)}
        />
      )}

      {showNewApt && (
        <NewAppointmentModal
          clients={clients}
          bookingDate={todayISO}
          onClose={() => setShowNewApt(false)}
          onCreated={handleCreated}
        />
      )}

      {showBlockModal && (
        <BlockSlotModal
          initialDate={todayISO}
          onClose={() => setShowBlockModal(false)}
          onCreated={handleBlockCreated}
        />
      )}
    </div>
  );
};

export default AgendaView;
