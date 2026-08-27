import React, { useEffect, useState } from 'react';
import {
  listRentalClients,
  createRentalClient,
  updateRentalClient,
  deleteRentalClient,
  createRentalBooking,
  updateRentalBooking,
  markRentalBookingContractSent,
  deleteRentalBooking,
  getSignedDocumentUrl,
} from '../../lib/rentals';
import { sendRentalContract } from '../../lib/evolution';
import { signRentalAsLandlord, listSignatureAuditLog } from '../../lib/signatures';
import { buildRentalContractBody, formatRentalEndereco } from './rentalContract';
import { downloadDocPdf } from '../cliente/docPdf';
import { IconChevronRight, IconTrash } from './Icons';

const AUDIT_EVENT_LABELS = {
  viewed: 'Cliente abriu o contrato',
  consent_confirmed: 'Cliente confirmou que leu e concorda',
  otp_sent: 'Código de verificação enviado',
  otp_verified: 'Código de verificação confirmado',
  otp_failed: 'Tentativa de código incorreta',
  signature_completed: 'Assinatura concluída',
  pdf_generated: 'PDF final gerado',
  hash_recorded: 'Hash SHA-256 registrado',
  document_locked: 'Documento bloqueado para edição',
  landlord_signed: 'Locadora assinou',
};

const emptyClientForm = {
  nome: '', nascimento: '', cpf: '', rua: '', bairro: '', cidade: '', cep: '', email: '', telefone: '',
};

const emptyBookingForm = { dataLocacao: '', valor: '', periodoHoras: '' };

const PERIODO_OPTIONS = [
  { value: '6', label: '6 horas' },
  { value: '8', label: '8 horas' },
  { value: '12', label: '12 horas' },
];

const formatSignedDate = (iso) => (iso ? new Date(iso).toLocaleDateString('pt-BR') : null);

const formatDataBr = (iso) => {
  if (!iso) return '—';
  const [y, m, d] = iso.split('-');
  return y ? `${d}/${m}/${y}` : '—';
};

const formatValorBr = (v) => `R$ ${(Number(v) || 0).toFixed(2).replace('.', ',')}`;

