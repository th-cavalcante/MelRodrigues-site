import React, { useRef, useState } from 'react';
import '../styles/LocacaoHakon.css';

const WHATSAPP_LINK = 'https://wa.me/5511987654321?text=Olá%20MR%20Laser!%20Gostaria%20de%20saber%20mais%20sobre%20a%20locação%20do%20Hakon%204D.';

const inclusos = [
  'Óculos de proteção (Profissional e Paciente)',
  'Guia prático de parâmetros e suporte técnico',
];

const pricing = [
  { label: '1 Diária', price: '500,00', note: 'Locação por 1 dia' },
  { label: '2 Diárias', price: '900,00', note: 'Locação por 2 dias' },
];

const LocacaoHakon = () => {
  const videoRef = useRef(null);
  const [muted, setMuted] = useState(true);

  const toggleSound = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setMuted(video.muted);
  };

  return (
    <div className="locacao-page">
      <section className="locacao-hero">
        <div aria-hidden="true" className="locacao-hero-letter">H</div>

        <div className="locacao-hero-content">
          <div className="locacao-hero-eyebrow-row">
            <span className="locacao-hero-line"></span>
            <span className="locacao-hero-eyebrow">Locação de Equipamento</span>
          </div>
          <h1 className="locacao-title">
            Hakon <span className="locacao-accent">4D</span>
          </h1>
          <p className="locacao-subtitle">
            O laser de depilação indicado para todos os fototipos de pele,
            disponível para locação com toda a estrutura de suporte técnico
            que sua clínica precisa.
          </p>

          <div className="locacao-shipping">
            <span className="locacao-shipping-dot">●</span> Frete grátis para
            Baixada Santista
          </div>

          <div className="locacao-hero-actions">
            <a href="#valores" className="locacao-btn-primary">
              VER VALORES
            </a>
            <a href="#reservar" className="locacao-btn-outline">
              RESERVAR EQUIPAMENTO
            </a>
          </div>
        </div>

        <div className="locacao-hero-image">
          <div className="locacao-video-wrap">
            <video
              ref={videoRef}
              src="/videos/hakon-4d.mp4"
              autoPlay
              muted={muted}
              loop
              playsInline
              aria-label="Equipamento Hakon 4D"
            />
            <button
              type="button"
              className="locacao-video-sound-btn"
              onClick={toggleSound}
              aria-label={muted ? 'Ativar som do vídeo' : 'Silenciar vídeo'}
            >
              {muted ? '🔇' : '🔊'}
            </button>
          </div>
        </div>
      </section>

      <section className="locacao-inclusos">
        <div className="locacao-inclusos-grid">
          {inclusos.map((item) => (
            <div key={item} className="locacao-inclusos-item">
              <span className="locacao-check">✓</span>
              <span className="locacao-inclusos-label">{item}</span>
            </div>
          ))}
        </div>
      </section>

      <section id="valores" className="locacao-valores">
        <div className="section-header">
          <span className="section-eyebrow">Locação</span>
          <h2 className="locacao-valores-title">Valores da Diária</h2>
        </div>

        <div className="locacao-pricing-grid">
          {pricing.map((p) => (
            <div key={p.label} className="locacao-pricing-card">
              <div className="locacao-pricing-label">{p.label}</div>
              <div className="locacao-pricing-value">R$ {p.price}</div>
              <div className="locacao-pricing-note">{p.note}</div>
            </div>
          ))}
        </div>
      </section>

      <section id="reservar" className="locacao-cta">
        <span className="section-eyebrow">Disponibilidade Limitada</span>
        <h2 className="locacao-cta-title">Reserve o Hakon 4D para sua clínica</h2>
        <p className="locacao-cta-subtitle">
          Entre em contato para verificar disponibilidade de datas e agendar
          a entrega do equipamento.
        </p>
        <a
          href={WHATSAPP_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="locacao-btn-primary locacao-cta-btn"
        >
          FALAR COM A EQUIPE
        </a>
      </section>

      <footer className="locacao-footer">
        © {new Date().getFullYear()} MR Laser. Locação de equipamentos
        sujeita a disponibilidade e avaliação técnica.
      </footer>
    </div>
  );
};

export default LocacaoHakon;
