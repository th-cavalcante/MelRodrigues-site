import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/CuidadosSessao.css';

const CUIDADOS = [
  {
    titulo: 'Mantenha a raiz intacta',
    texto: 'Evite métodos que arranquem o pelo pela raiz (cera, pinça, linha, aparelhos elétricos).',
  },
  {
    titulo: 'Sem descolorir',
    texto: 'Suspenda o uso de pós descolorantes ou água oxigenada na região.',
  },
  {
    titulo: 'Zero sol',
    texto:
      'Evite exposição solar direta e bronzeamento (artificial ou por cremes) para não ativar a melanina 15 dias antes e depois da sessão.',
  },
  {
    titulo: 'Filtro solar',
    texto: 'Faça uso diário de protetor solar FPS 30 ou superior na região a ser tratada caso for ficar exposta.',
  },
  {
    titulo: 'Zero ácidos',
    texto:
      'Suspender o uso de ácidos renovadores (retinóico, glicólico, salicílico) ou clareadores na região a ser tratada 3 dias antes e depois da sessão.',
  },
  {
    titulo: 'Medicação',
    texto: 'Evitar o uso de antibiótico, anti-inflamatório ou medicamento fotossensibilizante 3 dias antes e depois da sessão.',
  },
  {
    titulo: 'Pele limpa',
    texto:
      'Evite usar desodorante, hidratante, óleo, perfume ou maquiagem na região a ser tratada no dia da sessão e, se possível, voltar a usar apenas no dia seguinte.',
  },
  {
    titulo: 'Nada de pelos compridos',
    texto:
      'No dia da sessão, o pelo deve estar apenas com a "pontinha" aparente, para isso, depile sempre 1-2 dias antes da sessão com uma lâmina nova. Caso sofra com alergias, associar um óleo de banho no lugar do sabonete em barra/líquido.',
  },
  {
    titulo: 'Temperatura',
    texto: 'Evite banhos muito quentes, saunas, termas e ambientes excessivamente abafados antes e depois da sessão.',
  },
  {
    titulo: 'Exercícios físicos',
    texto:
      'Evite treinos intensos que causem muito suor incluindo roupas muito apertadas ou tecidos sintéticos que abafem a região tratada (principalmente em regiões como virilha/interno de coxa/glúteos) imediatamente após a sessão.',
  },
  {
    titulo: 'Roupas soltas',
    texto: 'Vir com roupas leves e de algodão para evitar o atrito imediato pós-laser.',
  },
  {
    titulo: 'Hidratação',
    texto:
      'Usar cremes calmantes com Aloe Vera, Camomila, Alfa-bisabolol ou regeneradores (como CeraVe/Cetaphil/Bioderma/Neutrogena/Bepantol/Cicaplast) em todas as regiões tratadas, todos os dias durante o tratamento. Hidratar frequentemente reduz a sensibilidade durante as sessões e torna a pele mais receptiva ao laser, promovendo um resultado mais eficaz.',
  },
  {
    titulo: 'Esfoliação',
    texto:
      'Fazer leve esfoliação no dia seguinte para remover as pontinhas de pelo que foram carbonizadas após a sessão, isso evita alergias/coceiras e pode ser repetido sempre um dia após o uso da lâmina em casa.',
  },
];

const CuidadosSessao = () => (
  <div className="cuidados-page">
    <nav className="cuidados-nav">
      <Link to="/" className="cuidados-back">
        <span>←</span> Voltar à página principal
      </Link>
      <div className="cuidados-logo">
        <img src="/images/logo.png" alt="MR Laser" />
      </div>
    </nav>

    <section className="cuidados-header">
      <span className="section-eyebrow">Depilação a Laser</span>
      <h1 className="cuidados-title">Cuidados Pré e Pós-Sessão</h1>
      <p className="cuidados-subtitle">
        Siga estas orientações antes e depois de cada sessão para garantir sua segurança e o melhor resultado do tratamento.
      </p>
    </section>

    <section className="cuidados-content">
      <ul className="cuidados-list">
        {CUIDADOS.map((item) => (
          <li key={item.titulo} className="cuidados-item">
            <strong>{item.titulo}:</strong> {item.texto}
          </li>
        ))}
      </ul>
    </section>

    <footer className="cuidados-footer">
      © {new Date().getFullYear()} MR Laser. Em caso de dúvidas, fale com a equipe pelo WhatsApp.
    </footer>
  </div>
);

export default CuidadosSessao;
