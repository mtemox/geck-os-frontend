// src/pages/LandingPage.jsx
import React from 'react';

import Navbar from '../components/Navbar';
import DesktopHeroSection from '../components/DesktopHeroSection';
import FeaturesSection from '../components/FeaturesSection';
import RoadmapSection from '../components/RoadmapSection';
import Footer from '../components/Footer';

// 1. Importaremos el Navbar aquí (próximo paso)
// import Navbar from '../components/landing/Navbar';

// 2. Importaremos la sección Hero aquí
// import HeroSection from '../components/landing/HeroSection';

// 3. Importaremos las Características aquí
// import FeaturesSection from '../components/landing/FeaturesSection';

// 4. Importaremos el Roadmap aquí
// import RoadmapSection from '../components/landing/RoadmapSection';

// 5. Importaremos el Footer aquí
// import Footer from '../components/landing/Footer';

function LandingPage() {

  return (
    // Usamos bg-black como fondo base de toda la página
    <div className="bg-black text-white">
      
      {/* 2. Añadimos el componente (¡descomentamos la etiqueta!) */}
      <Navbar />
      
      <main>
        {/* (Secciones... ) */}
        <DesktopHeroSection />
        <FeaturesSection />
        <RoadmapSection />
        <Footer />
      </main>

      {/* (Footer... ) */}

      {/* 3. Modificamos el texto de prueba para ver el cambio */}
      <div className="h-screen pt-20 p-10"> {/* Añadimos 'h-screen' y 'pt-20' */}
        <h1 className="text-white text-3xl">
          Contenido de LandingPage.jsx
        </h1>
        <p>El Navbar ya está cargado y es fijo.</p>
        <p>(Añadí 'pt-20' aquí para que este texto no quede oculto *detrás* del navbar fijo)</p>
      </div>

    </div>
  );
}

export default LandingPage;