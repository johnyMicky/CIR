import React from 'react';
import Hero from '../components/Hero';
import About from '../components/About';
import Services from '../components/Services';
import Features from '../components/Features';
import Process from '../components/Process';
import Stats from '../components/Stats';
import FAQSection from '../components/FAQSection';
import SecuritySection from '../components/SecuritySection';
import PartnerIcons from '../components/PartnerIcons';

const Home = () => {
  return (
    <main>
      <Hero />
      <PartnerIcons />
      <About />
      <SecuritySection />
      <Services />
      <Features />
      <Stats />
      <Process />
      <FAQSection />
    </main>
  );
};

export default Home;
