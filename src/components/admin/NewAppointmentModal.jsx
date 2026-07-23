import React, { useEffect, useState } from 'react';
import { createBooking } from '../../lib/bookings';
import { fetchLaserServices } from '../../lib/services';
import { ROOMS, PROFESSIONALS } from '../../lib/agendaConstants';

const NewAppointmentModal = ({ clients, bookingDate, onClose, onCreated }) => {
  const [search, setSearch] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [time, setTime] = useState('09:00');
  const [service, setService] = useState('');
  const [room, setRoom] = useState('Sala de Avaliação');
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPatient || !service) {
      setError('Selecione a cliente e o serviço.');
      return;
    }
    setError('');
    setSaving(true);
    try {
      await createBooking({
        patient: selectedPatient,
        room,
        professional: PROFESSIONALS[0],
        bookingDate,
        bookingTime: time,
        service,
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

        <div className="admin-cadastro-row">
          <div className="field-wrap">
            <label className="field-label">Horário</label>
            <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="field-input" />
          </div>
          <div className="field-wrap">
            <label className="field-label">Sala</label>
            <select value={room} onChange={(e) => setRoom(e.target.value)} className="field-input">
              {ROOMS.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="field-wrap">
          <label className="field-label">Serviço</label>
          <select value={service} onChange={(e) => setService(e.target.value)} className="field-input">
            <option value="">Selecione a região</option>
            {laserServices.map((s) => (
              <option key={s.id} value={s.name}>{s.name}</option>
            ))}
          </select>
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
