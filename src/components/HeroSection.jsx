import React from 'react';
import '../styles/HeroSection.css';
import { useSiteContent } from '../context/SiteContentContext';

const WHATSAPP_LINK = 'https://wa.me/5513996753432?text=Olá%20MR%20Laser!%20Gostaria%20de%20agendar%20uma%20avaliação%20gratuita.';
const MAPS_LINK = 'https://www.google.com/maps/place/MR+LASER+CONCEPT+-+(Depila%C3%A7%C3%A3o+a+Laser,+Cursos+e+Loca%C3%A7%C3%B5es)/@-23.9638198,-46.3850562,17z/data=!3m1!4b1!4m6!3m5!1s0x94ce1d579379aff5:0xaa204b6d027dab84!8m2!3d-23.9638198!4d-46.3850562!16s%2Fg%2F11v19c56_0?entry=ttu&g_ep=EgoyMDI2MDcxNS4wIKXMDSoASAFQAw%3D%3D';

const HeroSection = () => {
  const { content } = useSiteContent();

  return (
    <section className="hero" id="home">
      <div className="hero-lines" aria-hidden="true"></div>
      <div className="hero-letter" aria-hidden="true">M</div>

      <div className="hero-inner">
        <div className="hero-content">
          <div className="hero-eyebrow">
            <div className="hero-eyebrow-line"></div>
            <span>{content.hero_eyebrow ?? 'Sua Clínica de Depilação a Laser em São Vicente'}</span>
          </div>

          <h1 className="hero-title">
            {content.hero_title ?? 'A ciência da beleza, com a delicadeza que você merece.'}
          </h1>

          <p className="hero-subtitle">
            {content.hero_address ?? 'R. Benjamin Constant, 61, Sala 515 - Centro, São Vicente (Helbor Offices)'}
          </p>

          <a
            href={MAPS_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="hero-location-btn"
          >
            📍 ABRIR LOCALIZAÇÃO
          </a>

          <div className="hero-buttons">
            <a
              href="/cliente/agendar"
              className="btn btn-primary"
              target="_blank"
              rel="noopener noreferrer"
            >
              AGENDA ONLINE
            </a>
            <a
              href={WHATSAPP_LINK}
              className="btn btn-secondary"
              target="_blank"
              rel="noopener noreferrer"
            >
              CHAMAR NO WHATSAPP
            </a>
          </div>
        </div>

        <div className="hero-photo">
          <img src={content.hero_photo_url ?? '/images/mel-sobre.png'} alt="Mel Rodrigues" />
        </div>
      </div>

      <div className="hero-bottom-line" aria-hidden="true"></div>
    </section>
  );
};

export default HeroSection;