const LocacoesView = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showClientForm, setShowClientForm] = useState(false);
  const [clientForm, setClientForm] = useState(emptyClientForm);
  const [savingClient, setSavingClient] = useState(false);
  const [clientFormError, setClientFormError] = useState('');

  const [selectedClientId, setSelectedClientId] = useState(null);
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [addressCopied, setAddressCopied] = useState(false);

  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingForm, setBookingForm] = useState(emptyBookingForm);
  const [savingBooking, setSavingBooking] = useState(false);
  const [bookingFormError, setBookingFormError] = useState('');

  const [contractSending, setContractSending] = useState(null);
  const [contractError, setContractError] = useState({});
  const [landlordSigning, setLandlordSigning] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);
  const [auditBookingId, setAuditBookingId] = useState(null);
  const [auditEvents, setAuditEvents] = useState([]);
  const [auditLoading, setAuditLoading] = useState(false);

  useEffect(() => {
    listRentalClients()
      .then(setClients)
      .catch((err) => console.error('Erro ao carregar clientes de locação:', err))
      .finally(() => setLoading(false));
  }, []);

  const setClientField = (key) => (e) => setClientForm((f) => ({ ...f, [key]: e.target.value }));
  const setBookingField = (key) => (e) => setBookingForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmitClient = async (e) => {
    e.preventDefault();
    if (!clientForm.nome.trim() || !clientForm.telefone.trim()) {
      setClientFormError('Preencha ao menos o nome e o WhatsApp do cliente.');
      return;
    }
    setClientFormError('');
    setSavingClient(true);
    try {
      const created = await createRentalClient(clientForm);
      setClients((cs) => [{ ...created, bookings: [] }, ...cs]);
      setClientForm(emptyClientForm);
      setShowClientForm(false);
    } catch (err) {
      console.error('Erro ao cadastrar cliente de locação:', err);
      setClientFormError(`Não foi possível salvar o cadastro: ${err.message || 'erro desconhecido'}`);
    } finally {
      setSavingClient(false);
    }
  };

  const handleFieldBlur = (id, field) => (e) => {
    const { value } = e.target;
    setClients((cs) => cs.map((c) => (c.id === id ? { ...c, [field]: value } : c)));
    updateRentalClient(id, { [field]: value || null }).catch((err) =>
      console.error('Erro ao salvar alteração:', err)
    );
  };

  const handleFieldChange = (id, field) => (e) => {
    const { value } = e.target;
    setClients((cs) => cs.map((c) => (c.id === id ? { ...c, [field]: value } : c)));
  };

  const handleCopyAddress = async (client) => {
    try {
      await navigator.clipboard.writeText(formatRentalEndereco(client));
      setAddressCopied(true);
      setTimeout(() => setAddressCopied(false), 2000);
    } catch (err) {
      console.error('Erro ao copiar endereço:', err);
    }
  };

  const handleDeleteClient = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este cliente e todo o histórico de locações dele? Essa ação não pode ser desfeita.')) return;
    try {
      await deleteRentalClient(id);
      setClients((cs) => cs.filter((c) => c.id !== id));
      setSelectedClientId((sid) => (sid === id ? null : sid));
    } catch (err) {
      console.error('Erro ao excluir cliente de locação:', err);
    }
  };

  const handleSubmitBooking = async (e) => {
    e.preventDefault();
    if (!selectedClientId) return;
    setBookingFormError('');
    setSavingBooking(true);
    try {
      const created = await createRentalBooking(selectedClientId, bookingForm);
      setClients((cs) =>
        cs.map((c) => (c.id === selectedClientId ? { ...c, bookings: [{ ...created, signature: null }, ...c.bookings] } : c))
      );
      setBookingForm(emptyBookingForm);
      setShowBookingForm(false);
    } catch (err) {
      console.error('Erro ao cadastrar locação:', err);
      setBookingFormError(`Não foi possível salvar a locação: ${err.message || 'erro desconhecido'}`);
    } finally {
      setSavingBooking(false);
    }
  };

  const handleBookingFieldBlur = (bookingId, field) => (e) => {
    const { value } = e.target;
    setClients((cs) =>
      cs.map((c) =>
        c.id === selectedClientId
          ? { ...c, bookings: c.bookings.map((b) => (b.id === bookingId ? { ...b, [field]: value } : b)) }
          : c
      )
    );
    updateRentalBooking(bookingId, { [field]: value || null }).catch((err) =>
      console.error('Erro ao salvar alteração da locação:', err)
    );
  };

  const handleBookingFieldChange = (bookingId, field) => (e) => {
    const { value } = e.target;
    setClients((cs) =>
      cs.map((c) =>
        c.id === selectedClientId
          ? { ...c, bookings: c.bookings.map((b) => (b.id === bookingId ? { ...b, [field]: value } : b)) }
          : c
      )
    );
  };

  const handleSendContract = async (client, booking) => {
    setContractError((m) => ({ ...m, [booking.id]: '' }));
    setContractSending(booking.id);
    try {
      const link = `${window.location.origin}/cliente/locacao?rental=${booking.id}`;
      await sendRentalContract(booking.id, link);
      await markRentalBookingContractSent(booking.id);
      setClients((cs) =>
        cs.map((c) =>
          c.id === client.id
            ? { ...c, bookings: c.bookings.map((b) => (b.id === booking.id ? { ...b, contract_sent: true } : b)) }
            : c
        )
      );
    } catch (err) {
      console.error('Erro ao enviar contrato:', err);
      setContractError((m) => ({ ...m, [booking.id]: err.message || 'Não foi possível enviar o contrato.' }));
    } finally {
      setContractSending(null);
    }
  };

  const handleSignAsLandlord = async (client, booking) => {
    setLandlordSigning(booking.id);
    try {
      await signRentalAsLandlord(booking.id);
      setClients((cs) =>
        cs.map((c) =>
          c.id === client.id
            ? { ...c, bookings: c.bookings.map((b) => (b.id === booking.id ? { ...b, landlord_signed_at: new Date().toISOString() } : b)) }
            : c
        )
      );
    } catch (err) {
      console.error('Erro ao assinar como locadora:', err);
      setContractError((m) => ({ ...m, [booking.id]: err.message || 'Não foi possível registrar a assinatura da locadora.' }));
    } finally {
      setLandlordSigning(null);
    }
  };

  const handleDownloadContract = async (client, booking) => {
    // Documento já assinado: baixa o PDF exatamente como foi gerado no
    // momento da assinatura (armazenado no Storage), em vez de regenerar a
    // partir dos dados atuais do cadastro — que podem ter mudado desde então.
    if (booking.signature?.pdf_storage_path) {
      setDownloadingId(booking.id);
      try {
        const url = await getSignedDocumentUrl(booking.signature.pdf_storage_path);
        window.open(url, '_blank', 'noopener');
      } catch (err) {
        console.error('Erro ao gerar link de download:', err);
        setContractError((m) => ({ ...m, [booking.id]: 'Não foi possível baixar o PDF assinado.' }));
      } finally {
        setDownloadingId(null);
      }
      return;
    }

    // Assinaturas antigas (anteriores a este reforço de segurança) não têm
    // PDF armazenado — mantém o comportamento anterior como fallback.
    downloadDocPdf({
      title: 'Contrato de Locação — Hakon 4D',
      body: buildRentalContractBody({ ...client, ...booking }),
      signatureDataUrl: booking.signature?.signature_data_url || null,
      patientName: booking.signature?.client_name_snapshot || client.name,
      dateLabel: formatSignedDate(booking.signature?.signed_at),
    });
  };

  const handleToggleAuditLog = async (booking) => {
    if (auditBookingId === booking.id) {
      setAuditBookingId(null);
      return;
    }
    setAuditBookingId(booking.id);
    setAuditLoading(true);
    try {
      const events = await listSignatureAuditLog('rental_contract', booking.id);
      setAuditEvents(events);
    } catch (err) {
      console.error('Erro ao carregar trilha de auditoria:', err);
      setAuditEvents([]);
    } finally {
      setAuditLoading(false);
    }
  };

  const handleDeleteBooking = async (client, booking) => {
    if (!window.confirm('Tem certeza que deseja excluir esta locação? Essa ação não pode ser desfeita.')) return;
    try {
      await deleteRentalBooking(booking.id);
      setClients((cs) =>
        cs.map((c) => (c.id === client.id ? { ...c, bookings: c.bookings.filter((b) => b.id !== booking.id) } : c))
      );
      setSelectedBookingId((bid) => (bid === booking.id ? null : bid));
    } catch (err) {
      console.error('Erro ao excluir locação:', err);
    }
  };

  const selectedClient = clients.find((c) => c.id === selectedClientId) || null;

  // Só contabiliza locações do mês corrente — uma locação agendada pra um
  // cliente no mês seguinte não entra nesse total até o mês dela chegar.
  const currentMonthPrefix = new Date().toISOString().slice(0, 7);
  const totalValue = clients.reduce(
    (sum, c) =>
      sum +
      (c.bookings || [])
        .filter((b) => (b.rental_date || '').startsWith(currentMonthPrefix))
        .reduce((s, b) => s + (Number(b.rental_value) || 0), 0),
    0
  );

  return (
    <div>
      <div className="admin-page-header">
        <span className="section-eyebrow">Hakon 4D</span>
        <h1 className="admin-page-title">Locações</h1>
        <p className="admin-page-subtitle">Cadastro e gestão dos clientes que alugam o equipamento Hakon 4D.</p>
      </div>

      <div className="admin-locacoes-toolbar">
        <button type="button" onClick={() => setShowClientForm(true)} className="admin-open-client-btn">
          + Cadastrar Cliente
        </button>
        <div className="admin-locacoes-total">
          <span className="admin-small-label">Total em Locações (Mês Atual)</span>
          <span className="admin-locacoes-total-value">{formatValorBr(totalValue)}</span>
        </div>
      </div>

      <div className="admin-card">
        <div className="admin-card-title">Clientes</div>

        {loading && <p className="admin-page-subtitle">Carregando...</p>}
        {!loading && clients.length === 0 && <p className="admin-page-subtitle">Nenhum cliente cadastrado ainda.</p>}

        <div className="admin-locacoes-list">
          {clients.map((c) => {
            const lastBooking = (c.bookings || [])[0];
            return (
              <button key={c.id} type="button" onClick={() => setSelectedClientId(c.id)} className="admin-locacoes-row">
                <div className="admin-client-initial admin-locacoes-row-avatar">{(c.name || '?').charAt(0)}</div>
                <div className="admin-locacoes-row-info">
                  <div className="admin-locacoes-row-name">{c.name || 'Sem nome'}</div>
                  <div className="admin-locacoes-row-date">
                    {lastBooking
                      ? `Última locação: ${formatDataBr(lastBooking.rental_date)}`
                      : 'Nenhuma locação ainda'}
                  </div>
                </div>
                <IconChevronRight size={16} />
              </button>
            );
          })}
        </div>
      </div>

      {showClientForm && (
        <div className="admin-agenda-modal-overlay">
          <form className="admin-agenda-modal admin-agenda-modal-sheet" onSubmit={handleSubmitClient}>
            <div className="admin-agenda-modal-header">
              <h2 className="admin-agenda-modal-title">Novo Cadastro</h2>
              <button type="button" onClick={() => setShowClientForm(false)} className="admin-agenda-modal-close" aria-label="Fechar">
                ×
              </button>
            </div>

            <div className="admin-agenda-modal-body">
              <div className="field-row">
                <div>
                  <label className="field-label" htmlFor="loc-nome">Nome Completo</label>
                  <input id="loc-nome" type="text" placeholder="Digite o nome..." value={clientForm.nome} onChange={setClientField('nome')} className="field-input" />
                </div>
                <div>
                  <label className="field-label" htmlFor="loc-nascimento">Data de Nascimento</label>
                  <input id="loc-nascimento" type="date" value={clientForm.nascimento} onChange={setClientField('nascimento')} className="field-input" />
                </div>
              </div>

              <div className="field-row">
                <div>
                  <label className="field-label" htmlFor="loc-cpf">CPF</label>
                  <input id="loc-cpf" type="text" placeholder="000.000.000-00" value={clientForm.cpf} onChange={setClientField('cpf')} className="field-input" />
                </div>
                <div>
                  <label className="field-label" htmlFor="loc-telefone">WhatsApp</label>
                  <input id="loc-telefone" type="text" placeholder="(13) 90000-0000" value={clientForm.telefone} onChange={setClientField('telefone')} className="field-input" />
                </div>
              </div>

              <div className="field-wrap">
                <label className="field-label" htmlFor="loc-email">E-mail</label>
                <input id="loc-email" type="email" placeholder="cliente@email.com" value={clientForm.email} onChange={setClientField('email')} className="field-input" />
              </div>

              <div className="field-wrap">
                <label className="field-label" htmlFor="loc-rua">Rua e nº</label>
                <input id="loc-rua" type="text" placeholder="Digite o nome da rua e nº" value={clientForm.rua} onChange={setClientField('rua')} className="field-input" />
              </div>

              <div className="field-row">
                <div>
                  <label className="field-label" htmlFor="loc-bairro">Bairro</label>
                  <input id="loc-bairro" type="text" placeholder="Nome do bairro" value={clientForm.bairro} onChange={setClientField('bairro')} className="field-input" />
                </div>
                <div>
                  <label className="field-label" htmlFor="loc-cidade">Cidade</label>
                  <input id="loc-cidade" type="text" placeholder="Nome da cidade" value={clientForm.cidade} onChange={setClientField('cidade')} className="field-input" />
                </div>
              </div>

              <div className="field-wrap-last">
                <label className="field-label" htmlFor="loc-cep">CEP</label>
                <input id="loc-cep" type="text" placeholder="00000-000" value={clientForm.cep} onChange={setClientField('cep')} className="field-input" />
              </div>

              {clientFormError && <div className="admin-login-error">{clientFormError}</div>}
            </div>

            <div className="admin-agenda-modal-actions">
              <button type="button" onClick={() => setShowClientForm(false)} className="admin-agenda-modal-cancel">
                CANCELAR
              </button>
              <button type="submit" disabled={savingClient} className="admin-open-client-btn admin-agenda-modal-save">
                {savingClient ? 'SALVANDO...' : 'CADASTRAR CLIENTE'}
              </button>
            </div>
          </form>
        </div>
      )}

      {selectedClient && (
        <div className="admin-locacoes-drawer-overlay" onClick={() => { setSelectedClientId(null); setSelectedBookingId(null); }}>
          <div className="admin-locacoes-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="admin-locacoes-drawer-topbar">
              <button
                type="button"
                onClick={() => { setSelectedClientId(null); setSelectedBookingId(null); }}
                className="admin-locacoes-drawer-back"
                aria-label="Fechar"
              >
                ←
              </button>
              <button type="button" onClick={() => handleDeleteClient(selectedClient.id)} className="admin-locacoes-drawer-trash" aria-label="Excluir cliente">
                <IconTrash size={15} />
              </button>
            </div>

            <div className="admin-locacoes-drawer-header">
              <div className="admin-client-initial admin-locacoes-drawer-avatar">{(selectedClient.name || '?').charAt(0)}</div>
              <input
                type="text"
                value={selectedClient.name || ''}
                onChange={handleFieldChange(selectedClient.id, 'name')}
                onBlur={handleFieldBlur(selectedClient.id, 'name')}
                placeholder="Sem nome"
                className="admin-locacoes-plain-input admin-locacoes-drawer-name-input"
              />
            </div>

            <div className="admin-locacoes-drawer-card">
              <div>
                <span className="admin-small-label">CPF</span>
                <input
                  type="text"
                  value={selectedClient.cpf || ''}
                  onChange={handleFieldChange(selectedClient.id, 'cpf')}
                  onBlur={handleFieldBlur(selectedClient.id, 'cpf')}
                  className="admin-locacoes-plain-input"
                />
              </div>
              <div>
                <span className="admin-small-label">Data de Nascimento</span>
                <input
                  type="date"
                  value={selectedClient.birthdate || ''}
                  onChange={handleFieldChange(selectedClient.id, 'birthdate')}
                  onBlur={handleFieldBlur(selectedClient.id, 'birthdate')}
                  className="admin-locacoes-plain-input"
                />
              </div>
              <div>
                <span className="admin-small-label">WhatsApp</span>
                <input
                  type="text"
                  value={selectedClient.phone || ''}
                  onChange={handleFieldChange(selectedClient.id, 'phone')}
                  onBlur={handleFieldBlur(selectedClient.id, 'phone')}
                  className="admin-locacoes-plain-input"
                />
              </div>
              <div>
                <span className="admin-small-label">E-mail</span>
                <input
                  type="email"
                  value={selectedClient.email || ''}
                  onChange={handleFieldChange(selectedClient.id, 'email')}
                  onBlur={handleFieldBlur(selectedClient.id, 'email')}
                  className="admin-locacoes-plain-input"
                />
              </div>
              <div>
                <span className="admin-small-label">Rua e nº</span>
                <input
                  type="text"
                  value={selectedClient.street || ''}
                  onChange={handleFieldChange(selectedClient.id, 'street')}
                  onBlur={handleFieldBlur(selectedClient.id, 'street')}
                  className="admin-locacoes-plain-input"
                />
              </div>
              <div className="field-row admin-locacoes-fields">
                <div>
                  <span className="admin-small-label">Bairro</span>
                  <input
                    type="text"
                    value={selectedClient.neighborhood || ''}
                    onChange={handleFieldChange(selectedClient.id, 'neighborhood')}
                    onBlur={handleFieldBlur(selectedClient.id, 'neighborhood')}
                    className="admin-locacoes-plain-input"
                  />
                </div>
                <div>
                  <span className="admin-small-label">Cidade</span>
                  <input
                    type="text"
                    value={selectedClient.city || ''}
                    onChange={handleFieldChange(selectedClient.id, 'city')}
                    onBlur={handleFieldBlur(selectedClient.id, 'city')}
                    className="admin-locacoes-plain-input"
                  />
                </div>
              </div>
              <div>
                <span className="admin-small-label">CEP</span>
                <input
                  type="text"
                  value={selectedClient.cep || ''}
                  onChange={handleFieldChange(selectedClient.id, 'cep')}
                  onBlur={handleFieldBlur(selectedClient.id, 'cep')}
                  className="admin-locacoes-plain-input"
                />
              </div>
              <div>
                <button type="button" onClick={() => handleCopyAddress(selectedClient)} className="admin-locacoes-copy-btn">
                  {addressCopied ? 'Copiado ✓' : '📋 Copiar Endereço'}
                </button>
              </div>
            </div>

            <div className="admin-locacoes-bookings-header">
              <span className="admin-card-title admin-locacoes-bookings-title">Locações</span>
              <button type="button" onClick={() => setShowBookingForm(true)} className="admin-locacoes-add-booking-btn">
                + Nova Locação
              </button>
            </div>

            <div className="admin-locacoes-bookings-list">
              {(selectedClient.bookings || []).length === 0 && (
                <p className="admin-page-subtitle admin-locacoes-bookings-empty">Nenhuma locação registrada ainda.</p>
              )}
              {(selectedClient.bookings || []).map((b) => {
                const isOpen = selectedBookingId === b.id;
                return (
                  <div key={b.id} className="admin-locacoes-booking-card">
                    <button
                      type="button"
                      onClick={() => setSelectedBookingId((id) => (id === b.id ? null : b.id))}
                      className="admin-locacoes-booking-row"
                    >
                      <div>
                        <div className="admin-locacoes-booking-date">{formatDataBr(b.rental_date)}</div>
                        <div className={`admin-document-status ${b.signature ? 'admin-document-status-signed' : ''}`}>
                          {b.signature
                            ? 'Assinado ✓'
                            : !b.landlord_signed_at
                              ? 'Aguardando assinatura da locadora'
                              : b.contract_sent
                                ? 'Aguardando assinatura'
                                : 'Contrato não enviado'}
                        </div>
                      </div>
                      <div className="admin-locacoes-booking-value">{formatValorBr(b.rental_value)}</div>
                    </button>

                    {isOpen && (
                      <div className="admin-locacoes-booking-detail">
                        <div className="field-row admin-locacoes-fields">
                          <div>
                            <label className="admin-small-label">Data da Locação</label>
                            <input
                              type="date"
                              value={b.rental_date || ''}
                              onChange={handleBookingFieldChange(b.id, 'rental_date')}
                              onBlur={handleBookingFieldBlur(b.id, 'rental_date')}
                              className="field-input"
                            />
                          </div>
                          <div>
                            <label className="admin-small-label">Valor (R$)</label>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={b.rental_value ?? ''}
                              onChange={handleBookingFieldChange(b.id, 'rental_value')}
                              onBlur={handleBookingFieldBlur(b.id, 'rental_value')}
                              className="field-input"
                            />
                          </div>
                        </div>

                        <div className="field-wrap admin-locacoes-fields">
                          <label className="admin-small-label">Período</label>
                          <select
                            value={b.rental_period_hours ?? ''}
                            onChange={(e) => {
                              handleBookingFieldChange(b.id, 'rental_period_hours')(e);
                              handleBookingFieldBlur(b.id, 'rental_period_hours')(e);
                            }}
                            className="field-input"
                          >
                            <option value="">Selecione...</option>
                            {PERIODO_OPTIONS.map((p) => (
                              <option key={p.value} value={p.value}>{p.label}</option>
                            ))}
                          </select>
                        </div>

                        {b.signature ? (
                          <button
                            type="button"
                            onClick={() => handleDownloadContract(selectedClient, b)}
                            disabled={downloadingId === b.id}
                            className="admin-locacoes-primary-btn"
                          >
                            {downloadingId === b.id ? 'Gerando link…' : '⬇ Download do Contrato'}
                          </button>
                        ) : !b.landlord_signed_at ? (
                          <button
                            type="button"
                            onClick={() => handleSignAsLandlord(selectedClient, b)}
                            disabled={landlordSigning === b.id}
                            className="admin-locacoes-primary-btn"
                          >
                            {landlordSigning === b.id ? 'Assinando…' : 'Revisar e Assinar como Locadora'}
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleSendContract(selectedClient, b)}
                            disabled={contractSending === b.id}
                            className="admin-locacoes-primary-btn"
                          >
                            {contractSending === b.id ? 'Enviando…' : b.contract_sent ? 'Reenviar Contrato' : 'Enviar Contrato'}
                          </button>
                        )}
                        {contractError[b.id] && <p className="admin-mkt-wpp-error">{contractError[b.id]}</p>}

                        {b.signature && (
                          <>
                            <p className="admin-small-label" style={{ marginTop: '10px' }}>
                              ID da assinatura: {b.signature.signature_id || '—'}
                            </p>
                            <button type="button" onClick={() => handleToggleAuditLog(b)} className="admin-locacoes-copy-btn">
                              {auditBookingId === b.id ? 'Ocultar trilha de auditoria' : '🔍 Ver trilha de auditoria'}
                            </button>
                            {auditBookingId === b.id && (
                              <div className="admin-locacoes-audit-log">
                                {auditLoading && <p className="admin-page-subtitle">Carregando...</p>}
                                {!auditLoading && auditEvents.length === 0 && (
                                  <p className="admin-page-subtitle">Nenhum evento registrado.</p>
                                )}
                                {!auditLoading &&
                                  auditEvents.map((ev) => (
                                    <div key={ev.id} className="admin-locacoes-audit-row">
                                      <span>{AUDIT_EVENT_LABELS[ev.event_type] || ev.event_type}</span>
                                      <span>{new Date(ev.occurred_at).toLocaleString('pt-BR')}</span>
                                    </div>
                                  ))}
                              </div>
                            )}
                          </>
                        )}

                        <button type="button" onClick={() => handleDeleteBooking(selectedClient, b)} className="admin-delete-btn admin-locacoes-booking-delete">
                          Excluir Locação
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {showBookingForm && selectedClient && (
        <div className="admin-agenda-modal-overlay admin-locacoes-booking-modal-overlay">
          <form className="admin-agenda-modal admin-agenda-modal-sheet" onSubmit={handleSubmitBooking}>
            <div className="admin-agenda-modal-header">
              <h2 className="admin-agenda-modal-title">Nova Locação — {selectedClient.name}</h2>
              <button type="button" onClick={() => setShowBookingForm(false)} className="admin-agenda-modal-close" aria-label="Fechar">
                ×
              </button>
            </div>

            <div className="admin-agenda-modal-body">
              <div className="field-row">
                <div>
                  <label className="field-label" htmlFor="book-data">Data da Locação</label>
                  <input id="book-data" type="date" value={bookingForm.dataLocacao} onChange={setBookingField('dataLocacao')} className="field-input" />
                </div>
                <div>
                  <label className="field-label" htmlFor="book-valor">Valor (R$)</label>
                  <input id="book-valor" type="number" step="0.01" min="0" placeholder="0,00" value={bookingForm.valor} onChange={setBookingField('valor')} className="field-input" />
                </div>
              </div>

              <div className="field-wrap-last">
                <label className="field-label" htmlFor="book-periodo">Período</label>
                <select id="book-periodo" value={bookingForm.periodoHoras} onChange={setBookingField('periodoHoras')} className="field-input">
                  <option value="">Selecione...</option>
                  {PERIODO_OPTIONS.map((p) => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              </div>

              {bookingFormError && <div className="admin-login-error">{bookingFormError}</div>}
            </div>

            <div className="admin-agenda-modal-actions">
              <button type="button" onClick={() => setShowBookingForm(false)} className="admin-agenda-modal-cancel">
                CANCELAR
              </button>
              <button type="submit" disabled={savingBooking} className="admin-open-client-btn admin-agenda-modal-save">
                {savingBooking ? 'SALVANDO...' : 'CADASTRAR LOCAÇÃO'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default LocacoesView;
