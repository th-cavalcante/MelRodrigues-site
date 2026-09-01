import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { createCourseMpPreference } from '../lib/courseOrders';
import '../styles/CursoDepilacao.css';

const WHATSAPP_LINK = 'https://wa.me/5513996753432?text=Olá%20MR%20Laser!%20Gostaria%20de%20saber%20mais%20sobre%20o%20Curso%20de%20Depilação%20a%20Laser.';

const IconMercado = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 17 9 11 13 15 21 6"></polyline>
    <polyline points="14 6 21 6 21 13"></polyline>
  </svg>
);

const IconRentabilidade = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9"></circle>
    <path d="M14.5 9a2.5 2.5 0 0 0-2.5-1c-1.5 0-2.5.8-2.5 2s1 1.6 2.5 2 2.5.8 2.5 2-1 2-2.5 2a2.5 2.5 0 0 1-2.5-1"></path>
    <line x1="12" y1="6" x2="12" y2="7.3"></line>
    <line x1="12" y1="16.7" x2="12" y2="18"></line>
  </svg>
);

const IconIndependencia = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 19V6"></path>
    <path d="M12 8c-1-3-4-4-8-3 0 4 2 6 8 6"></path>
    <path d="M12 8c1-3 4-4 8-3 0 4-2 6-8 6"></path>
    <path d="M9 19h6"></path>
  </svg>
);

const IconTecnologia = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="7" y="7" width="10" height="10" rx="1.5"></rect>
    <rect x="10" y="10" width="4" height="4" rx="0.5"></rect>
    <line x1="12" y1="2" x2="12" y2="5"></line>
    <line x1="12" y1="19" x2="12" y2="22"></line>
    <line x1="2" y1="12" x2="5" y2="12"></line>
    <line x1="19" y1="12" x2="22" y2="12"></line>
  </svg>
);

const reasons = [
  { key: 'mercado', Icon: IconMercado, title: 'Mercado em Alta', desc: 'A depilação a laser é uma das áreas que mais cresce dentro da estética avançada.' },
  { key: 'rentabilidade', Icon: IconRentabilidade, title: 'Alta Rentabilidade', desc: 'Retorno rápido sobre o investimento, com sessões de alto valor agregado.' },
  { key: 'independencia', Icon: IconIndependencia, title: 'Independência Financeira', desc: 'Uma habilidade que você carrega para sempre e pode aplicar onde quiser.' },
  { key: 'tecnologia', Icon: IconTecnologia, title: 'Tecnologia Avançada', desc: 'Domínio prático de equipamentos de ponta, como o laser Hakon 4D.' },
];

const courseInfo = [
  { icon: '📍', label: 'Local', value: 'São Vicente - Litoral de SP', note: 'R. Benjamin Constant, 61, Sala 515 - Centro, São Vicente (Helbor Offices)' },
  { icon: '📅', label: 'Próxima Data', value: '05/10', note: 'Turmas reduzidas de até 4 alunas para maior aproveitamento' },
  { icon: '🎓', label: 'Certificado', value: 'Incluso', note: 'Certificado válido em todo território nacional' },
];

const curriculum = [
  'Como identificar pele e pelo corretamente',
  'Parâmetros seguros do laser',
  'Protocolos de atendimento',
  'Erros que as franquias de depilação mais cometem e que fazem perder resultado ou causar intercorrência',
  'Raciocínio clínico para elaborar protocolos únicos para cada paciente e garantir resultados desde a primeira sessão',
].map((text, i) => ({ num: String(i + 1).padStart(2, '0'), text }));

const inclusions = [
  'Material de apoio (apostila) + material para a prática',
  'Lista de fornecedores (produtos, descartáveis e locação)',
  'Supervisão (via WhatsApp) no seu primeiro Laser Day',
  'Grupo exclusivo pós-curso por 7 dias (para envio de materiais e compartilhar dúvidas)',
  'Super coffee break disponível do começo ao final do curso',
  'Certificado validado em todo Brasil',
];

