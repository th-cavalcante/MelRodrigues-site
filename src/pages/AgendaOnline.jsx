import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { fetchLaserServices, formatPrice } from '../lib/services';
import { toISODate, BLOCKED_SLOTS, ANAMNESE_FOTOTIPOS, ANAMNESE_QUESTIONS } from '../lib/agendaConstants';
import {
  getPatientNameForBooking,
  getBookedTimes,
  createPublicBooking,
  createPublicPatient,
  getBookingPaymentStatus,
} from '../lib/bookings';
import { getPublicBlockedSlots, getPublicBlockedDays } from '../lib/blockedSlots';
import { submitAnamnese } from '../lib/patients';
import { createMpPreference } from '../lib/mercadopago';
import { IconCheckCircle, IconAlertCircle, IconChevronLeft, IconChevronRight } from '../components/admin/Icons';
import '../styles/AgendaOnline.css';
import '../styles/FichaAnamneseModal.css';

const IconGem = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3 4 9l8 12 8-12-8-6Z" />
  </svg>
);

const IconCreditCard = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
    <rect x="2.5" y="5" width="19" height="14" rx="2.5" />
    <line x1="2.5" y1="10" x2="21.5" y2="10" />
  </svg>
);

const IconZap = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
    <path d="M12.5 2 4 14h6.5L11 22l8.5-12H13l-.5-8Z" />
  </svg>
);

const IconLock = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
    <rect x="4.5" y="10.5" width="15" height="10" rx="2.2" />
    <path d="M7.5 10.5V7a4.5 4.5 0 0 1 9 0v3.5" />
  </svg>
);

