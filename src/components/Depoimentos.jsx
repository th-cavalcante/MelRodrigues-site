import React from 'react';
import '../styles/Depoimentos.css';

const GOOGLE_REVIEWS_URL =
  'https://www.google.com/search?q=mel+rodrigues+-+depila%C3%A7%C3%A3o+a+laser&rlz=1C1FCXM_pt-PTBR999BR999&oq=&gs_lcrp=EgZjaHJvbWUqBggBEEUYOzIGCAAQRRg5MgYIARBFGDsyCggCEC4YsQMYgAQyBggDEEUYQTIGCAQQRRg8MgYIBRBFGDwyBggGEEUYPTIGCAcQRRhB0gEIMjI1MWowajeoAgCwAgA&sourceid=chrome&source=chrome.ob&ie=UTF-8#mpd=~5737841453426885847/customers/reviews';

const testimonials = [
  {
    name: 'Cris Dalia',
    meta: 'Local Guide · Há 2 dias',
    quote: 'Excelente! Mel é uma ótima profissional, competente, responsável, gentil e delicada no atendimento. Trata suas clientes com muito carinho e profissionalismo. Adoro! E recomendo! Ela realmente sabe o que faz e tem minha total confiança.',
  },
  {
    name: 'Laianny Rosendo',
    meta: 'Há 3 dias',
    quote: 'Muito bom! Tive ótimos resultados com um tratamento bem personalizado. A Mel é atenciosa e sempre esclareceu minhas dúvidas. Recomendo!',
  },
  {
    name: 'Vitoria',
    meta: 'Há 3 dias',
    quote: 'Excelente profissional! Muito atenciosa, cuidadosa e carinhosa em cada atendimento. Dá para perceber o quanto ela ama o que faz e se dedica. Me sinto sempre muito bem atendida e acolhida. Recomendo de olhos fechados! 💗',
  },
  {
    name: 'Lavínia Loche',
    meta: 'Há 41 semanas',
    quote: 'Atendimento super personalizado! A Mel além de ser uma ótima profissional, deixa os pacientes super confortáveis e explica tudo pra que não fiquemos com nenhuma dúvida sobre o procedimento. Indico demais!',
  },
  {
    name: 'Giovanna Cornachini',
    meta: 'Há 42 semanas',
    quote: 'Faço depilação a laser com a Mel e só tenho elogios! Além de ser super profissional e cuidadosa, ela é muito gente boa e deixa tudo mais leve durante o atendimento. O resultado está sendo ótimo e o atendimento é impecável. Recomendo de olhos fechados!',
  },
  {
    name: 'Mariana Franco Pessoal',
    meta: '3 avaliações · 6 de jul. de 2023',
    quote: 'Mãos de fadaaaa!!! Mel é uma das profissionais da área mais dedicadas que já vi, fora que é divertida então não tem como o procedimento (que as vezes temos vergonha de fazer) não ser absurdamente leve e descontraído!!!! Tô morando longe mas viajaria fácil só pra ser atendida por ela, nota 1000, recomendadíssimo!',
  },
  {
    name: 'Tina Feguoredo',
    meta: 'Local Guide · 4 de fev. de 2025',
    quote: 'Profissional dedicada, competente, pontual e acima de tudo gentil. Você que procura depilação a laser pode ir com os olhos fechados. Não troco por nada, virei fã!',
  },
  {
    name: 'Tatiana Andrade',
    meta: '12 de jun. de 2025',
    quote: 'Uma profissional de excelência, amooo nossos momentos de cuidados 😌 logo, logo livre dos pelinhos 👏👏👏',
  },
];

// Content is duplicated once so the CSS animation can loop seamlessly from -50% back to 0%.
const track = [...testimonials, ...testimonials];

const Depoimentos = () => {
  return (
    <section className="depoimentos" id="depoimentos">
      <div className="depoimentos-container">
        <div className="section-header">
          <span className="section-eyebrow">Depoimentos</span>
          <h2 className="section-title">Somos 5 estrelas no Google</h2>
          <div className="depoimentos-rating">
            <span className="depoimentos-stars">★★★★★</span>
            <span>5.0 · avaliações reais de clientes</span>
          </div>
        </div>

        <div className="depoimentos-marquee">
          <div className="depoimentos-track">
            {track.map((t, i) => (
              <div key={i} className="depoimentos-slide">
                <div className="depoimento-card">
                  <div className="depoimento-quote-mark">&ldquo;</div>
                  <div className="depoimento-stars">★★★★★</div>
                  <p className="depoimento-quote">{t.quote}</p>
                  <div className="depoimento-name">{t.name}</div>
                  <div className="depoimento-meta">{t.meta}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <a
          href={GOOGLE_REVIEWS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="depoimentos-google-link"
        >
          Ver todos os depoimentos no Google →
        </a>
      </div>
    </section>
  );
};

export default Depoimentos;
