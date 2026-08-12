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

const emptyForm = {
  nome: '', nascimento: '', cpf: '', rua: '', bairro: '', cidade: '', cep: '', email: '', telefone: '',
};

const LocacoesView = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
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
      await sendRentalContract(client.id);
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
      signatureDataUrl: null,
      patientName: client.name,
      dateLabel: client.contract_sent_at ? new Date(client.contract_sent_at).toLocaleDateString('pt-BR') : null,
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
    } catch (err) {
      console.error('Erro ao excluir cliente de locação:', err);
    }
  };

  return (
    <div>
      <div className="admin-page-header">
        <span className="section-eyebrow">Área Clínica</span>
        <h1 className="admin-page-title">Locações</h1>
        <p className="admin-page-subtitle">Cadastro e gestão dos clientes que alugam o equipamento Hakon 4D.</p>
      </div>

      <div className="admin-card">
        <div className="admin-card-title">Cadastrar Cliente</div>
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

          <div className="field-wrap-last">
            <label className="field-label" htmlFor="loc-cep">CEP</label>
            <input id="loc-cep" type="text" placeholder="00000-000" value={form.cep} onChange={setField('cep')} className="field-input" />
          </div>

          {formError && <div className="admin-login-error">{formError}</div>}

          <button type="submit" disabled={saving} className="admin-open-client-btn admin-locacoes-save-btn">
            {saving ? 'Salvando...' : 'Salvar Cadastro'}
          </button>
        </form>
      </div>

      <div className="admin-card">
        <div className="admin-card-title">Clientes em Locação</div>

        {loading && <p className="admin-page-subtitle">Carregando...</p>}
        {!loading && clients.length === 0 && <p className="admin-page-subtitle">Nenhum cliente cadastrado ainda.</p>}

        <div className="admin-locacoes-list">
          {clients.map((c) => {
            const endereco = formatRentalEndereco(c);
            return (
              <div key={c.id} className="admin-locacoes-card">
                <div className="admin-locacoes-card-header">
                  <div className="admin-client-name-cell">
                    <div className="admin-client-initial">{(c.name || '?').charAt(0)}</div>
                    <span>{c.name || 'Sem nome'}</span>
                  </div>
                  <button type="button" onClick={() => handleDelete(c.id)} className="admin-delete-btn">
                    Excluir
                  </button>
                </div>

                <div className="field-row admin-locacoes-fields">
                  <div>
                    <label className="admin-small-label">Data da Locação</label>
                    <input
                      type="date"
                      value={c.rental_date || ''}
                      onChange={handleFieldChange(c.id, 'rental_date')}
                      onBlur={handleFieldBlur(c.id, 'rental_date')}
                      className="field-input"
                    />
                  </div>
                  <div>
                    <label className="admin-small-label">Valor da Locação (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0,00"
                      value={c.rental_value ?? ''}
                      onChange={handleFieldChange(c.id, 'rental_value')}
                      onBlur={handleFieldBlur(c.id, 'rental_value')}
                      className="field-input"
                    />
                  </div>
                </div>

                <div className="admin-locacoes-contract-row">
                  <div className="admin-locacoes-contract-info">
                    <span className="admin-small-label">Contrato</span>
                    <span className={`admin-document-status ${c.contract_sent ? 'admin-document-status-signed' : ''}`}>
                      {c.contract_sent ? 'Enviado ✓' : 'Não enviado'}
                    </span>
                  </div>
                  {c.contract_sent ? (
                    <button type="button" onClick={() => handleDownloadContract(c)} className="admin-open-client-btn">
                      Download
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSendContract(c)}
                      disabled={contractSending === c.id}
                      className="admin-open-client-btn"
                    >
                      {contractSending === c.id ? 'Enviando…' : 'Enviar Contrato'}
                    </button>
                  )}
                </div>
                {contractError[c.id] && <p className="admin-mkt-wpp-error">{contractError[c.id]}</p>}

                <div className="admin-locacoes-address-row">
                  <div className="admin-locacoes-address-text">
                    <span className="admin-small-label">Endereço</span>
                    <span>{endereco || '—'}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSendAddress(c)}
                    disabled={addressSending === c.id}
                    className="admin-open-client-btn"
                  >
                    {addressSending === c.id ? 'Enviando…' : addressSent[c.id] ? 'Enviado ✓' : '💬 Enviar no WhatsApp'}
                  </button>
                </div>
                {addressError[c.id] && <p className="admin-mkt-wpp-error">{addressError[c.id]}</p>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default LocacoesView;
