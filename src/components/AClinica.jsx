import React from 'react';
import '../styles/AClinica.css';
import { useSiteContent } from '../context/SiteContentContext';

const AClinica = () => {
  const { content } = useSiteContent();

  return (
    <section className="a-clinica" id="clinica">
      <div className="a-clinica-container">
        <div className="section-header">
          <span className="section-eyebrow">Nosso Espaço</span>
          <h2 className="section-title">A Clínica</h2>
        </div>

        <div className="a-clinica-photo">
          <img src={content.clinica_photo_url ?? '/images/clinica-temp.jpg'} alt="Ambiente da clínica MR Laser" />
        </div>
      </div>
    </section>
  );
};

export default AClinica;
