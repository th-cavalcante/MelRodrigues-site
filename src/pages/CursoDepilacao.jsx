import React, { useRef, useState, useEffect, useCallback } from 'react';
import '../styles/CursoDepilacao.css';

const WHATSAPP_LINK = 'https://wa.me/5511987654321?text=Olá%20MR%20Laser!%20Gostaria%20de%20saber%20mais%20sobre%20o%20Curso%20de%20Depilação%20a%20Laser.';

const reasons = [
  { icon: '📈', title: 'Mercado em Alta', desc: 'A depilação a laser é uma das áreas que mais cresce dentro da estética avançada.' },
  { icon: '💰', title: 'Alta Rentabilidade', desc: 'Retorno rápido sobre o investimento, com sessões de alto valor agregado.' },
  { icon: '🦋', title: 'Independência Financeira', desc: 'Uma habilidade que você carrega para sempre e pode aplicar onde quiser.' },
  { icon: '⚡', title: 'Tecnologia Avançada', desc: 'Domínio prático de equipamentos de ponta, como o laser Hakon 4D.' },
];

const courseInfo = [
  { icon: '📍', label: 'Local', value: 'São Vicente/SP', note: 'Espaço moderno, preparado para prática' },
  { icon: '📅', label: 'Próxima Data', value: '[A definir]', note: 'Turmas altamente reduzidas' },
  { icon: '💰', label: 'Investimento', value: 'Consulte condições', note: 'Pagamento facilitado e de alto retorno' },
];

const pricingPlans = [
  {
    label: 'Curso em Turma',
    subtitle: 'Turmas de até 6 pessoas, aprendizado colaborativo e prático.',
    pixPrice: '999,00',
    installments: 'até 6x de R$ 183,33 no cartão',
    badge: null,
    features: [
      '8 horas de curso — teoria e muita prática',
      'Café da manhã incluso',
      'Certificado de conclusão',
      'Locação grátis da Hakon 4D no 1º laserday da aluna',
      'Suporte pós-curso',
    ],
  },
  {
    label: 'Mentoria Individual',
    subtitle: 'Atenção inteira, somente para a mentorada.',
    pixPrice: '1.399,00',
    installments: 'até 6x de R$ 250,00 no cartão',
    badge: 'MAIS EXCLUSIVO',
    features: [
      '8 horas de curso — teoria e muita prática',
      'Café da manhã incluso',
      'Certificado de conclusão',
      'Locação grátis da Hakon 4D no 1º laserday da aluna',
      'Suporte pós-curso',
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

  const handlePrev = () => {
    const next = Math.max(0, activeIndex - 1);
    scrollToIndex(next);
  };

  const handleNext = () => {
    const next = Math.min(gallery.length - 1, activeIndex + 1);
    scrollToIndex(next);
  };

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

      <button
        type="button"
        className="curso-carousel-arrow curso-carousel-arrow-prev"
        onClick={handlePrev}
        disabled={activeIndex === 0}
        aria-label="Foto anterior"
      >
        ‹
      </button>
      <button
        type="button"
        className="curso-carousel-arrow curso-carousel-arrow-next"
        onClick={handleNext}
        disabled={activeIndex === gallery.length - 1}
        aria-label="Próxima foto"
      >
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
  return (
    <div className="curso-page">
      <section className="curso-hero">
        <div className="curso-hero-content">
          <div className="curso-hero-eyebrow-row">
            <span className="curso-hero-line"></span>
            <span className="curso-hero-eyebrow">Curso VIP · Turmas Reduzidas</span>
            <span className="curso-hero-line"></span>
          </div>
          <h1 className="curso-title">
            Capacitação e Prática em<br />
            Depilação a <span className="curso-accent">Laser</span>
          </h1>
          <p className="curso-subtitle">
            Aprenda na prática com quem domina o mercado. Curso VIP e
            personalizado, para poucas alunas por turma.
          </p>
          <a href="#reservar" className="curso-btn-primary">
            QUERO ME CAPACITAR
          </a>
        </div>
      </section>

      <section className="curso-reasons">
        <div className="section-header">
          <span className="section-eyebrow">Oportunidade</span>
          <h2 className="curso-section-title">Por que se capacitar em Depilação a Laser?</h2>
        </div>
        <div className="curso-reasons-grid">
          {reasons.map((r) => (
            <div key={r.title} className="curso-reason-card">
              <div className="curso-reason-icon">{r.icon}</div>
              <h3 className="curso-reason-title">{r.title}</h3>
              <p className="curso-reason-desc">{r.desc}</p>
            </div>
          ))}
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

      <section className="curso-pricing">
        <div className="section-header">
          <span className="section-eyebrow">Modalidades</span>
          <h2 className="curso-section-title">Escolha sua Experiência</h2>
        </div>
        <div className="curso-pricing-grid">
          {pricingPlans.map((p) => (
            <div key={p.label} className={`curso-pricing-card ${p.badge ? 'featured' : ''}`}>
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
              <a
                href="#reservar"
                className={p.badge ? 'curso-btn-primary' : 'curso-btn-outline'}
              >
                QUERO GARANTIR MINHA VAGA
              </a>
            </div>
          ))}
        </div>
      </section>

      <section className="curso-gallery">
        <div className="section-header">
          <span className="section-eyebrow">Bastidores</span>
          <h2 className="curso-section-title">Álbum da Prática</h2>
        </div>
        <GalleryCarousel />
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

      <section id="reservar" className="curso-cta">
        <span className="section-eyebrow">Vagas VIP Limitadas</span>
        <h2 className="curso-cta-title">
          Garanta sua vaga na próxima turma antes que esgote
        </h2>
        <p className="curso-cta-subtitle">
          Turmas altamente reduzidas para garantir atenção individual e
          prática real com equipamento profissional.
        </p>
        <a
          href={WHATSAPP_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="curso-btn-primary curso-cta-btn"
        >
          FALAR NO WHATSAPP
        </a>
      </section>

      <footer className="curso-footer">
        © {new Date().getFullYear()} MR Laser. Curso de Capacitação em
        Depilação a Laser — vagas sujeitas à disponibilidade de turma.
      </footer>
    </div>
  );
};

export default CursoDepilacao;
