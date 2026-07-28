import React, { useEffect, useState } from 'react';
import { createBooking, getBookedTimes } from '../../lib/bookings';
import { createPatient } from '../../lib/patients';
import { fetchLaserServices } from '../../lib/services';
import { getPublicBlockedSlots, getPublicBlockedDays } from '../../lib/blockedSlots';
import { PROFESSIONALS, COMPLEMENTARY_SERVICE_OPTIONS, BLOCKED_SLOTS, toISODate } from '../../lib/agendaConstants';
import { IconChevronLeft, IconChevronRight } from './Icons';

const DEFAULT_ROOM = 'Sala Laser Hakon 4D';
const MAX_SERVICE_SLOTS = 10;

const WEEKDAY_LABELS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

const ALL_TIMES = (() => {
  const rows = [];
  for (let mins = 8 * 60; mins <= 20 * 60; mins += 30) {
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

const startOfToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

const NewAppointmentModal = ({ clients, setClients, bookingDate, onClose, onCreated }) => {
  const [search, setSearch] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);

  const [today] = useState(startOfToday);
  const [weekOffset, setWeekOffset] = useState(() => {
    const raw = bookingDate ? new Date(`${bookingDate}T00:00:00`) : today;
    const initialDate = raw < today ? today : raw;
    return Math.round((startOfWeek(initialDate) - startOfWeek(today)) / (7 * 86400000));
  });
  const [selectedDayOffset, setSelectedDayOffset] = useState(() => {
    const raw = bookingDate ? new Date(`${bookingDate}T00:00:00`) : today;
    const initialDate = raw < today ? today : raw;
    return Math.round((initialDate - today) / 86400000);
  });
  const [selectedTime, setSelectedTime] = useState(null);
  const [bookedTimes, setBookedTimes] = useState([]);
  const [dynamicBlockedTimes, setDynamicBlockedTimes] = useState([]);
  const [blockedDays, setBlockedDays] = useState([]);

  const [services, setServices] = useState(['']);
  const [complementaryServices, setComplementaryServices] = useState(['']);
  const [discount, setDiscount] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [laserServices, setLaserServices] = useState([]);

  useEffect(() => {
    fetchLaserServices().then(setLaserServices).catch((err) => console.error('Erro ao carregar tabela de preço:', err));
  }, []);

  const weekStart = startOfWeek(addDays(today, weekOffset * 7));
  const weekEnd = addDays(weekStart, 6);
  const weekLabel = `${weekStart.getDate()} — ${weekEnd.getDate()} de ${weekEnd.toLocaleDateString('pt-BR', { month: 'long' })}`;

  useEffect(() => {
    getPublicBlockedDays(toISODate(weekStart), toISODate(weekEnd))
      .then(setBlockedDays)
      .catch((err) => console.error('Erro ao carregar dias bloqueados:', err));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weekOffset]);

  useEffect(() => {
    if (selectedDayOffset === null) return;
    const date = toISODate(addDays(today, selectedDayOffset));
    getBookedTimes(date)
      .then(setBookedTimes)
      .catch((err) => console.error('Erro ao carregar horários ocupados:', err));
    getPublicBlockedSlots(date)
      .then((rows) => setDynamicBlockedTimes(rows.map((r) => r.blocked_time).filter(Boolean).map((t) => t.slice(0, 5))))
      .catch((err) => console.error('Erro ao carregar horários bloqueados:', err));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDayOffset]);

  const dayOptions = WEEKDAY_LABELS.map((wd, i) => {
    const d = addDays(weekStart, i);
    const dayOffset = Math.round((d - today) / 86400000);
    const isPast = dayOffset < 0;
    const isSunday = i === 0;
    const isBlocked = blockedDays.includes(toISODate(d));
    return { weekday: wd, num: d.getDate(), dayOffset, disabled: isPast || isSunday || isBlocked };
  });

  const blockedTimesForDay = [...BLOCKED_SLOTS.map((bl) => bl.time), ...dynamicBlockedTimes];
  const timeOptions = ALL_TIMES.filter((t) => !blockedTimesForDay.includes(t) && !bookedTimes.includes(t));

  const handleSelectDay = (dayOffset) => {
    setSelectedDayOffset(dayOffset);
    setSelectedTime(null);
  };

  const searchTerm = search.toLowerCase().trim();
  const results = clients.filter((c) => (c.name || '').toLowerCase().includes(searchTerm));

  const handleSelectClient = (c) => {
    setSelectedPatient(c);
    setSearch(c.name);
    setSearchFocused(false);
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setSelectedPatient(null);
    setSearchFocused(true);
  };

  const handleSearchBlur = () => {
    // Delay pra dar tempo do clique num resultado da lista registrar antes
    // de sumir com ela (blur do input dispara antes do click no botão).
    setTimeout(() => setSearchFocused(false), 150);
  };

  const handleServiceChange = (index) => (e) => {
    setServices((s) => s.map((v, i) => (i === index ? e.target.value : v)));
  };

  const addServiceSlot = () => {
    setServices((s) => (s.length < MAX_SERVICE_SLOTS ? [...s, ''] : s));
  };

  const handleComplementaryChange = (index) => (e) => {
    setComplementaryServices((s) => s.map((v, i) => (i === index ? e.target.value : v)));
  };

  const addComplementarySlot = () => {
    setComplementaryServices((s) => (s.length < COMPLEMENTARY_SERVICE_OPTIONS.length ? [...s, ''] : s));
  };

  const selectedServices = services.filter(Boolean);
  const selectedComplementary = complementaryServices.filter(Boolean);
  const subtotal = selectedServices.reduce((sum, name) => {
    const found = laserServices.find((s) => s.name === name);
    return sum + (found ? Number(found.price) : 0);
  }, 0);
  const discountValue = Number(discount) || 0;
  const total = Math.max(subtotal - discountValue, 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const name = search.trim();
    if (!name || selectedServices.length === 0 || selectedDayOffset === null || !selectedTime) {
      setError('Preencha o nome da cliente, escolha um dia e horário e selecione ao menos um serviço.');
      return;
    }
    setError('');
    setSaving(true);
    try {
      // Se não veio de um clique na lista (cliente já cadastrada), o nome
      // digitado vira um cadastro novo — mesma função rápida de "Cadastro
      // Paciente", só com o nome preenchido.
      let patient = selectedPatient;
      if (!patient) {
        patient = await createPatient({ nome: name });
        if (setClients) setClients((cs) => [patient, ...cs]);
      }
      const created = await createBooking({
        patient,
        room: DEFAULT_ROOM,
        professional: PROFESSIONALS[0],
        bookingDate: toISODate(addDays(today, selectedDayOffset)),
        bookingTime: selectedTime,
        service: selectedServices.join(', '),
        complementaryService: selectedComplementary.join(', '),
        valor: total,
      });
      onCreated(created);
    } catch (err) {
      console.error('Erro ao criar agendamento:', err);
      setError(`Não foi possível salvar o agendamento: ${err.message || 'erro desconhecido'}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-agenda-modal-overlay">
      <form className="admin-agenda-modal admin-agenda-modal-sheet" onSubmit={handleSubmit}>
        <div className="admin-agenda-modal-header">
          <h2 className="admin-agenda-modal-title">Novo Agendamento</h2>
          <button type="button" onClick={onClose} className="admin-agenda-modal-close" aria-label="Fechar">
            ×
          </button>
        </div>

        <div className="admin-agenda-modal-body">
          <div className="field-wrap admin-agenda-search-wrap">
            <label className="field-label">Nome da Cliente</label>
            <input
              type="text"
              placeholder="Buscar ou digitar nome de uma nova cliente..."
              value={search}
              onChange={handleSearchChange}
              onFocus={() => setSearchFocused(true)}
              onBlur={handleSearchBlur}
              className="field-input"
            />
            {searchFocused && (
              <div className="admin-agenda-search-results">
                {results.map((c) => (
                  <button key={c.id} type="button" onClick={() => handleSelectClient(c)} className="admin-agenda-search-result">
                    {c.name || 'Sem nome'}
                  </button>
                ))}
                {results.length === 0 && (
                  <div className="admin-agenda-search-empty">
                    {search.trim()
                      ? `Nenhuma cliente encontrada. "${search.trim()}" será cadastrada como nova paciente.`
                      : 'Digite o nome pra buscar ou cadastrar uma nova cliente.'}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="field-wrap">
            <label className="field-label">Dia e horário</label>

            <div className="admin-appt-week-nav">
              <button type="button" onClick={() => setWeekOffset((w) => w - 1)} className="admin-appt-nav-btn" aria-label="Semana anterior">
                <IconChevronLeft size={14} />
              </button>
              <div className="admin-appt-week-label">{weekLabel}</div>
              <button type="button" onClick={() => setWeekOffset((w) => w + 1)} className="admin-appt-nav-btn" aria-label="Próxima semana">
                <IconChevronRight size={14} />
              </button>
            </div>

            <div className="admin-appt-day-grid">
              {dayOptions.map((d) => (
                <button
                  key={d.dayOffset}
                  type="button"
                  disabled={d.disabled}
                  onClick={() => handleSelectDay(d.dayOffset)}
                  className={`admin-appt-day-card ${selectedDayOffset === d.dayOffset ? 'selected' : ''}`}
                >
                  <span className="admin-appt-day-weekday">{d.weekday}</span>
                  <span className="admin-appt-day-num">{d.num}</span>
                </button>
              ))}
            </div>

            {selectedDayOffset !== null && (
              <div className="admin-appt-time-grid">
                {timeOptions.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setSelectedTime(t)}
                    className={`admin-appt-time-btn ${selectedTime === t ? 'selected' : ''}`}
                  >
                    {t}
                  </button>
                ))}
                {timeOptions.length === 0 && (
                  <div className="admin-appt-no-times">Sem horários livres neste dia. Escolha outro dia.</div>
                )}
              </div>
            )}
          </div>

          <div className="field-wrap">
            <label className="field-label">Serviços de Depilação a Laser</label>
            <div className="admin-agenda-services-grid">
              {services.map((value, i) => (
                <select
                  key={i}
                  value={value}
                  onChange={handleServiceChange(i)}
                  className="field-input"
                >
                  <option value="">{i === 0 ? 'Selecione a região' : 'Região adicional (opcional)'}</option>
                  {laserServices.map((s) => (
                    <option key={s.id} value={s.name}>{s.name}</option>
                  ))}
                </select>
              ))}
            </div>
            {services[services.length - 1] && services.length < MAX_SERVICE_SLOTS && (
              <button type="button" onClick={addServiceSlot} className="admin-appt-add-btn">
                + Adicionar serviço
              </button>
            )}
          </div>

          <div className="field-wrap">
            <label className="field-label">Serviços complementares</label>
            <div className="admin-agenda-services-grid">
              {complementaryServices.map((value, i) => (
                <select
                  key={i}
                  value={value}
                  onChange={handleComplementaryChange(i)}
                  className="field-input"
                >
                  <option value="">Nenhum</option>
                  {COMPLEMENTARY_SERVICE_OPTIONS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              ))}
            </div>
            {complementaryServices[complementaryServices.length - 1] && complementaryServices.length < COMPLEMENTARY_SERVICE_OPTIONS.length && (
              <button type="button" onClick={addComplementarySlot} className="admin-appt-add-btn">
                + Adicionar serviço complementar
              </button>
            )}
          </div>

          <div className="admin-agenda-valor-summary">
            <div className="admin-agenda-valor-row">
              <span>Valor dos procedimentos</span>
              <strong>R$ {subtotal.toFixed(2).replace('.', ',')}</strong>
            </div>
            <div className="admin-agenda-valor-row admin-agenda-valor-discount-row">
              <label htmlFor="apt-discount">Desconto (R$)</label>
              <input
                id="apt-discount"
                type="number"
                min="0"
                step="0.01"
                placeholder="0,00"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
                className="field-input admin-agenda-discount-input"
              />
            </div>
            <div className="admin-agenda-valor-row admin-agenda-valor-total-row">
              <span>Total</span>
              <strong>R$ {total.toFixed(2).replace('.', ',')}</strong>
            </div>
          </div>

          {error && <div className="admin-login-error">{error}</div>}
        </div>

        <div className="admin-agenda-modal-actions">
          <button type="button" onClick={onClose} className="admin-agenda-modal-cancel">
            CANCELAR
          </button>
          <button type="submit" disabled={saving} className="admin-open-client-btn admin-agenda-modal-save">
            {saving ? 'SALVANDO...' : 'SALVAR AGENDAMENTO'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewAppointmentModal;
