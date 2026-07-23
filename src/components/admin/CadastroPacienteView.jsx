import React, { useState } from 'react';
import { createPatient } from '../../lib/patients';

const initialForm = { nome: '', nascimento: '', telefone: '' };

const CadastroPacienteView = ({ onPatientCreated }) => {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleField = (key) => (e) => {
    const { value } = e.target;
    setForm((f) => ({ ...f, [key]: value }));
    setSuccess(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nome.trim()) {
      setError('Informe o nome do paciente.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await createPatient(form);
      setForm(initialForm);
      setSuccess(true);
      if (onPatientCreated) onPatientCreated();
    } catch (err) {
      console.error('Erro ao cadastrar paciente:', err);
      setError(`Não foi possível cadastrar o paciente: ${err.message || 'erro desconhecido'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="admin-page-header">
        <span className="section-eyebrow">Área Clínica</span>
        <h1 className="admin-page-title">Cadastro Paciente</h1>
      </div>

      <form className="admin-card admin-cadastro-form" onSubmit={handleSubmit}>
        <div className="field-wrap">
          <label className="field-label" htmlFor="cadastro-nome">Nome Completo</label>
          <input
            id="cadastro-nome"
            type="text"
            placeholder="Digite o nome do paciente..."
            value={form.nome}
            onChange={handleField('nome')}
            className="field-input"
          />
        </div>

        <div className="admin-cadastro-row">
          <div className="field-wrap">
            <label className="field-label" htmlFor="cadastro-nascimento">Data de Nascimento</label>
            <input
              id="cadastro-nascimento"
              type="date"
              value={form.nascimento}
              onChange={handleField('nascimento')}
              className="field-input"
            />
          </div>
          <div className="field-wrap">
            <label className="field-label" htmlFor="cadastro-telefone">Telefone</label>
            <input
              id="cadastro-telefone"
              type="text"
              placeholder="(00) 00000-0000"
              value={form.telefone}
              onChange={handleField('telefone')}
              className="field-input"
            />
          </div>
        </div>

        {error && <div className="admin-login-error">{error}</div>}
        {success && <div className="admin-cadastro-status">Paciente cadastrado ✓</div>}

        <button
          type="submit"
          disabled={loading}
          className="admin-open-client-btn admin-cadastro-send-btn"
        >
          {loading ? 'CADASTRANDO...' : 'CADASTRAR PACIENTE'}
        </button>
      </form>
    </div>
  );
};

export default CadastroPacienteView;
