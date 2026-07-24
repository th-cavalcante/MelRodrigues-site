import React, { useEffect, useState } from 'react';
import { createBooking } from '../../lib/bookings';
import { fetchLaserServices } from '../../lib/services';
import { PROFESSIONALS } from '../../lib/agendaConstants';

const DEFAULT_ROOM = 'Sala Laser Hakon 4D';
const SERVICE_SLOTS = 10;

const NewAppointmentModal = ({ clients, bookingDate, onClose, onCreated }) => {
  const [search, setSearch] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [time, setTime] = useState('09:00');
  const [services, setServices] = useState(Array(SERVICE_SLOTS).fill(''));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [laserServices, setLaserServices] = useState([]);

  useEffect(() => {
    fetchLaserServices().then(setLaserServices).catch((err) => console.error('Erro ao carregar tabela de preço:', err));
  }, []);

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

  const handleServiceChange = (index) => (e) => {
    setServices((s) => s.map((v, i) => (i === index ? e.target.value : v)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const selectedServices = services.filter(Boolean);
    if (!selectedPatient || selectedServices.length === 0) {
      setError('Selecione a cliente e ao menos um serviço.');
      return;
    }
    setError('');
    setSaving(true);
    try {
      const valor = selectedServices.reduce((sum, name) => {
        const found = laserServices.find((s) => s.name === name);
        return sum + (found ? Number(found.price) : 0);
      }, 0);
      await createBooking({
        patient: selectedPatient,
        room: DEFAULT_ROOM,
        professional: PROFESSIONALS[0],
        bookingDate,
        bookingTime: time,
        service: selectedServices.join(', '),
        valor,
      });
      onCreated();
    } catch (err) {
      console.error('Erro ao criar agendamento:', err);
      setError(`Não foi possível salvar o agendamento: ${err.message || 'erro desconhecido'}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-agenda-modal-overlay">
      <form className="admin-agenda-modal" onSubmit={handleSubmit}>
        <h2 className="admin-agenda-modal-title">Novo Agendamento</h2>

        <div className="field-wrap admin-agenda-search-wrap">
          <label className="field-label">Nome da Cliente</label>
          <input
            type="text"
            placeholder="Buscar pelo nome completo..."
            value={search}
            onChange={handleSearchChange}
            onFocus={() => setSearchFocused(true)}
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
                <div className="admin-agenda-search-empty">Nenhuma cliente encontrada na ficha de anamnese.</div>
              )}
            </div>
          )}
        </div>

        <div className="field-wrap">
          <label className="field-label">Horário</label>
          <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="field-input" />
        </div>

        <div className="field-wrap">
          <label className="field-label">Serviço</label>
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
        </div>

        {error && <div className="admin-login-error">{error}</div>}

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