const IconDownload = ({ size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3v12" />
    <path d="M7 10.5 12 15.5 17 10.5" />
    <path d="M4.5 19.5h15" />
  </svg>
);

const IconHourglass = ({ size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 3h12M6 21h12" />
    <path d="M7 3c0 5 5 6.5 5 9s-5 4-5 9M17 3c0 5-5 6.5-5 9s5 4 5 9" />
  </svg>
);

const STEPS = [
  { num: 1, label: 'Serviço' },
  { num: 2, label: 'Data' },
  { num: 3, label: 'Ficha' },
  { num: 4, label: 'Pagamento' },
  { num: 5, label: 'Concluído' },
];

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

const downloadRecommendations = () => {
  const w = window.open('', '_blank');
  if (!w) return;
  w.document.write(`
    <html><head><title>Recomendações Pré e Pós Sessão — MR Laser</title>
    <style>
      body { font-family: Georgia, serif; padding: 60px; color: #2b2620; max-width: 700px; margin: 0 auto; }
      h1 { font-size: 26px; border-bottom: 2px solid #B08D57; padding-bottom: 14px; }
      h2 { font-size: 18px; color: #B08D57; margin-top: 34px; }
      li { margin-bottom: 8px; line-height: 1.6; }
    </style></head><body>
    <h1>Recomendações Pré e Pós Sessão — MR Laser</h1>
    <h2>Antes da sua sessão</h2>
    <ul>
      <li>Evite exposição solar direta na área a ser tratada por ao menos 15 dias.</li>
      <li>Não utilize cremes, óleos ou perfumes na região no dia do procedimento.</li>
      <li>Compareça com a pele limpa e sem depilação recente (lâmina/cera) nas últimas 2 semanas.</li>
    </ul>
    <h2>Depois da sua sessão</h2>
    <ul>
      <li>Evite sol e calor intenso na área tratada por 48 horas.</li>
      <li>Aplique protetor solar diariamente na região.</li>
      <li>Não utilize produtos ácidos ou esfoliantes na área por 5 dias.</li>
      <li>Em caso de vermelhidão, aplique compressa fria e evite tocar a região.</li>
    </ul>
    <p style="margin-top:40px;font-size:13px;color:#777;">MR Laser · Documento gerado em ${new Date().toLocaleDateString('pt-BR')}</p>
    </body></html>
  `);
  w.document.close();
  setTimeout(() => w.print(), 300);
};

const AgendaOnlineContent = ({ initialPatientId, initialService, mpReturn }) => {
  const [step, setStep] = useState(() => {
    if (mpReturn) return mpReturn.status === 'failure' ? 4 : 5;
    return 1;
  });
  const [patientId, setPatientId] = useState(initialPatientId || null);
  const [patientName, setPatientName] = useState('');
  const [fichaForm, setFichaForm] = useState(initialFichaForm);
  const [fichaFototipo, setFichaFototipo] = useState(null);
  const [fichaAnswers, setFichaAnswers] = useState({});
  const [fichaSaving, setFichaSaving] = useState(false);
  const [service, setService] = useState('');
  const [services, setServices] = useState([]);
  const [servicesLoaded, setServicesLoaded] = useState(false);
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedDayOffset, setSelectedDayOffset] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [bookedTimes, setBookedTimes] = useState([]);
  const [dynamicBlockedTimes, setDynamicBlockedTimes] = useState([]);
  const [blockedDays, setBlockedDays] = useState([]);
  const [error, setError] = useState('');
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [pendingBookingId, setPendingBookingId] = useState(mpReturn?.bookingId || null);
  const [returnedSummary, setReturnedSummary] = useState(null);
  const [liveStatus, setLiveStatus] = useState(mpReturn?.status || null);

  const needsIdentity = !initialPatientId;

  useEffect(() => {
    if (!initialPatientId) return;
    getPatientNameForBooking(initialPatientId)
      .then((name) => setPatientName(name || ''))
      .catch((err) => console.error('Erro ao carregar nome do paciente:', err));
  }, [initialPatientId]);

  useEffect(() => {
    fetchLaserServices()
      .then((list) => {
        setServices(list);
        if (!mpReturn && initialService) {
          const matched = list.find((s) => s.name === initialService);
          if (matched) {
            setService(matched.name);
            setStep(2);
          }
        }
      })
      .catch((err) => console.error('Erro ao carregar tabela de preço:', err))
      .finally(() => setServicesLoaded(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!mpReturn) return;
    try {
      const raw = sessionStorage.getItem(`mp-booking-${mpReturn.bookingId}`);
      if (raw) setReturnedSummary(JSON.parse(raw));
    } catch (err) {
      console.error('Erro ao ler resumo do agendamento:', err);
    }
  }, [mpReturn]);

  // Pix não aprova na hora: o Mercado Pago devolve o navegador pro site com
  // status "pending" assim que o QR é gerado. A confirmação real chega
  // minutos depois via webhook, então reconsultamos o agendamento até virar
  // "Pago" (ou o usuário sair da tela).
  useEffect(() => {
    if (liveStatus !== 'pending' || !pendingBookingId) return undefined;
    let cancelled = false;

    const check = async () => {
      try {
        const result = await getBookingPaymentStatus(pendingBookingId);
        if (cancelled || !result) return;
        if (result.payment_status === 'Pago' || result.payment_status === 'Pago Sinal 50%') setLiveStatus('approved');
      } catch (err) {
        console.error('Erro ao verificar status do pagamento:', err);
      }
    };

    const interval = setInterval(check, 4000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [liveStatus, pendingBookingId]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

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

  const weekStart = startOfWeek(addDays(today, weekOffset * 7));
  const weekEnd = addDays(weekStart, 6);
  const weekLabel = `${weekStart.getDate()} — ${weekEnd.getDate()} de ${weekEnd.toLocaleDateString('pt-BR', { month: 'long' })}`;

  useEffect(() => {
    getPublicBlockedDays(toISODate(weekStart), toISODate(weekEnd))
      .then(setBlockedDays)
      .catch((err) => console.error('Erro ao carregar dias bloqueados:', err));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weekOffset]);

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

  let selectedDateTimeLabel = '';
  if (selectedDayOffset !== null) {
    const d = addDays(today, selectedDayOffset);
    const dateStr = d.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' });
    selectedDateTimeLabel = selectedTime ? `${dateStr}, às ${selectedTime}` : dateStr;
  }

  const selectedService = services.find((s) => s.name === service);
  const selectedServicePrice = selectedService ? Number(selectedService.price) : null;
  const depositAmount = selectedServicePrice != null ? selectedServicePrice / 2 : null;

  const displayService = returnedSummary?.serviceLabel || service;
  const displayDateTimeLabel = returnedSummary?.dateTimeLabel || selectedDateTimeLabel;

  const handleSelectDay = (dayOffset) => {
    setSelectedDayOffset(dayOffset);
    setSelectedTime(null);
  };

  const handleFichaField = (key) => (e) => {
    const { value } = e.target;
    setFichaForm((f) => ({ ...f, [key]: value }));
  };

  const handleFichaAnswer = (num, value) => {
    setFichaAnswers((a) => ({ ...a, [num]: value }));
  };

  const handleSubmitFicha = async () => {
    setError('');
    setFichaSaving(true);
    try {
      let currentPatientId = patientId;
      if (!currentPatientId) {
        currentPatientId = await createPublicPatient({ name: fichaForm.nome.trim(), phone: fichaForm.telefone.trim() });
        setPatientId(currentPatientId);
      }
      await submitAnamnese(currentPatientId, { ...fichaForm, fototipo: fichaFototipo, answers: fichaAnswers });
      setStep(4);
    } catch (err) {
      console.error('Erro ao salvar ficha:', err);
      setError(`Não foi possível salvar a ficha: ${err.message || 'erro desconhecido'}`);
    } finally {
      setFichaSaving(false);
    }
  };

  const handlePayment = async () => {
    setError('');
    setPaymentProcessing(true);
    try {
      let currentBookingId = pendingBookingId;
      if (!currentBookingId) {
        currentBookingId = await createPublicBooking({
          patientId,
          service,
          bookingDate: toISODate(addDays(today, selectedDayOffset)),
          bookingTime: selectedTime,
          notes: fichaForm.obs,
          paymentMethod: null,
        });
        setPendingBookingId(currentBookingId);
      }

      sessionStorage.setItem(
        `mp-booking-${currentBookingId}`,
        JSON.stringify({ serviceLabel: service, dateTimeLabel: selectedDateTimeLabel })
      );

      const initPoint = await createMpPreference({
        bookingId: currentBookingId,
        description: `Depilação a Laser — ${service} (sinal)`,
        amount: depositAmount,
      });

      window.location.href = initPoint;
    } catch (err) {
      console.error('Erro ao iniciar pagamento:', err);
      setError(err.message || 'Não foi possível iniciar o pagamento. Tente novamente.');
      setPaymentProcessing(false);
    }
  };

  return (
    <>
      <div className="agenda-online-brand">
        <img src="/images/logo.png" alt="MR Laser" className="agenda-online-brand-logo" />
        <span className="agenda-online-brand-text">
          <span className="agenda-online-brand-name">MR Laser</span>
          <span className="agenda-online-brand-tag"> · agenda online</span>
        </span>
        {(patientName || fichaForm.nome) && (
          <span className="agenda-online-brand-greeting">
            Olá, <strong>{patientName || fichaForm.nome}</strong>
          </span>
        )}
      </div>

      <div className="agenda-online-content">
        {step < 5 && (
          <div className="agenda-online-stepper">
            {STEPS.slice(0, 5).map((s, i) => (
              <React.Fragment key={s.num}>
                <div
                  className={`agenda-online-step-circle ${step > s.num ? 'done' : ''} ${step === s.num ? 'active' : ''}`}
                >
                  {step > s.num ? <IconCheckCircle size={13} /> : s.num}
                </div>
                {i < 4 && <div className={`agenda-online-step-line ${step > s.num ? 'done' : ''}`} />}
              </React.Fragment>
            ))}
          </div>
        )}

        <div className="agenda-online-card">
          {step === 1 && (
            <div className="agenda-online-step">
              <div className="agenda-online-step-header">
                <span className="section-eyebrow">Passo 1 de 5</span>
                <h1 className="agenda-online-step-title">Qual tratamento você deseja agendar?</h1>
              </div>
              <div className="agenda-online-service-list">
                {!servicesLoaded && <div className="agenda-online-no-times">Carregando tratamentos...</div>}
                {servicesLoaded && services.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => {
                      setService(s.name);
                      setStep(2);
                    }}
                    className={`agenda-online-service-card ${service === s.name ? 'selected' : ''}`}
                  >
                    <div className="agenda-online-service-info">
                      <span className="agenda-online-service-icon"><IconGem /></span>
                      <div>
                        <div className="agenda-online-service-name">Depilação a Laser — {s.name}</div>
                        <div className="agenda-online-service-price">a partir de R$ {formatPrice(s.price)}</div>
                      </div>
                    </div>
                    <span className="agenda-online-service-arrow">
                      {service === s.name ? <IconCheckCircle size={18} /> : <IconChevronRight size={18} />}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="agenda-online-step">
              <div className="agenda-online-step-header">
                <span className="section-eyebrow">Passo 2 de 5</span>
                <h1 className="agenda-online-step-title">Escolha o melhor dia e horário</h1>
                <p className="agenda-online-service-tag">Depilação a Laser — {service}</p>
              </div>

              <div className="agenda-online-week-nav">
                <button type="button" onClick={() => setWeekOffset((w) => w - 1)} className="agenda-online-nav-btn">
                  <IconChevronLeft size={14} />
                </button>
                <div className="agenda-online-week-label">{weekLabel}</div>
                <button type="button" onClick={() => setWeekOffset((w) => w + 1)} className="agenda-online-nav-btn">
                  <IconChevronRight size={14} />
                </button>
              </div>

              <div className="agenda-online-day-grid">
                {dayOptions.map((d) => (
                  <button
                    key={d.dayOffset}
                    type="button"
                    disabled={d.disabled}
                    onClick={() => handleSelectDay(d.dayOffset)}
                    className={`agenda-online-day-card ${selectedDayOffset === d.dayOffset ? 'selected' : ''}`}
                  >
                    <div className="agenda-online-day-weekday">{d.weekday}</div>
                    <div className="agenda-online-day-num">{d.num}</div>
                  </button>
                ))}
              </div>

              {selectedDayOffset !== null && (
                <>
                  <div className="admin-small-label agenda-online-times-label">Horários disponíveis</div>
                  <div className="agenda-online-time-grid">
                    {timeOptions.map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setSelectedTime(t)}
                        className={`agenda-online-time-btn ${selectedTime === t ? 'selected' : ''}`}
                      >
                        {t}
                      </button>
                    ))}
                    {timeOptions.length === 0 && (
                      <div className="agenda-online-no-times">Sem horários livres neste dia. Tente outro dia.</div>
                    )}
                  </div>
                </>
              )}

              <div className="agenda-online-actions">
                <button type="button" onClick={() => setStep(1)} className="agenda-online-btn-secondary">
                  Voltar
                </button>
                <button
                  type="button"
                  disabled={selectedDayOffset === null || !selectedTime}
                  onClick={() => setStep(needsIdentity ? 3 : 4)}
                  className="agenda-online-btn-primary"
                >
                  Continuar
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="agenda-online-step">
              <div className="agenda-online-step-header">
                <span className="section-eyebrow">Passo 3 de 5</span>
                <h1 className="agenda-online-step-title">Ficha de Anamnese</h1>
                <p className="agenda-online-step-subtitle">
                  Preencha seus dados e o questionário clínico antes de reservar o horário.
                </p>
              </div>

              <div className="ficha-modal-body">
                <div className="field-wrap">
                  <label className="field-label" htmlFor="ao-ficha-nome">Nome Completo</label>
                  <input
                    id="ao-ficha-nome"
                    type="text"
                    placeholder="Digite seu nome..."
                    value={fichaForm.nome}
                    onChange={handleFichaField('nome')}
                    className="field-input"
                  />
                </div>

                <div className="field-wrap">
                  <label className="field-label" htmlFor="ao-ficha-nascimento">Data de Nascimento</label>
                  <input
                    id="ao-ficha-nascimento"
                    type="date"
                    value={fichaForm.nascimento}
                    onChange={handleFichaField('nascimento')}
                    className="field-input"
                  />
                </div>

                <div className="field-row">
                  <div>
                    <label className="field-label" htmlFor="ao-ficha-cpf">CPF</label>
                    <input
                      id="ao-ficha-cpf"
                      type="text"
                      placeholder="000.000.000-00"
                      value={fichaForm.cpf}
                      onChange={handleFichaField('cpf')}
                      className="field-input"
                    />
                  </div>
                  <div>
                    <label className="field-label" htmlFor="ao-ficha-telefone">Telefone</label>
                    <input
                      id="ao-ficha-telefone"
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
                        name="ao-sexo"
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
                        name="ao-sexo"
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
                  <label className="field-label" htmlFor="ao-ficha-rua">Rua e nº</label>
                  <input
                    id="ao-ficha-rua"
                    type="text"
                    placeholder="Digite o nome da rua e nº"
                    value={fichaForm.rua}
                    onChange={handleFichaField('rua')}
                    className="field-input"
                  />
                </div>

                <div className="field-row">
                  <div>
                    <label className="field-label" htmlFor="ao-ficha-bairro">Bairro</label>
                    <input
                      id="ao-ficha-bairro"
                      type="text"
                      placeholder="Nome do seu bairro"
                      value={fichaForm.bairro}
                      onChange={handleFichaField('bairro')}
                      className="field-input"
                    />
                  </div>
                  <div>
                    <label className="field-label" htmlFor="ao-ficha-cidade">Cidade</label>
                    <input
                      id="ao-ficha-cidade"
                      type="text"
                      placeholder="Nome da sua cidade"
                      value={fichaForm.cidade}
                      onChange={handleFichaField('cidade')}
                      className="field-input"
                    />
                  </div>
                </div>

                <div className="field-wrap field-wrap-last">
                  <label className="field-label" htmlFor="ao-ficha-cep">CEP</label>
                  <input
                    id="ao-ficha-cep"
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
                          name={`ao-q${q.num}`}
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
                          name={`ao-q${q.num}`}
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
                  <label className="field-label" htmlFor="ao-ficha-obs">Deseja mais alguma observação?</label>
                  <textarea
                    id="ao-ficha-obs"
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
                <button type="button" onClick={() => setStep(2)} className="agenda-online-btn-secondary">
                  Voltar
                </button>
                <button
                  type="button"
                  onClick={handleSubmitFicha}
                  disabled={fichaSaving || !fichaForm.nome.trim() || !fichaForm.telefone.trim()}
                  className="agenda-online-btn-primary agenda-online-btn-confirm"
                >
                  {fichaSaving ? 'Salvando...' : 'Continuar'}
                </button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="agenda-online-step">
              <div className="agenda-online-step-header">
                <span className="section-eyebrow">Passo 4 de 5</span>
                <h1 className="agenda-online-step-title">Pagamento do sinal</h1>
                <p className="agenda-online-step-subtitle">
                  Garanta seu horário reservando com um sinal de 50% —{' '}
                  {depositAmount != null ? `R$ ${depositAmount.toFixed(2).replace('.', ',')}` : 'valor a combinar'}
                </p>
              </div>

              {mpReturn?.status === 'failure' && (
                <div className="agenda-online-payment-pending-banner agenda-online-payment-error-banner">
                  <IconAlertCircle size={16} /> O pagamento não foi concluído. Você pode tentar novamente abaixo.
                </div>
              )}

              <div className="agenda-online-summary-card">
                <div className="agenda-online-summary-row agenda-online-summary-row-last">
                  <span>Depilação a Laser — {service}</span>
                  <strong>{selectedDateTimeLabel}</strong>
                </div>
              </div>

              <div className="agenda-online-mp-panel">
                <div className="agenda-online-mp-methods">
                  <span><IconCreditCard /> Cartão de Crédito</span>
                  <span><IconZap /> Pix</span>
                </div>
                <p className="agenda-online-step-subtitle">
                  Você será redirecionado ao ambiente seguro do Mercado Pago para escolher a forma de
                  pagamento e concluir a reserva do seu sinal.
                </p>
                <div className="agenda-online-security-note">
                  <IconLock /> Seus dados de pagamento são processados diretamente pelo Mercado Pago.
                </div>
              </div>

              {error && (
                <div className="admin-login-error">
                  <IconAlertCircle size={14} /> <span>{error}</span>
                </div>
              )}

              <div className="agenda-online-actions">
                <button type="button" onClick={() => setStep(needsIdentity ? 3 : 2)} className="agenda-online-btn-secondary">
                  Voltar
                </button>
                <button
                  type="button"
                  onClick={handlePayment}
                  disabled={paymentProcessing}
                  className="agenda-online-btn-primary agenda-online-btn-confirm"
                >
                  {paymentProcessing ? 'Redirecionando...' : 'Pagar com Mercado Pago'}
                </button>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="agenda-online-success">
              <div className={`agenda-online-success-icon ${liveStatus === 'pending' ? 'pending' : ''}`}>
                {liveStatus === 'pending' ? <IconHourglass /> : <IconCheckCircle size={28} />}
              </div>
              <h1 className="agenda-online-step-title">
                {liveStatus === 'pending' ? 'Pagamento em processamento' : 'Agendamento confirmado!'}
              </h1>
              <p className="agenda-online-success-text">
                {liveStatus === 'pending'
                  ? 'Recebemos sua reserva e estamos aguardando a confirmação do pagamento. Esta página vai atualizar sozinha assim que o Pix cair.'
                  : 'Guarde os detalhes abaixo. Chegue com 10 minutos de antecedência para o seu atendimento.'}
              </p>

              <div className="agenda-online-summary-card agenda-online-success-card">
                <div className="agenda-online-service-name">Depilação a Laser — {displayService}</div>
                <div className="agenda-online-step-subtitle">{displayDateTimeLabel}</div>
              </div>

              <button type="button" onClick={downloadRecommendations} className="agenda-online-btn-secondary agenda-online-download-btn">
                <IconDownload /> Baixar recomendações pré e pós sessão
              </button>

              <div className="agenda-online-actions agenda-online-actions-center">
                <Link to="/" className="agenda-online-btn-primary">
                  Voltar ao site
                </Link>
                <a href="/cliente/agendar" className="agenda-online-btn-secondary">
                  Novo agendamento
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

const AgendaOnline = () => {
  const [searchParams] = useSearchParams();
  const patientId = searchParams.get('patient');
  const service = searchParams.get('service');
  const mpBookingId = searchParams.get('mp_booking');
  const mpStatus = searchParams.get('mp_status');
  const mpReturn = mpBookingId ? { bookingId: mpBookingId, status: mpStatus } : null;

  return (
    <div className="cliente-page agenda-online-page">
      <AgendaOnlineContent initialPatientId={patientId} initialService={service} mpReturn={mpReturn} />
    </div>
  );
};

export default AgendaOnline;
