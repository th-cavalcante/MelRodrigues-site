import React, { useEffect, useState } from 'react';
import '../styles/FAQ.css';
import { fetchSiteFaq } from '../lib/siteContent';

const FAQ = () => {
  const [faqs, setFaqs] = useState([]);
  const [openIndex, setOpenIndex] = useState(0);

  useEffect(() => {
    fetchSiteFaq()
      .then(setFaqs)
      .catch((err) => console.error('Erro ao carregar perguntas frequentes:', err));
  }, []);

  const toggleFaq = (i) => {
    setOpenIndex((current) => (current === i ? -1 : i));
  };

  return (
    <section className="faq" id="faq">
      <div className="faq-container">
        <div className="section-header">
          <span className="section-eyebrow">Dúvidas Frequentes</span>
          <h2 className="section-title">Perguntas Frequentes</h2>
        </div>

        <div className="faq-list">
          {faqs.map((item, i) => {
            const isOpen = openIndex === i;
            return (
              <div key={item.id} className="faq-item">
                <button
                  className="faq-question"
                  onClick={() => toggleFaq(i)}
                  aria-expanded={isOpen}
                >
                  <span>{item.question}</span>
                  <span className="faq-icon">{isOpen ? '–' : '+'}</span>
                </button>
                {isOpen && (
                  <div className="faq-answer">
                    <p>{item.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
