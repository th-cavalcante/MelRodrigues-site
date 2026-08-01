import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Navbar.css';

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleNavClick = () => {
    setMobileMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo">
          <img src="/images/logo.png" alt="MR Laser" />
        </div>

        <div
          className={`hamburger ${mobileMenuOpen ? 'active' : ''}`}
          onClick={toggleMobileMenu}
        >
          <span></span>
          <span></span>
          <span></span>
        </div>

        <ul className={`nav-menu ${mobileMenuOpen ? 'active' : ''}`}>
          <li className="nav-item">
            <Link to="/valores" className="nav-link" onClick={handleNavClick}>Tabela de Preço</Link>
          </li>
          <li className="nav-item">
            <a href="#depoimentos" className="nav-link" onClick={handleNavClick}>Depoimentos</a>
          </li>
          <li className="nav-item">
            <a href="/cliente/agendar" target="_blank" rel="noopener noreferrer" className="nav-link" onClick={handleNavClick}>Agenda Online</a>
          </li>
          <li className="nav-item">
            <a href="/locacao-hakon" target="_blank" rel="noopener noreferrer" className="nav-link" onClick={handleNavClick}>Locação Hakon 4D</a>
          </li>
          <li className="nav-item">
            <a href="/cursos" target="_blank" rel="noopener noreferrer" className="nav-link" onClick={handleNavClick}>Cursos</a>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