const pricingPlans = [
  {
    key: 'turma',
    label: 'Curso em Turma',
    subtitle: 'Turma de apenas 4 alunas, para ter um aprendizado mais eficiente.',
    price: 999.9,
    pixPrice: '999,90',
    installments: 'até 6x no cartão de crédito (Juros pelo parcelamento)',
    badge: null,
    features: [
      '8 horas de curso — teoria e muita prática',
      'Coffee Break',
      'Primeira Locação do Equipamento Hakon 4D Grátis',
      'Certificado de conclusão',
      '1 ano de acesso grátis ao App Teaga — Agenda Inteligente',
      'Suporte pós-curso',
    ],
  },
  {
    key: 'individual',
    label: 'Mentoria Individual',
    subtitle: 'Um dia exclusivo, com atenção 100% voltada para você e seu desenvolvimento prático.',
    price: 1499.9,
    pixPrice: '1.499,90',
    installments: 'até 6x no cartão de crédito (Juros pelo parcelamento)',
    badge: 'MAIS EXCLUSIVO',
    features: [
      'A aluna mentorada escolhe a data da sua mentoria.',
      '8 horas de curso — teoria e muita prática',
      'Coffee Break',
      'Almoço Incluso (Restaurante & Buffet Torre Grill)',
      'Primeira Locação do Equipamento Hakon 4D Grátis',
      'Certificado de conclusão',
      '1 ano de acesso grátis ao App Teaga — Agenda Inteligente',
      'Supervisão (via WhatsApp) durante todo o seu primeiro Laser Day',
    ],
  },
];

const gallery = [
  { src: '/images/curso/curso-1.jpg', caption: 'Turma e certificados' },
  { src: '/images/curso/curso-2.jpg', caption: 'Prática supervisionada' },
  { src: '/images/curso/curso-3.jpg', caption: 'Manuseio do laser Hakon 4D' },
  { src: '/images/curso/curso-4.jpg', caption: 'Entrega de certificado' },
  { src: '/images/curso/curso-5.jpg', caption: 'Certificado de conclusão' },
  { src: '/images/curso/curso-6.jpg', caption: 'Alunas formadas' },
  { src: '/images/curso/curso-7.jpg', caption: 'Assinatura do certificado' },
];

const testimonials = [
  { quote: 'O curso mudou minha carreira. Hoje atendo com total confiança graças à prática real que tive.', name: 'Patrícia Nunes', turma: 'Turma de Março' },
  { quote: 'Atenção individual de verdade — poucas alunas por turma faz toda a diferença no aprendizado.', name: 'Renata Silva', turma: 'Turma de Abril' },
  { quote: 'Aprendi a manusear o Hakon 4D com segurança e já estou atendendo minhas primeiras clientes.', name: 'Débora Lima', turma: 'Turma de Maio' },
];

const emptyForm = { name: '', email: '', phone: '' };

const formatBRL = (value) => value.toFixed(2).replace('.', ',');

