import React from 'react';
import '../styles/Resultados.css';

const resultStats = [
  { value: '92%', label: 'Satisfação com o resultado percebido' },
  { value: '4–6', label: 'Sessões em média até resultado visível' },
  { value: '98%', label: 'Recomendariam a clínica a uma amiga' },
];

const Resultados = () => {
  return (
    <section className="resultados" id="resultados">
      <span className="section-eyebrow">Resultados</span>
      <h2 className="section-title">Antes e depois, medidos em confiança</h2>

      <div className="resultados-grid">
        {resultStats.map((rs, i) => (
          <div
            key={rs.label}
            className={`resultado-item ${i < resultStats.length - 1 ? 'has-border' : ''}`}
          >
            <div className="resultado-value">{rs.value}</div>
            <div className="resultado-label">{rs.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Resultados;
