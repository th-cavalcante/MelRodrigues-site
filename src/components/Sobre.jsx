import React from 'react';
import '../styles/Sobre.css';
import { useSiteContent } from '../context/SiteContentContext';

const Sobre = () => {
  const { content } = useSiteContent();

  const aboutStats = [
    { value: content.sobre_stat_1_value ?? '12', label: content.sobre_stat_1_label ?? 'Anos de experiência' },
    { value: content.sobre_stat_2_value ?? '15k+', label: content.sobre_stat_2_label ?? 'Procedimentos realizados' },
    { value: content.sobre_stat_3_value ?? '98%', label: content.sobre_stat_3_label ?? 'Taxa de recomendação' },
  ];

  return (
    <section className="sobre" id="sobre">
      <div className="sobre-text">
        <span className="section-eyebrow">Sobre a Clínica</span>
        <h2 className="section-title">{content.sobre_title ?? 'Onde técnica e sensibilidade se encontram'}</h2>
        <p className="sobre-paragraph">
          {content.sobre_paragraph_1 ??
            'A MR Laser nasceu do desejo de oferecer estética avançada em um ambiente acolhedor e sem pressa. Nossa equipe combina equipamentos de última geração com protocolos individualizados, para que cada cliente viva uma experiência tão cuidadosa quanto o resultado que busca.'}
        </p>
        <p className="sobre-paragraph">
          {content.sobre_paragraph_2 ??
            'Acreditamos que verdadeira sofisticação está nos detalhes — no acolhimento da recepção, na escuta da avaliação, na precisão de cada procedimento.'}
        </p>
      </div>

      <div className="sobre-stats">
        {aboutStats.map((stat) => (
          <div key={stat.label} className="sobre-stat">
            <div className="sobre-stat-value">{stat.value}</div>
            <div className="sobre-stat-label">{stat.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Sobre;
