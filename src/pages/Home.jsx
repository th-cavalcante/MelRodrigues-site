import React from 'react';
import Navbar from '../components/Navbar';
import HeroSection from '../components/HeroSection';
import Sobre from '../components/Sobre';
import AClinica from '../components/AClinica';
import Resultados from '../components/Resultados';
import Depoimentos from '../components/Depoimentos';
import FAQ from '../components/FAQ';
import Footer from '../components/Footer';
import { SiteContentProvider } from '../context/SiteContentContext';
import { usePageMeta } from '../hooks/usePageMeta';

const Home = () => {
  usePageMeta({
    title: 'Depilação a Laser em São Vicente | MR Laser Concept',
    description:
      'Clínica de depilação a laser em São Vicente - SP, no Centro. Equipamento Hakon 4D e atendimento personalizado. Agende pelo WhatsApp.',
    path: '/',
  });

  return (
    <SiteContentProvider>
      <div className="home">
        <Navbar />
        <HeroSection />
        <Sobre />
        <AClinica />
        <Resultados />
        <Depoimentos />
        <FAQ />
        <Footer />
      </div>
    </SiteContentProvider>
  );
};

export default Home;
