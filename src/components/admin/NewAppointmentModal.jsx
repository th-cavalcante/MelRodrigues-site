import React, { useEffect, useState } from 'react';
import { createBooking } from '../../lib/bookings';
import { createPatient } from '../../lib/patients';
import { fetchLaserServices } from '../../lib/services';
import { PROFESSIONALS } from '../../lib/agendaConstants';

const DEFAULT_ROOM = 'Sala Laser Hakon 4D';
const SERVICE_SLOTS = 10;

const NewAppointmentModal = ({ clients, setClients, bookingDate, onClose, onCreated }) => {
  const [search, setSearch] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [date, setDate] = useState(bookingDate);
  const [time, setTime] = useState('09:00');
  const [services, setServices] = useState(Array(SERVICE_SLOTS).fill(''));
  const [discount, setDiscount] = useState('');
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

  const selectedServices = services.filter(Boolean);
  const subtotal = selectedServices.reduce((sum, name) => {
    const found = laserServices.find((s) => s.name === name);
    return sum + (found ? Number(found.price) : 0);
  }, 0);
  const discountValue = Number(discount) || 0;
  const total = Math.max(subtotal - discountValue, 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const name = search.trim();
    if (!name || selectedServices.length === 0) {
      setError('Preencha o nome da cliente e selecione ao menos um serviço.');
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
        bookingDate: date,
        bookingTime: time,
        service: selectedServices.join(', '),
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
            <label className="field-label">Dia</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="field-input" />
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
