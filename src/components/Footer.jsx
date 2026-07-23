import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Footer.css';
import { useSiteContent } from '../context/SiteContentContext';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { content } = useSiteContent();

  return (
    <footer className="footer" id="contato">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-column">
            <div className="footer-logo">
              <img src="/images/logo.png" alt="MR Laser" />
            </div>
            <p className="footer-description">
              {content.footer_description ?? 'Estética avançada, com o cuidado e a delicadeza que você merece.'}
            </p>
          </div>

          <div className="footer-column">
            <div className="footer-heading">Navegação</div>
            <div className="footer-links">
              <a href="#clinica">A Clínica</a>
              <a href="#sobre">Sobre</a>
              <Link to="/valores">Tabela de Preço</Link>
              <a href="#faq">FAQ</a>
            </div>
          </div>

          <div className="footer-column">
            <div className="footer-heading">Contato</div>
            <div className="footer-links footer-links-static">
              <span>{content.footer_address_line1 ?? 'R. Benjamin Constant, 61 - Sala 515, 5º andar'}</span>
              <span>{content.footer_address_line2 ?? 'Centro, São Vicente - SP, 11310-500'}</span>
              <span>{content.footer_phone ?? '(13) 99675-3432'}</span>
              <span>{content.footer_email ?? 'contato@melrodrigues.com.br'}</span>
            </div>
          </div>

          <div className="footer-column">
            <div className="footer-heading">Horário</div>
            <div className="footer-links footer-links-static">
              <span>{content.footer_hours_line1 ?? 'Seg – Sex: 9h às 19h'}</span>
              <span>{content.footer_hours_line2 ?? 'Sáb: 9h às 15h'}</span>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© {currentYear} MR Laser. Todos os direitos reservados.</span>
          <span>Sua Clínica de Serviços de Depilação a Laser em São Vicente</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
