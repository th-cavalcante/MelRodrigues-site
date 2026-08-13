import React, { useEffect, useState } from 'react';
import {
  listRentalClients,
  createRentalClient,
  updateRentalClient,
  markRentalContractSent,
  deleteRentalClient,
} from '../../lib/rentals';
import { sendRentalContract, sendRentalAddress } from '../../lib/evolution';
import { buildRentalContractBody, formatRentalEndereco } from './rentalContract';
import { downloadDocPdf } from '../cliente/docPdf';
import { IconChevronRight } from './Icons';

const emptyForm = {
  nome: '', nascimento: '', cpf: '', rua: '', bairro: '', cidade: '', cep: '', email: '', telefone: '',
  dataLocacao: '', valor: '', horaInicio: '', horaFim: '',
};

const formatSignedDate = (iso) => (iso ? new Date(iso).toLocaleDateString('pt-BR') : null);

const formatDataBr = (iso) => {
  if (!iso) return '—';
  const [y, m, d] = iso.split('-');
  return y ? `${d}/${m}/${y}` : '—';
};

const LocacoesView = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [contractSending, setContractSending] = useState(null);
  const [contractError, setContractError] = useState({});
  const [addressSending, setAddressSending] = useState(null);
  const [addressSent, setAddressSent] = useState({});
  const [addressError, setAddressError] = useState({});

  useEffect(() => {
    listRentalClients()
      .then(setClients)
      .catch((err) => console.error('Erro ao carregar clientes de locação:', err))
      .finally(() => setLoading(false));
  }, []);

  const setField = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nome.trim() || !form.telefone.trim()) {
      setFormError('Preencha ao menos o nome e o WhatsApp do cliente.');
      return;
    }
    setFormError('');
    setSaving(true);
    try {
      const created = await createRentalClient(form);
      setClients((cs) => [created, ...cs]);
      setForm(emptyForm);
    } catch (err) {
      console.error('Erro ao cadastrar cliente de locação:', err);
      setFormError(`Não foi possível salvar o cadastro: ${err.message || 'erro desconhecido'}`);
    } finally {
      setSaving(false);
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

  const handleSendContract = async (client) => {
    setContractError((m) => ({ ...m, [client.id]: '' }));
    setContractSending(client.id);
    try {
      const link = `${window.location.origin}/cliente/locacao?rental=${client.id}`;
      await sendRentalContract(client.id, link);
      await markRentalContractSent(client.id);
      setClients((cs) => cs.map((c) => (c.id === client.id ? { ...c, contract_sent: true } : c)));
    } catch (err) {
      console.error('Erro ao enviar contrato:', err);
      setContractError((m) => ({ ...m, [client.id]: err.message || 'Não foi possível enviar o contrato.' }));
    } finally {
      setContractSending(null);
    }
  };

  const handleDownloadContract = (client) => {
    downloadDocPdf({
      title: 'Contrato de Locação — Hakon 4D',
      body: buildRentalContractBody(client),
      signatureDataUrl: client.signature?.signature_data_url || null,
      patientName: client.signature?.client_name_snapshot || client.name,
      dateLabel: formatSignedDate(client.signature?.signed_at),
    });
  };

  const handleSendAddress = async (client) => {
    setAddressError((m) => ({ ...m, [client.id]: '' }));
    setAddressSending(client.id);
    try {
      await sendRentalAddress(client.id);
      setAddressSent((m) => ({ ...m, [client.id]: true }));
      setTimeout(() => setAddressSent((m) => ({ ...m, [client.id]: false })), 2500);
    } catch (err) {
      console.error('Erro ao enviar endereço:', err);
      setAddressError((m) => ({ ...m, [client.id]: err.message || 'Não foi possível enviar o endereço.' }));
    } finally {
      setAddressSending(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este cliente de locação? Essa ação não pode ser desfeita.')) return;
    try {
      await deleteRentalClient(id);
      setClients((cs) => cs.filter((c) => c.id !== id));
      setSelectedId((sid) => (sid === id ? null : sid));
    } catch (err) {
      console.error('Erro ao excluir cliente de locação:', err);
    }
  };

  const selected = clients.find((c) => c.id === selectedId) || null;

  return (
    <div>
      <div className="admin-page-header">
        <span className="section-eyebrow">Hakon 4D</span>
        <h1 className="admin-page-title">Locações</h1>
        <p className="admin-page-subtitle">Cadastro e gestão dos clientes que alugam o equipamento Hakon 4D.</p>
      </div>

      <div className="admin-card">
        <div className="admin-card-title">Novo Cadastro</div>
        <form onSubmit={handleSubmit}>
          <div className="field-row">
            <div>
              <label className="field-label" htmlFor="loc-nome">Nome Completo</label>
              <input id="loc-nome" type="text" placeholder="Digite o nome..." value={form.nome} onChange={setField('nome')} className="field-input" />
            </div>
            <div>
              <label className="field-label" htmlFor="loc-nascimento">Data de Nascimento</label>
              <input id="loc-nascimento" type="date" value={form.nascimento} onChange={setField('nascimento')} className="field-input" />
            </div>
          </div>

          <div className="field-row">
            <div>
              <label className="field-label" htmlFor="loc-cpf">CPF</label>
              <input id="loc-cpf" type="text" placeholder="000.000.000-00" value={form.cpf} onChange={setField('cpf')} className="field-input" />
            </div>
            <div>
              <label className="field-label" htmlFor="loc-telefone">WhatsApp</label>
              <input id="loc-telefone" type="text" placeholder="(13) 90000-0000" value={form.telefone} onChange={setField('telefone')} className="field-input" />
            </div>
          </div>

          <div className="field-wrap">
            <label className="field-label" htmlFor="loc-email">E-mail</label>
            <input id="loc-email" type="email" placeholder="cliente@email.com" value={form.email} onChange={setField('email')} className="field-input" />
          </div>

          <div className="field-wrap">
            <label className="field-label" htmlFor="loc-rua">Rua e nº</label>
            <input id="loc-rua" type="text" placeholder="Digite o nome da rua e nº" value={form.rua} onChange={setField('rua')} className="field-input" />
          </div>

          <div className="field-row">
            <div>
              <label className="field-label" htmlFor="loc-bairro">Bairro</label>
              <input id="loc-bairro" type="text" placeholder="Nome do bairro" value={form.bairro} onChange={setField('bairro')} className="field-input" />
            </div>
            <div>
              <label className="field-label" htmlFor="loc-cidade">Cidade</label>
              <input id="loc-cidade" type="text" placeholder="Nome da cidade" value={form.cidade} onChange={setField('cidade')} className="field-input" />
            </div>
          </div>

          <div className="field-wrap">
            <label className="field-label" htmlFor="loc-cep">CEP</label>
            <input id="loc-cep" type="text" placeholder="00000-000" value={form.cep} onChange={setField('cep')} className="field-input" />
          </div>

          <div className="field-row">
            <div>
              <label className="field-label" htmlFor="loc-data">Data da Locação</label>
              <input id="loc-data" type="date" value={form.dataLocacao} onChange={setField('dataLocacao')} className="field-input" />
            </div>
            <div>
              <label className="field-label" htmlFor="loc-valor">Valor (R$)</label>
              <input id="loc-valor" type="number" step="0.01" min="0" placeholder="0,00" value={form.valor} onChange={setField('valor')} className="field-input" />
            </div>
          </div>

          <div className="field-row field-wrap-last">
            <div>
              <label className="field-label" htmlFor="loc-hora-inicio">Horário de Início</label>
              <input id="loc-hora-inicio" type="time" value={form.horaInicio} onChange={setField('horaInicio')} className="field-input" />
            </div>
            <div>
              <label className="field-label" htmlFor="loc-hora-fim">Horário de Término</label>
              <input id="loc-hora-fim" type="time" value={form.horaFim} onChange={setField('horaFim')} className="field-input" />
            </div>
          </div>

          {formError && <div className="admin-login-error">{formError}</div>}

          <button type="submit" disabled={saving} className="admin-open-client-btn admin-locacoes-save-btn">
            {saving ? 'Salvando...' : 'Cadastrar Locação'}
          </button>
        </form>
      </div>

      <div className="admin-card">
        <div className="admin-card-title">Clientes em Locação</div>

        {loading && <p className="admin-page-subtitle">Carregando...</p>}
        {!loading && clients.length === 0 && <p className="admin-page-subtitle">Nenhuma locação cadastrada ainda.</p>}

        <div className="admin-locacoes-list">
          {clients.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setSelectedId(c.id)}
              className="admin-locacoes-row"
            >
              <div className="admin-client-initial admin-locacoes-row-avatar">{(c.name || '?').charAt(0)}</div>
              <div className="admin-locacoes-row-info">
                <div className="admin-locacoes-row-name">{c.name || 'Sem nome'}</div>
                <div className="admin-locacoes-row-date">{formatDataBr(c.rental_date)}</div>
              </div>
              <IconChevronRight size={16} />
            </button>
          ))}
        </div>
      </div>

      {selected && (
        <div className="admin-locacoes-drawer-overlay" onClick={() => setSelectedId(null)}>
          <div className="admin-locacoes-drawer" onClick={(e) => e.stopPropagation()}>
            <button type="button" onClick={() => setSelectedId(null)} className="admin-locacoes-drawer-back" aria-label="Fechar">
              ←
            </button>

            <div className="admin-locacoes-drawer-header">
              <div className="admin-client-initial admin-locacoes-drawer-avatar">{(selected.name || '?').charAt(0)}</div>
              <h2 className="admin-locacoes-drawer-name">{selected.name || 'Sem nome'}</h2>
            </div>

            <div className="admin-locacoes-drawer-card">
              <div className="field-row">
                <div>
                  <label className="admin-small-label">Data da Locação</label>
                  <input
                    type="date"
                    value={selected.rental_date || ''}
                    onChange={handleFieldChange(selected.id, 'rental_date')}
                    onBlur={handleFieldBlur(selected.id, 'rental_date')}
                    className="field-input"
                  />
                </div>
                <div>
                  <label className="admin-small-label">Valor (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={selected.rental_value ?? ''}
                    onChange={handleFieldChange(selected.id, 'rental_value')}
                    onBlur={handleFieldBlur(selected.id, 'rental_value')}
                    className="field-input"
                  />
                </div>
              </div>

              <div className="field-row admin-locacoes-drawer-times">
                <div>
                  <label className="admin-small-label">Horário de Início</label>
                  <input
                    type="time"
                    value={selected.rental_start_time ? selected.rental_start_time.slice(0, 5) : ''}
                    onChange={handleFieldChange(selected.id, 'rental_start_time')}
                    onBlur={handleFieldBlur(selected.id, 'rental_start_time')}
                    className="field-input"
                  />
                </div>
                <div>
                  <label className="admin-small-label">Horário de Término</label>
                  <input
                    type="time"
                    value={selected.rental_end_time ? selected.rental_end_time.slice(0, 5) : ''}
                    onChange={handleFieldChange(selected.id, 'rental_end_time')}
                    onBlur={handleFieldBlur(selected.id, 'rental_end_time')}
                    className="field-input"
                  />
                </div>
              </div>

              <div className="admin-locacoes-drawer-field">
                <span className="admin-small-label">CPF</span>
                <span>{selected.cpf || '—'}</span>
              </div>
              <div className="admin-locacoes-drawer-field">
                <span className="admin-small-label">E-mail</span>
                <span>{selected.email || '—'}</span>
              </div>
              <div className="admin-locacoes-drawer-field">
                <span className="admin-small-label">Endereço</span>
                <span>{formatRentalEndereco(selected) || '—'}</span>
              </div>
            </div>

            <div className="admin-locacoes-drawer-status">
              <span className="admin-small-label">Contrato</span>
              <span className={`admin-document-status ${selected.signature ? 'admin-document-status-signed' : ''}`}>
                {selected.signature
                  ? `Assinado por ${selected.signature.client_name_snapshot || selected.name} em ${formatSignedDate(selected.signature.signed_at)} ✓`
                  : selected.contract_sent
                    ? 'Link enviado, aguardando assinatura'
                    : 'Não enviado'}
              </span>
            </div>

            <div className="admin-locacoes-drawer-actions">
              {selected.signature ? (
                <button type="button" onClick={() => handleDownloadContract(selected)} className="admin-open-client-btn admin-locacoes-drawer-btn">
                  ⬇ Download do Contrato
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleSendContract(selected)}
                  disabled={contractSending === selected.id}
                  className="admin-open-client-btn admin-locacoes-drawer-btn"
                >
                  {contractSending === selected.id ? 'Enviando…' : selected.contract_sent ? 'Reenviar Contrato' : 'Enviar Contrato'}
                </button>
              )}
              {contractError[selected.id] && <p className="admin-mkt-wpp-error">{contractError[selected.id]}</p>}

              <button
                type="button"
                onClick={() => handleSendAddress(selected)}
                disabled={addressSending === selected.id}
                className="admin-locacoes-whatsapp-btn"
              >
                {addressSending === selected.id ? 'Enviando…' : addressSent[selected.id] ? 'Enviado ✓' : '💬 Enviar Endereço no WhatsApp'}
              </button>
              {addressError[selected.id] && <p className="admin-mkt-wpp-error">{addressError[selected.id]}</p>}

              <button type="button" onClick={() => handleDelete(selected.id)} className="admin-delete-btn admin-locacoes-drawer-delete">
                Excluir Cliente
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocacoesView;
