import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchLaserServices, formatPrice } from '../lib/services';
import { fetchSiteCombos, fetchComplementaryCards } from '../lib/siteContent';
import '../styles/TabelaValores.css';

const WHATSAPP_LINK = 'https://wa.me/5511987654321?text=Olá%20MR%20Laser!%20Gostaria%20de%20agendar%20uma%20sessão.';

const initials = (name) => name.trim().charAt(0).toUpperCase();

const TabelaValores = () => {
  const [sessions, setSessions] = useState([]);
  const [combos, setCombos] = useState([]);
  const [complementaryCards, setComplementaryCards] = useState([]);

  useEffect(() => {
    fetchLaserServices().then(setSessions).catch((err) => console.error('Erro ao carregar tabela de preço:', err));
    fetchSiteCombos().then(setCombos).catch((err) => console.error('Erro ao carregar combos:', err));
    fetchComplementaryCards().then(setComplementaryCards).catch((err) => console.error('Erro ao carregar serviços complementares:', err));
  }, []);

  return (
    <div className="tabela-page">
      <nav className="tabela-nav">
        <Link to="/" className="tabela-back">
          <span>←</span> Voltar à página principal
        </Link>
        <div className="tabela-logo">
          <img src="/images/logo.png" alt="MR Laser" />
        </div>
      </nav>

      <section className="tabela-header">
        <span className="section-eyebrow">Depilação a Laser</span>
        <h1 className="tabela-title">Tabela de Preço</h1>
        <p className="tabela-subtitle">
          Sessões avulsas por região e pacotes combinados, com condição
          especial para pagamento em 2x sem juros.
        </p>
      </section>

      <section className="tabela-sessions">
        <div className="sessions-grid">
          {sessions.map((s) => (
            <div key={s.id} className="session-card">
              <div className="session-card-top">
                <div className="session-avatar">{initials(s.name)}</div>
                <div>
                  <div className="session-kicker">Sessão Avulsa</div>
                  <div className="session-name">{s.name}</div>
                  {s.note && <div className="session-note">{s.note}</div>}
                </div>
              </div>
              <div className="session-card-bottom">
                <div className="session-pricing">
                  2x <strong>R$ {formatPrice(s.installment)}</strong>
                  <br />
                  <span className="session-original">R$ {formatPrice(s.original)}</span>
                  <span className="session-price">R$ {formatPrice(s.price)}</span>
                </div>
                <Link
                  to={`/cliente/agendar?service=${encodeURIComponent(s.name)}`}
                  className="session-cta"
                >
                  AGENDAR
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="tabela-combos">
        <div className="combos-container">
          <div className="section-header">
            <span className="section-eyebrow">Combos</span>
            <h2 className="combos-title">Pacotes</h2>
          </div>

          <div className="combos-grid">
            {combos.map((c) => (
              <div key={c.id} className="combo-card">
                <div className="combo-label">{c.label}</div>
                <div className="combo-title">{c.title}</div>
                <div className="combo-from">De: R$ {formatPrice(c.price_from)}</div>
                <div className="combo-to">Por: R$ {formatPrice(c.price_to)}</div>
                <a
                  href={WHATSAPP_LINK}
                  className="combo-cta"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  AGENDAR SESSÃO
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="tabela-complementary">
        <div className="section-header">
          <span className="section-eyebrow">Além do Laser</span>
          <h2 className="complementary-title">Serviços Complementares</h2>
        </div>

        <div className="complementary-grid">
          {complementaryCards.map((card) => (
            <div key={card.id} className="complementary-card">
              <div className="complementary-card-title">{card.title}</div>
              {card.items.map((item) => (
                <div key={item.id} className="complementary-row">
                  <span>{item.label}</span>
                  <span className="complementary-row-price">{item.price}</span>
                </div>
              ))}
              <Link
                to={`/cliente/agendar?service=${encodeURIComponent(card.title)}`}
                className="complementary-cta"
              >
                AGENDAR
              </Link>
            </div>
          ))}
        </div>
      </section>

      <footer className="tabela-footer">
        © {new Date().getFullYear()} MR Laser. Valores sujeitos a avaliação
        individual.
      </footer>
    </div>
  );
};

export default TabelaValores;
