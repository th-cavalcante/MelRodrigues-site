import React, { useEffect, useState } from 'react';
import BookingDrawer from './BookingDrawer';
import { listBookings, updateBooking, deleteBooking } from '../../lib/bookings';
import { STATUS_OPTIONS, toISODate } from '../../lib/agendaConstants';
import { IconChevronLeft, IconChevronRight } from './Icons';

const WEEKDAY_LABELS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

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

const startOfToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

const MobileAgenda = ({ clients, setClients }) => {
  const [selected, setSelected] = useState(startOfToday);
  const [weekOffset, setWeekOffset] = useState(0);
  const [bookings, setBookings] = useState([]);
  const [activeBookingId, setActiveBookingId] = useState(null);

  const weekStart = startOfWeek(addDays(startOfToday(), weekOffset * 7));
  const weekEnd = addDays(weekStart, 6);
  const weekLabel = `${weekStart.getDate()} — ${weekEnd.getDate()} de ${weekEnd.toLocaleDateString('pt-BR', { month: 'long' })}`;
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const selectedISO = toISODate(selected);
  const todayISO = toISODate(startOfToday());

  const refetch = () => {
    listBookings({ from: selectedISO, to: selectedISO })
      .then(setBookings)
      .catch((err) => console.error('Erro ao carregar agenda:', err));
  };

  useEffect(() => {
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedISO]);

  const dayBookings = [...bookings].sort((a, b) => bookingTimeLabel(a).localeCompare(bookingTimeLabel(b)));
  const activeBooking = bookings.find((b) => b.id === activeBookingId) || null;

  const handleUpdate = async (bookingId, fields) => {
    try {
      await updateBooking(bookingId, fields);
      refetch();
    } catch (err) {
      console.error('Erro ao atualizar agendamento:', err);
      window.alert('Não foi possível salvar essa alteração.');
    }
  };

  const handleDelete = async (bookingId) => {
    try {
      await deleteBooking(bookingId);
      setActiveBookingId(null);
      refetch();
    } catch (err) {
      console.error('Erro ao excluir agendamento:', err);
    }
  };

  return (
    <div className="admin-mobile-agenda">
      <h1 className="admin-mobile-agenda-title">Agenda</h1>

      <div className="admin-appt-week-nav">
        <button type="button" onClick={() => setWeekOffset((w) => w - 1)} className="admin-appt-nav-btn" aria-label="Semana anterior">
          <IconChevronLeft size={14} />
        </button>
        <div className="admin-appt-week-label">{weekLabel}</div>
        <button type="button" onClick={() => setWeekOffset((w) => w + 1)} className="admin-appt-nav-btn" aria-label="Próxima semana">
          <IconChevronRight size={14} />
        </button>
      </div>

      <div className="admin-mobile-week-row">
        {weekDays.map((d) => {
          const iso = toISODate(d);
          const isSelected = iso === selectedISO;
          const isToday = iso === todayISO;
          return (
            <button
              key={iso}
              type="button"
              onClick={() => setSelected(d)}
              className={`admin-mobile-week-day ${isSelected ? 'selected' : ''} ${isToday && !isSelected ? 'today' : ''}`}
            >
              <span className="admin-mobile-week-day-label">{WEEKDAY_LABELS[d.getDay()]}</span>
              <span className="admin-mobile-week-day-num">{String(d.getDate()).padStart(2, '0')}</span>
            </button>
          );
        })}
      </div>

      <div className="admin-mobile-today-list">
        {dayBookings.length === 0 && <p className="admin-sessions-empty">Nenhum agendamento neste dia.</p>}
        {dayBookings.map((b) => {
          const meta = statusMeta(b.status);
          return (
            <button
              key={b.id}
              type="button"
              onClick={() => setActiveBookingId(b.id)}
              className="admin-mobile-today-row admin-mobile-today-row-btn"
            >
              <div className="admin-mobile-today-info">
                <span className="admin-mobile-today-name">{b.patients ? b.patients.name : '—'}</span>
                <span className="admin-mobile-today-service">
                  {b.service} · {bookingTimeLabel(b)}
                </span>
              </div>
              <span className={`admin-mobile-status-pill status-${b.status}`}>{meta.label}</span>
            </button>
          );
        })}
      </div>

      {activeBooking && (
        <BookingDrawer
          booking={activeBooking}
          patient={clients.find((c) => c.id === activeBooking.patient_id)}
          onUpdate={(fields) => handleUpdate(activeBooking.id, fields)}
          onDelete={() => handleDelete(activeBooking.id)}
          onClose={() => setActiveBookingId(null)}
        />
      )}
    </div>
  );
};

export default MobileAgenda;
