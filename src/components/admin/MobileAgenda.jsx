import React, { useEffect, useState } from 'react';
import { listBookings } from '../../lib/bookings';
import { STATUS_OPTIONS, toISODate } from '../../lib/agendaConstants';

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

const MobileAgenda = () => {
  const [selected, setSelected] = useState(startOfToday);
  const [bookings, setBookings] = useState([]);

  const weekStart = startOfWeek(selected);
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const selectedISO = toISODate(selected);
  const todayISO = toISODate(startOfToday());

  useEffect(() => {
    listBookings({ from: selectedISO, to: selectedISO })
      .then(setBookings)
      .catch((err) => console.error('Erro ao carregar agenda:', err));
  }, [selectedISO]);

  const dayBookings = [...bookings].sort((a, b) => bookingTimeLabel(a).localeCompare(bookingTimeLabel(b)));

  return (
    <div className="admin-mobile-agenda">
      <h1 className="admin-mobile-agenda-title">Agenda</h1>

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
            <div key={b.id} className="admin-mobile-today-row">
              <div className="admin-mobile-today-info">
                <span className="admin-mobile-today-name">{b.patients ? b.patients.name : '—'}</span>
                <span className="admin-mobile-today-service">
                  {b.service} · {bookingTimeLabel(b)}
                </span>
              </div>
              <span className={`admin-mobile-status-pill status-${b.status}`}>{meta.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MobileAgenda;
