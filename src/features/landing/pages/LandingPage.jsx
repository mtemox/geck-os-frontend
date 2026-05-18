// src/features/landing/pages/LandingPage.jsx
import React, { useEffect } from 'react';
import Navbar from '../components/Navbar';
import DesktopHeroSection from '../components/DesktopHeroSection';
import FeaturesSection from '../components/FeaturesSection';
import RoadmapSection from '../components/RoadmapSection';
import Footer from '../components/Footer';

function LandingPage() {
  useEffect(() => {
    // ── Meta SEO ──────────────────────────────────────────────────────────
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'description';
      document.head.appendChild(meta);
    }
    meta.content = 'Geck-OS: Tu escritorio virtual reinventado. Organiza archivos, colabora en tiempo real y potencia tu productividad con IA.';

    document.title = 'Geck-OS — Tu Escritorio Virtual Reinventado';

    const ogTags = [
      { property: 'og:title', content: 'Geck-OS — Tu Escritorio Virtual' },
      { property: 'og:description', content: 'Organiza, colabora y potencia tu trabajo con IA en un escritorio virtual unificado.' },
      { property: 'og:type', content: 'website' },
    ];
    ogTags.forEach(({ property, content }) => {
      let tag = document.querySelector(`meta[property="${property}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('property', property);
        document.head.appendChild(tag);
      }
      tag.content = content;
    });

    /*
      PRECONNECT para recursos que se cargarán luego (Stripe, fuentes).
      Esto reduce el tiempo de DNS + TCP + TLS handshake cuando se necesiten.
      Los origins de Stripe se añaden aquí (no en index.html) para no penalizar
      a páginas que no los necesitan.

      Lighthouse reportaba:
        - https://m.stripe.network → 90ms de ahorro en LCP
        - https://js.stripe.com    → 80ms de ahorro en LCP

      Con preconnect se establece la conexión anticipada pero la descarga
      del JS no ocurre hasta que el usuario abra el modal de pago.
    */
    const preconnects = [
      'https://m.stripe.network',
      'https://js.stripe.com',
    ];

    const addedLinks = [];
    preconnects.forEach((href) => {
      if (!document.querySelector(`link[rel="preconnect"][href="${href}"]`)) {
        const link = document.createElement('link');
        link.rel = 'preconnect';
        link.href = href;
        link.crossOrigin = 'anonymous';
        document.head.appendChild(link);
        addedLinks.push(link);
      }
    });

    return () => {
      document.title = 'Geck-OS';
      // Limpiamos los preconnect al salir de la landing
      addedLinks.forEach((link) => link.remove());
    };
  }, []);

  return (
    <div
      className="bg-white text-slate-900 font-sans"
      style={{ overflowY: 'auto', height: '100vh' }}
    >
      <Navbar />
      <main>
        <DesktopHeroSection />
        <FeaturesSection />
        <RoadmapSection />
      </main>
      <Footer />
    </div>
  );
}

export default LandingPage;