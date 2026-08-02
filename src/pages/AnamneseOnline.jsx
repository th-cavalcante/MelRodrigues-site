import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPublicPatient } from '../lib/bookings';
import { submitAnamnese } from '../lib/patients';
import { ANAMNESE_FOTOTIPOS, ANAMNESE_QUESTIONS } from '../lib/agendaConstants';
import { IconCheckCircle, IconAlertCircle } from '../components/admin/Icons';
import '../styles/AgendaOnline.css';
import '../styles/FichaAnamneseModal.css';

const initialFichaForm = {
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

/**
 * Cadastro público só da Ficha de Anamnese, sem passar por serviço/data/pagamento —
 * pra quem só quer saber se pode fazer o tratamento antes de agendar. Os mesmos
 * dados coletados aqui já cadastram o paciente no sistema pra um agendamento
 * futuro (mesma RPC create_public_patient usada pela Agenda Online).
 */
const AnamneseOnline = () => {
  const [submitted, setSubmitted] = useState(false);
  const [fichaForm, setFichaForm] = useState(initialFichaForm);
  const [fichaFototipo, setFichaFototipo] = useState(null);
  const [fichaAnswers, setFichaAnswers] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleFichaField = (key) => (e) => {
    const { value } = e.target;
    setFichaForm((f) => ({ ...f, [key]: value }));
  };

  const handleFichaAnswer = (num, value) => {
    setFichaAnswers((a) => ({ ...a, [num]: value }));
  };

  const handleSubmit = async () => {
    setError('');
    setSaving(true);
    try {
      const patientId = await createPublicPatient({ name: fichaForm.nome.trim(), phone: fichaForm.telefone.trim() });
      await submitAnamnese(patientId, { ...fichaForm, fototipo: fichaFototipo, answers: fichaAnswers });
      setSubmitted(true);
    } catch (err) {
      console.error('Erro ao salvar ficha:', err);
      setError(`Não foi possível salvar a ficha: ${err.message || 'erro desconhecido'}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="cliente-page agenda-online-page">
      <div className="agenda-online-brand">
        <img src="/images/logo.png" alt="MR Laser" className="agenda-online-brand-logo" />
        <span className="agenda-online-brand-text">
          <span className="agenda-online-brand-name">MR Laser</span>
          <span className="agenda-online-brand-tag"> · ficha de anamnese</span>
        </span>
      </div>

      <div className="agenda-online-content">
        <div className="agenda-online-card">
          {!submitted ? (
            <div className="agenda-online-step">
              <div className="agenda-online-step-header">
                <span className="section-eyebrow">Antes de agendar</span>
                <h1 className="agenda-online-step-title">Ficha de Anamnese</h1>
                <p className="agenda-online-step-subtitle">
                  Preencha seus dados e o questionário clínico pra gente avaliar se o
                  tratamento é indicado pra você. Assim que enviar, seu cadastro já fica
                  pronto pra agendarmos sua avaliação.
                </p>
              </div>

              <div className="ficha-modal-body">
                <div className="field-wrap">
                  <label className="field-label" htmlFor="an-ficha-nome">Nome Completo</label>
                  <input
                    id="an-ficha-nome"
                    type="text"
                    placeholder="Digite seu nome..."
                    value={fichaForm.nome}
                    onChange={handleFichaField('nome')}
                    className="field-input"
                  />
                </div>

                <div className="field-wrap">
                  <label className="field-label" htmlFor="an-ficha-nascimento">Data de Nascimento</label>
                  <input
                    id="an-ficha-nascimento"
                    type="date"
                    value={fichaForm.nascimento}
                    onChange={handleFichaField('nascimento')}
                    className="field-input"
                  />
                </div>

                <div className="field-row">
                  <div>
                    <label className="field-label" htmlFor="an-ficha-cpf">CPF</label>
                    <input
                      id="an-ficha-cpf"
                      type="text"
                      placeholder="000.000.000-00"
                      value={fichaForm.cpf}
                      onChange={handleFichaField('cpf')}
                      className="field-input"
                    />
                  </div>
                  <div>
                    <label className="field-label" htmlFor="an-ficha-telefone">Telefone</label>
                    <input
                      id="an-ficha-telefone"
                      type="text"
                      placeholder="(00) 00000-0000"
                      value={fichaForm.telefone}
                      onChange={handleFichaField('telefone')}
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
                        name="an-sexo"
                        value="Masculino"
                        checked={fichaForm.sexo === 'Masculino'}
                        onChange={handleFichaField('sexo')}
                        className="radio-input"
                      />
                      Masculino
                    </label>
                    <label className="radio-label">
                      <input
                        type="radio"
                        name="an-sexo"
                        value="Feminino"
                        checked={fichaForm.sexo === 'Feminino'}
                        onChange={handleFichaField('sexo')}
                        className="radio-input"
                      />
                      Feminino
                    </label>
                  </div>
                </div>

                <div className="field-wrap">
                  <label className="field-label" htmlFor="an-ficha-rua">Rua e nº</label>
                  <input
                    id="an-ficha-rua"
                    type="text"
                    placeholder="Digite o nome da rua e nº"
                    value={fichaForm.rua}
                    onChange={handleFichaField('rua')}
                    className="field-input"
                  />
                </div>

                <div className="field-row">
                  <div>
                    <label className="field-label" htmlFor="an-ficha-bairro">Bairro</label>
                    <input
                      id="an-ficha-bairro"
                      type="text"
                      placeholder="Nome do seu bairro"
                      value={fichaForm.bairro}
                      onChange={handleFichaField('bairro')}
                      className="field-input"
                    />
                  </div>
                  <div>
                    <label className="field-label" htmlFor="an-ficha-cidade">Cidade</label>
                    <input
                      id="an-ficha-cidade"
                      type="text"
                      placeholder="Nome da sua cidade"
                      value={fichaForm.cidade}
                      onChange={handleFichaField('cidade')}
                      className="field-input"
                    />
                  </div>
                </div>

                <div className="field-wrap field-wrap-last">
                  <label className="field-label" htmlFor="an-ficha-cep">CEP</label>
                  <input
                    id="an-ficha-cep"
                    type="text"
                    placeholder="00000-000"
                    value={fichaForm.cep}
                    onChange={handleFichaField('cep')}
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
                    {ANAMNESE_FOTOTIPOS.map((f) => (
                      <button
                        key={f.num}
                        type="button"
                        onClick={() => setFichaFototipo(f.num)}
                        className={`fototipo-card ${fichaFototipo === f.num ? 'selected' : ''}`}
                      >
                        <div className="fototipo-kicker">Pigmentação {f.num}</div>
                        <div className="fototipo-swatch" style={{ background: f.tone }} />
                        <div className="fototipo-desc">{f.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {ANAMNESE_QUESTIONS.map((q, i) => (
                  <div
                    key={q.num}
                    className={`question-block ${i < ANAMNESE_QUESTIONS.length - 1 ? 'has-border' : ''}`}
                  >
                    <div className="question-label">
                      <span className="question-num">({q.num})</span>&nbsp; {q.text}
                    </div>
                    <div className="radio-group">
                      <label className="radio-label">
                        <input
                          type="radio"
                          name={`an-q${q.num}`}
                          value="Não"
                          checked={fichaAnswers[q.num] === 'Não'}
                          onChange={() => handleFichaAnswer(q.num, 'Não')}
                          className="radio-input"
                        />
                        Não
                      </label>
                      <label className="radio-label">
                        <input
                          type="radio"
                          name={`an-q${q.num}`}
                          value="Sim"
                          checked={fichaAnswers[q.num] === 'Sim'}
                          onChange={() => handleFichaAnswer(q.num, 'Sim')}
                          className="radio-input"
                        />
                        Sim
                      </label>
                    </div>
                  </div>
                ))}

                <div className="field-wrap-last">
                  <label className="field-label" htmlFor="an-ficha-obs">Deseja mais alguma observação?</label>
                  <textarea
                    id="an-ficha-obs"
                    rows="4"
                    value={fichaForm.obs}
                    onChange={handleFichaField('obs')}
                    className="field-input field-textarea"
                  />
                </div>
              </div>

              {error && (
                <div className="admin-login-error">
                  <IconAlertCircle size={14} /> <span>{error}</span>
                </div>
              )}

              <div className="agenda-online-actions">
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={saving || !fichaForm.nome.trim() || !fichaForm.telefone.trim()}
                  className="agenda-online-btn-primary agenda-online-btn-confirm"
                >
                  {saving ? 'Enviando...' : 'Enviar Ficha'}
                </button>
              </div>
            </div>
          ) : (
            <div className="agenda-online-success">
              <div className="agenda-online-success-icon">
                <IconCheckCircle size={28} />
              </div>
              <h1 className="agenda-online-step-title">Ficha enviada!</h1>
              <p className="agenda-online-success-text">
                Recebemos seus dados. Nossa equipe vai avaliar seu questionário e entrar em
                contato para confirmar se o tratamento é indicado e agendar sua sessão.
              </p>

              <div className="agenda-online-actions agenda-online-actions-center">
                <Link to="/" className="agenda-online-btn-primary">
                  Voltar ao site
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnamneseOnline;
