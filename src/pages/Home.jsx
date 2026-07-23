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

const Home = () => {
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