const GalleryCarousel = () => {
  const trackRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const scrollToIndex = useCallback((index) => {
    const track = trackRef.current;
    if (!track) return;
    const slide = track.children[index];
    if (!slide) return;
    track.scrollTo({ left: slide.offsetLeft, behavior: 'smooth' });
  }, []);

  const handlePrev = () => scrollToIndex(Math.max(0, activeIndex - 1));
  const handleNext = () => scrollToIndex(Math.min(gallery.length - 1, activeIndex + 1));

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return undefined;

    const handleScroll = () => {
      const slideWidth = track.children[0]?.offsetWidth || 1;
      const index = Math.round(track.scrollLeft / slideWidth);
      setActiveIndex(Math.max(0, Math.min(gallery.length - 1, index)));
    };

    track.addEventListener('scroll', handleScroll, { passive: true });
    return () => track.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="curso-carousel">
      <div className="curso-carousel-track" ref={trackRef}>
        {gallery.map((item) => (
          <div className="curso-carousel-slide" key={item.src}>
            <img src={item.src} alt={item.caption} loading="lazy" />
            <span className="curso-carousel-caption">{item.caption}</span>
          </div>
        ))}
      </div>

      <button type="button" className="curso-carousel-arrow curso-carousel-arrow-prev" onClick={handlePrev} disabled={activeIndex === 0} aria-label="Foto anterior">
        ‹
      </button>
      <button type="button" className="curso-carousel-arrow curso-carousel-arrow-next" onClick={handleNext} disabled={activeIndex === gallery.length - 1} aria-label="Próxima foto">
        ›
      </button>

      <div className="curso-carousel-dots">
        {gallery.map((item, index) => (
          <button
            type="button"
            key={item.src}
            className={`curso-carousel-dot ${index === activeIndex ? 'active' : ''}`}
            onClick={() => scrollToIndex(index)}
            aria-label={`Ir para foto ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

const CursoDepilacao = () => {
  const [searchParams] = useSearchParams();
  const cursoOrderId = searchParams.get('curso_order');
  const cursoStatus = searchParams.get('curso_status');
  const mpReturn = cursoOrderId ? { orderId: cursoOrderId, status: cursoStatus } : null;

  const [returnedSummary] = useState(() => {
    if (!mpReturn) return null;
    try {
      const raw = sessionStorage.getItem(`curso-order-${mpReturn.orderId}`);
      return raw ? JSON.parse(raw) : null;
    } catch (err) {
      console.error('Erro ao ler resumo do pedido salvo:', err);
      return null;
    }
  });

  const [checkoutOpen, setCheckoutOpen] = useState(!!mpReturn);
  const [step, setStep] = useState(mpReturn ? 'result' : 1);
  const [planKey, setPlanKey] = useState('turma');
  const [paymentOption, setPaymentOption] = useState('total');
  const [form, setForm] = useState(emptyForm);
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState('');

  const selectedPlan = pricingPlans.find((p) => p.key === planKey) || pricingPlans[0];
  const chargeAmount = paymentOption === 'sinal' ? selectedPlan.price / 2 : selectedPlan.price;

  useEffect(() => {
    document.body.style.overflow = checkoutOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [checkoutOpen]);

  const openCheckout = (key) => {
    setPlanKey(key || planKey);
    setStep(1);
    setCheckoutOpen(true);
  };

  const closeCheckout = () => {
    setCheckoutOpen(false);
    setStep(1);
    setPaying(false);
    setPayError('');
    setForm(emptyForm);
    setPaymentOption('total');
  };

  const setFormField = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const step2Disabled = !form.name.trim() || !form.email.trim() || !form.phone.trim();

  const handlePay = async () => {
    setPaying(true);
    setPayError('');
    try {
      const { initPoint, orderId } = await createCourseMpPreference({
        planKey: selectedPlan.key,
        paymentOption,
        name: form.name,
        email: form.email,
        phone: form.phone,
      });
      sessionStorage.setItem(
        `curso-order-${orderId}`,
        JSON.stringify({ planLabel: selectedPlan.label, amount: formatBRL(chargeAmount) })
      );
      window.location.href = initPoint;
    } catch (err) {
      console.error('Erro ao iniciar pagamento do curso:', err);
      setPayError(err.message || 'Não foi possível iniciar o pagamento. Tente novamente.');
      setPaying(false);
    }
  };

  return (
    <div className="curso-page">
      <section className="curso-hero">
        <div className="curso-hero-media">
          <img src="/images/mel-sobre.png" alt="Instrutora do curso" />
        </div>
        <div className="curso-hero-content">
          <span className="curso-badge">⚠ APENAS 4 VAGAS POR TURMA</span>
          <h1 className="curso-title">
            Torne-se especialista em uma das áreas mais rentáveis da estética
          </h1>
          <p className="curso-subtitle">
            Curso presencial e prático de Depilação a Laser, com equipamento
            Hakon 4D, coffee break e certificado inclusos.
          </p>
          <button type="button" className="curso-btn-primary curso-hero-btn" onClick={() => openCheckout('turma')}>
            QUERO GARANTIR MINHA VAGA
          </button>
        </div>
      </section>

      <section className="curso-info">
        <div className="section-header">
          <span className="section-eyebrow">Detalhes</span>
          <h2 className="curso-section-title">Informações do Curso</h2>
        </div>
        <div className="curso-info-grid">
          {courseInfo.map((info) => (
            <div key={info.label} className="curso-info-card">
              <div className="curso-info-icon">{info.icon}</div>
              <div className="curso-info-label">{info.label}</div>
              <div className="curso-info-value">{info.value}</div>
              <div className="curso-info-note">{info.note}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="curso-curriculum">
        <div className="section-header">
          <span className="section-eyebrow">Conteúdo Programático</span>
          <h2 className="curso-section-title">Dentro do curso você vai aprender</h2>
        </div>

        <div className="curso-curriculum-list">
          {curriculum.map((item) => (
            <div key={item.num} className="curso-curriculum-item">
              <span className="curso-curriculum-num">{item.num}</span>
              <span className="curso-curriculum-text">{item.text}</span>
            </div>
          ))}
        </div>

        <div className="curso-note">
          <p>
            Eu criei esse curso justamente pra quem está começando e quer
            aprender com segurança, sem medo e sem ficar perdida. Você vai
            aprender desde a base (pele, pelo, parâmetros) até a prática real
            em modelo — tudo explicado de forma clara, mesmo para quem nunca
            teve contato com laser.
          </p>
          <p>É exatamente o método que eu uso no meu dia a dia com pacientes reais.</p>
        </div>

        <div className="curso-inclusions-header">
          <span className="section-eyebrow">O que está incluso</span>
          <h3 className="curso-inclusions-title">8 horas de duração — teoria e prática real</h3>
        </div>
        <div className="curso-inclusions-grid">
          {inclusions.map((inc) => (
            <div key={inc} className="curso-inclusion-item">
              <span className="curso-check">✓</span>
              <span>{inc}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="curso-pricing">
        <div className="section-header">
          <span className="section-eyebrow">Modalidades e Investimento</span>
          <h2 className="curso-section-title">Escolha sua Experiência</h2>
        </div>
        <div className="curso-pricing-grid">
          {pricingPlans.map((p) => (
            <div key={p.key} className={`curso-pricing-card ${p.badge ? 'featured' : ''}`}>
              {p.badge && <div className="curso-pricing-badge">{p.badge}</div>}
              <div className="curso-pricing-label">{p.label}</div>
              <p className="curso-pricing-subtitle">{p.subtitle}</p>
              <div className="curso-pricing-value">R$ {p.pixPrice}</div>
              <div className="curso-pricing-installments">no Pix, ou {p.installments}</div>
              <div className="curso-pricing-features">
                {p.features.map((f) => (
                  <div key={f} className="curso-pricing-feature">
                    <span className="curso-check">✓</span> {f}
                  </div>
                ))}
              </div>
              <button type="button" className="curso-btn-primary" onClick={() => openCheckout(p.key)}>
                QUERO GARANTIR MINHA VAGA
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="curso-gallery">
        <div className="section-header">
          <span className="section-eyebrow">Fotos do último curso</span>
          <h2 className="curso-section-title">Bastidores</h2>
        </div>
        <GalleryCarousel />
        <div className="curso-gallery-grid">
          {gallery.map((g) => (
            <div key={g.caption} className="curso-gallery-cell">
              <img src={g.src} alt={g.caption} loading="lazy" />
            </div>
          ))}
        </div>
      </section>

      <section className="curso-testimonials">
        <div className="section-header">
          <span className="section-eyebrow">Resultados Reais</span>
          <h2 className="curso-section-title">O que dizem nossas alunas</h2>
        </div>
        <div className="curso-testimonials-grid">
          {testimonials.map((t) => (
            <div key={t.name} className="curso-testimonial-card">
              <div className="curso-testimonial-avatar">{t.name.charAt(0)}</div>
              <div className="curso-testimonial-stars">★★★★★</div>
              <p className="curso-testimonial-quote">"{t.quote}"</p>
              <div className="curso-testimonial-name">{t.name}</div>
              <div className="curso-testimonial-turma">{t.turma}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="curso-reasons">
        <div className="section-header">
          <span className="section-eyebrow">Oportunidade</span>
          <h2 className="curso-section-title">Por que se capacitar em Depilação a Laser?</h2>
        </div>
        <div className="curso-reasons-grid">
          {reasons.map((r) => (
            <div key={r.key} className="curso-reason-card">
              <div className="curso-reason-icon">
                <r.Icon />
              </div>
              <h3 className="curso-reason-title">{r.title}</h3>
              <p className="curso-reason-desc">{r.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="reservar" className="curso-cta">
        <span className="curso-badge curso-cta-badge">⚠ APENAS 4 VAGAS POR TURMA</span>
        <h2 className="curso-cta-title">
          Garanta sua vaga na próxima turma antes que esgote
        </h2>
        <p className="curso-cta-subtitle">
          Turmas altamente reduzidas para garantir atenção individual e
          prática real com equipamento profissional.
        </p>
        <div className="curso-cta-actions">
          <button type="button" className="curso-btn-primary curso-cta-btn" onClick={() => openCheckout('turma')}>
            GARANTIR MINHA VAGA AGORA
          </button>
          <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="curso-btn-outline-dark curso-cta-btn">
            Falar no Whatsapp
          </a>
        </div>
      </section>

      <footer className="curso-footer">
        © {new Date().getFullYear()} MR Laser. Curso de Capacitação em
        Depilação a Laser — vagas sujeitas à disponibilidade de turma.
      </footer>

      {checkoutOpen && (
        <div className="curso-checkout-overlay" onClick={closeCheckout}>
          <div className="curso-checkout-modal" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="curso-checkout-close" onClick={closeCheckout} aria-label="Fechar">
              ×
            </button>

            {typeof step === 'number' && (
              <div className="curso-checkout-stepper">
                {[1, 2, 3].map((n) => {
                  const done = step > n;
                  const active = step === n;
                  return (
                    <div className="curso-checkout-stepper-item" key={n}>
                      <div className={`curso-checkout-step-circle ${done ? 'done' : ''} ${active ? 'active' : ''}`}>
                        {done ? '✓' : n}
                      </div>
                      {n < 3 && <div className={`curso-checkout-step-line ${done ? 'done' : ''}`} />}
                    </div>
                  );
                })}
              </div>
            )}

            {step === 1 && (
              <div>
                <h2 className="curso-checkout-title">Confirme sua modalidade</h2>
                <p className="curso-checkout-step-label">Passo 1 de 3</p>

                <div className="curso-checkout-plan-list">
                  {pricingPlans.map((p) => (
                    <button
                      type="button"
                      key={p.key}
                      className={`curso-checkout-plan-card ${planKey === p.key ? 'selected' : ''}`}
                      onClick={() => setPlanKey(p.key)}
                    >
                      <div>
                        <div className="curso-checkout-plan-label">{p.label}</div>
                        <div className="curso-checkout-plan-price">R$ {p.pixPrice} no Pix · {p.installments}</div>
                      </div>
                      <span className="curso-checkout-plan-mark">{planKey === p.key ? '✓' : '›'}</span>
                    </button>
                  ))}
                </div>

                <button type="button" className="curso-btn-primary curso-checkout-continue" onClick={() => setStep(2)}>
                  CONTINUAR
                </button>
              </div>
            )}

            {step === 2 && (
              <div>
                <h2 className="curso-checkout-title">Seus dados</h2>
                <p className="curso-checkout-step-label">Passo 2 de 3</p>

                <div className="field-wrap">
                  <label className="field-label">Nome completo</label>
                  <input type="text" placeholder="Digite seu nome" value={form.name} onChange={setFormField('name')} className="field-input" />
                </div>
                <div className="field-wrap">
                  <label className="field-label">E-mail</label>
                  <input type="email" placeholder="seu@email.com" value={form.email} onChange={setFormField('email')} className="field-input" />
                </div>
                <div className="field-wrap">
                  <label className="field-label">WhatsApp</label>
                  <input type="text" placeholder="(13) 90000-0000" value={form.phone} onChange={setFormField('phone')} className="field-input" />
                </div>

                <div className="curso-checkout-actions">
                  <button type="button" className="curso-checkout-back" onClick={() => setStep(1)}>VOLTAR</button>
                  <button type="button" className="curso-btn-primary curso-checkout-next" disabled={step2Disabled} onClick={() => setStep(3)}>
                    CONTINUAR
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div>
                <h2 className="curso-checkout-title">Confirme e pague</h2>
                <p className="curso-checkout-step-label">Passo 3 de 3</p>

                <div className="curso-checkout-plan-list">
                  <button
                    type="button"
                    className={`curso-checkout-plan-card ${paymentOption === 'total' ? 'selected' : ''}`}
                    onClick={() => setPaymentOption('total')}
                  >
                    <div>
                      <div className="curso-checkout-plan-label">Valor total</div>
                      <div className="curso-checkout-plan-price">R$ {formatBRL(selectedPlan.price)}</div>
                    </div>
                    <span className="curso-checkout-plan-mark">{paymentOption === 'total' ? '✓' : '›'}</span>
                  </button>
                  <button
                    type="button"
                    className={`curso-checkout-plan-card ${paymentOption === 'sinal' ? 'selected' : ''}`}
                    onClick={() => setPaymentOption('sinal')}
                  >
                    <div>
                      <div className="curso-checkout-plan-label">Sinal (50%) para reservar a vaga</div>
                      <div className="curso-checkout-plan-price">
                        R$ {formatBRL(selectedPlan.price / 2)} agora — restante combinado até o dia do curso
                      </div>
                    </div>
                    <span className="curso-checkout-plan-mark">{paymentOption === 'sinal' ? '✓' : '›'}</span>
                  </button>
                </div>

                <div className="curso-checkout-summary">
                  <span>{selectedPlan.label}{paymentOption === 'sinal' ? ' — Sinal (50%)' : ''}</span>
                  <strong>R$ {formatBRL(chargeAmount)}</strong>
                </div>

                {payError && <div className="admin-login-error">{payError}</div>}

                <div className="curso-checkout-actions">
                  <button type="button" className="curso-checkout-back" onClick={() => setStep(2)}>VOLTAR</button>
                  <button type="button" className="curso-btn-primary curso-checkout-next" disabled={paying} onClick={handlePay}>
                    {paying ? 'REDIRECIONANDO...' : 'PAGAR'}
                  </button>
                </div>
                <p className="curso-checkout-payment-note">
                  O pagamento será processado com segurança pelo Mercado Pago — cartão de crédito, Pix ou boleto.
                </p>
              </div>
            )}

            {step === 'result' && (
              <div className="curso-checkout-success">
                {cursoStatus === 'approved' && (
                  <>
                    <div className="curso-checkout-success-icon">✓</div>
                    <h2 className="curso-checkout-title">Vaga garantida!</h2>
                    <p className="curso-checkout-success-text">
                      Enviamos a confirmação e os próximos passos para o seu WhatsApp.
                    </p>
                  </>
                )}
                {cursoStatus === 'pending' && (
                  <>
                    <div className="curso-checkout-success-icon">⏳</div>
                    <h2 className="curso-checkout-title">Pagamento em análise</h2>
                    <p className="curso-checkout-success-text">
                      Assim que for aprovado, confirmamos sua vaga pelo WhatsApp.
                    </p>
                  </>
                )}
                {(cursoStatus === 'failure' || !cursoStatus) && (
                  <>
                    <div className="curso-checkout-success-icon">✕</div>
                    <h2 className="curso-checkout-title">Pagamento não concluído</h2>
                    <p className="curso-checkout-success-text">
                      Não foi possível confirmar o pagamento. Você pode tentar novamente.
                    </p>
                  </>
                )}

                {returnedSummary && (
                  <div className="curso-checkout-summary curso-checkout-summary-left">
                    <div>
                      <div className="curso-checkout-summary-label">Modalidade</div>
                      <div className="curso-checkout-summary-strong">{returnedSummary.planLabel}</div>
                    </div>
                    <div>
                      <div className="curso-checkout-summary-label">Valor</div>
                      <div className="curso-checkout-summary-strong">R$ {returnedSummary.amount}</div>
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  className="curso-btn-primary curso-checkout-continue"
                  onClick={() => {
                    if (cursoStatus === 'approved' || cursoStatus === 'pending') closeCheckout();
                    else setStep(1);
                  }}
                >
                  {cursoStatus === 'approved' || cursoStatus === 'pending' ? 'FECHAR' : 'TENTAR NOVAMENTE'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CursoDepilacao;
