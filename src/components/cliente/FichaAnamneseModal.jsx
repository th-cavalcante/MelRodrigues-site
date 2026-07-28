import React, { useState } from 'react';
import { submitAnamnese } from '../../lib/patients';
import { ANAMNESE_FOTOTIPOS, ANAMNESE_QUESTIONS } from '../../lib/agendaConstants';
import '../../styles/FichaAnamneseModal.css';

const initialForm = {
  nome: '',
  nascimento: '',
  cpf: '',
  telefone: '',
  sexo: '',
  rua: '',
  bairro: '',
  cidade: '',
  cep: '',
  obs: '',
};

const fototiposData = ANAMNESE_FOTOTIPOS;
const questions = ANAMNESE_QUESTIONS;

const FichaAnamneseModal = ({ patientId, initialData, onClose, onSaved }) => {
  const [form, setForm] = useState({ ...initialForm, ...(initialData || {}) });
  const [fototipo, setFototipo] = useState((initialData && initialData.fototipo) || null);
  const [answers, setAnswers] = useState((initialData && initialData.answers) || {});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState('form');

  const handleField = (key) => (e) => {
    const { value } = e.target;
    setForm((f) => ({ ...f, [key]: value }));
  };

  const handleAnswer = (num, value) => {
    setAnswers((a) => ({ ...a, [num]: value }));
  };

  const handleSave = async () => {
    if (!patientId) {
      setError('Link inválido: não foi possível identificar o paciente.');
      return;
    }
    const data = { ...form, fototipo, answers };
    setSaving(true);
    setError('');
    try {
      await submitAnamnese(patientId, data);
      onSaved(data);
      setStep('welcome');
      setTimeout(() => onClose(), 2500);
    } catch (err) {
      console.error('Erro ao salvar ficha:', err);
      setError(`Não foi possível salvar a ficha: ${err.message || 'erro desconhecido'}`);
    } finally {
      setSaving(false);
    }
  };

  if (step === 'welcome') {
    return (
      <div className="ficha-modal-overlay">
        <div className="ficha-modal ficha-modal-narrow ficha-welcome-step">
          <div className="ficha-welcome-icon">🎉</div>
          <h2 className="ficha-modal-title">Seja bem-vindo(a) à MR Laser!</h2>
          <p className="ficha-modal-subtitle">Seu cadastro foi concluído com sucesso.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="ficha-modal-overlay">
      <div className="ficha-modal">
        <button type="button" onClick={onClose} className="ficha-modal-close" aria-label="Fechar">
          ×
        </button>

        <div className="ficha-modal-header">
          <span className="section-eyebrow">Antes do seu atendimento</span>
          <h2 className="ficha-modal-title">Ficha de Anamnese</h2>
          <p className="ficha-modal-subtitle">
            Preencha todos os campos abaixo com atenção. Essas informações
            serão usadas para gerar seu contrato automaticamente.
          </p>
        </div>

        <div className="ficha-modal-body">
          <div className="field-wrap">
            <label className="field-label" htmlFor="ficha-nome">Nome Completo</label>
            <input
              id="ficha-nome"
              type="text"
              placeholder="Digite seu nome..."
              value={form.nome}
              onChange={handleField('nome')}
              className="field-input"
            />
          </div>

          <div className="field-wrap">
            <label className="field-label" htmlFor="ficha-nascimento">Data de Nascimento</label>
            <input
              id="ficha-nascimento"
              type="date"
              value={form.nascimento}
              onChange={handleField('nascimento')}
              className="field-input"
            />
          </div>

          <div className="field-row">
            <div>
              <label className="field-label" htmlFor="ficha-cpf">CPF</label>
              <input
                id="ficha-cpf"
                type="text"
                placeholder="000.000.000-00"
                value={form.cpf}
                onChange={handleField('cpf')}
                className="field-input"
              />
            </div>
            <div>
              <label className="field-label" htmlFor="ficha-telefone">Telefone</label>
              <input
                id="ficha-telefone"
                type="text"
                placeholder="(00) 00000-0000"
                value={form.telefone}
                onChange={handleField('telefone')}
                className="field-input"
              />
            </div>
          </div>

          <div className="field-wrap">
            <span className="field-label">Sexo</span>
            <div className="radio-group">
              <label className="radio-label">
                <input
                  type="radio"
                  name="sexo"
                  value="Masculino"
                  checked={form.sexo === 'Masculino'}
                  onChange={handleField('sexo')}
                  className="radio-input"
                />
                Masculino
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  name="sexo"
                  value="Feminino"
                  checked={form.sexo === 'Feminino'}
                  onChange={handleField('sexo')}
                  className="radio-input"
                />
                Feminino
              </label>
            </div>
          </div>

          <div className="field-wrap">
            <label className="field-label" htmlFor="ficha-rua">Rua e nº</label>
            <input
              id="ficha-rua"
              type="text"
              placeholder="Digite o nome da rua e nº"
              value={form.rua}
              onChange={handleField('rua')}
              className="field-input"
            />
          </div>

          <div className="field-row">
            <div>
              <label className="field-label" htmlFor="ficha-bairro">Bairro</label>
              <input
                id="ficha-bairro"
                type="text"
                placeholder="Nome do seu bairro"
                value={form.bairro}
                onChange={handleField('bairro')}
                className="field-input"
              />
            </div>
            <div>
              <label className="field-label" htmlFor="ficha-cidade">Cidade</label>
              <input
                id="ficha-cidade"
                type="text"
                placeholder="Nome da sua cidade"
                value={form.cidade}
                onChange={handleField('cidade')}
                className="field-input"
              />
            </div>
          </div>

          <div className="field-wrap field-wrap-last">
            <label className="field-label" htmlFor="ficha-cep">CEP</label>
            <input
              id="ficha-cep"
              type="text"
              placeholder="00000-000"
              value={form.cep}
              onChange={handleField('cep')}
              className="field-input"
            />
          </div>

          <div className="ficha-modal-clinical-header">
            <h3>Questionário Clínico</h3>
          </div>

          <div className="question-block">
            <div className="question-label">
              <span className="question-num">(1)</span>&nbsp; Qual dessas
              condições de exposição solar mais se assemelha ao seu tom de
              pele? Selecione a imagem
            </div>
            <div className="fototipo-grid">
              {fototiposData.map((f) => (
                <button
                  key={f.num}
                  type="button"
                  onClick={() => setFototipo(f.num)}
                  className={`fototipo-card ${fototipo === f.num ? 'selected' : ''}`}
                >
                  <div className="fototipo-kicker">Pigmentação {f.num}</div>
                  <div className="fototipo-swatch" style={{ background: f.tone }} />
                  <div className="fototipo-desc">{f.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {questions.map((q, i) => (
            <div
              key={q.num}
              className={`question-block ${i < questions.length - 1 ? 'has-border' : ''}`}
            >
              <div className="question-label">
                <span className="question-num">({q.num})</span>&nbsp; {q.text}
              </div>
              <div className="radio-group">
                <label className="radio-label">
                  <input
                    type="radio"
                    name={`q${q.num}`}
                    value="Não"
                    checked={answers[q.num] === 'Não'}
                    onChange={() => handleAnswer(q.num, 'Não')}
                    className="radio-input"
                  />
                  Não
                </label>
                <label className="radio-label">
                  <input
                    type="radio"
                    name={`q${q.num}`}
                    value="Sim"
                    checked={answers[q.num] === 'Sim'}
                    onChange={() => handleAnswer(q.num, 'Sim')}
                    className="radio-input"
                  />
                  Sim
                </label>
              </div>
            </div>
          ))}

          <div className="field-wrap-last">
            <label className="field-label" htmlFor="ficha-obs">Deseja mais alguma observação?</label>
            <textarea
              id="ficha-obs"
              rows="4"
              value={form.obs}
              onChange={handleField('obs')}
              className="field-input field-textarea"
            />
          </div>

          {error && <div className="admin-login-error">{error}</div>}

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="save-button"
          >
            {saving ? 'SALVANDO...' : 'SALVAR INFORMAÇÕES'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FichaAnamneseModal;
