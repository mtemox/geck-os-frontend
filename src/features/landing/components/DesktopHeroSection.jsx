// src/features/landing/components/DesktopHeroSection.jsx
import React, { useState, useEffect } from 'react';
import DesktopIcon from './DesktopIcon';
import LandingWindow from './LandingWindow';

import wp1 from '../../../assets/wallpapers/mi-fondo.jpg';
import wp2 from '../../../assets/wallpapers/win_ni.jpg';
import wp3 from '../../../assets/wallpapers/windows_2.jpg';

const wallpapers = [wp1, wp2, wp3];

function DesktopHeroSection() {
  const [currentBg, setCurrentBg] = useState(wallpapers[0]);
  const [loaded, setLoaded] = useState(false);

  // Precargar solo el primer fondo para no bloquear LCP
  useEffect(() => {
    const img = new Image();
    img.src = wallpapers[0];
    img.onload = () => setLoaded(true);
  }, []);

  return (
    <section id="home" className="min-h-screen relative overflow-hidden">

      {/* Fondo — solo se muestra cuando cargó para evitar CLS */}
      <div
        className="absolute inset-0 w-full h-full bg-cover bg-center transition-all duration-1000"
        style={{
          backgroundImage: loaded ? `url(${currentBg})` : 'none',
          backgroundColor: '#1e293b', // placeholder oscuro mientras carga
        }}
        aria-hidden="true"
      />

      {/* Contenido */}
      <div className="relative z-10 w-full h-screen p-4 md:p-8 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <LandingWindow />
          <DesktopIcon />
        </div>
      </div>

      {/* Selector de fondos */}
      <div className="absolute z-20 bottom-5 right-5 flex space-x-2 bg-black/50 p-2 rounded-lg backdrop-blur-sm">
        {wallpapers.map((wp, index) => (
          <button
            key={index}
            onClick={() => setCurrentBg(wp)}
            className="w-10 h-10 rounded-md bg-cover bg-center transition-all border-2"
            style={{
              backgroundImage: `url(${wp})`,
              borderColor: currentBg === wp ? '#e8472a' : 'transparent',
              opacity: currentBg === wp ? 1 : 0.6,
              transform: currentBg === wp ? 'scale(1.1)' : 'scale(1)',
            }}
            aria-label={`Seleccionar fondo ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}

export default DesktopHeroSection;