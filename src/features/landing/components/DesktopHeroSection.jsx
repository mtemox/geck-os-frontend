// src/features/landing/components/DesktopHeroSection.jsx
//
// PROBLEMA ORIGINAL:
//   - El fondo era un div con background-image CSS → el navegador NO puede
//     aplicar fetchpriority a CSS backgrounds → LCP de 7-8s.
//   - Los 3 botones del selector tenían background-image CSS también →
//     win_ni.jpg (7MB) se descargaba SIEMPRE, aunque el usuario nunca
//     cambiara de fondo.
//
// SOLUCIÓN:
//   - El fondo principal pasa a ser un <img> con fetchpriority="high"
//     → el navegador lo descarga antes que CSS y fuentes.
//   - Los wallpapers alternativos solo se precargan cuando el usuario
//     hace hover/focus/click en el botón correspondiente.
//   - win_ni.jpg (7MB) ya NO se descarga en la carga inicial.

import React, { useState, useCallback } from 'react';
import DesktopIcon from './DesktopIcon';
import LandingWindow from './LandingWindow';

// Solo importamos el fondo 1 (LCP). Los otros dos se resuelven on-demand.
import wp1 from '../../../assets/wallpapers/mi-fondo.jpg';

const WP2_URL = new URL('../../../assets/wallpapers/win_ni.jpg',     import.meta.url).href;
const WP3_URL = new URL('../../../assets/wallpapers/windows_2.jpg',  import.meta.url).href;

const WALLPAPERS = [
  { src: wp1,     label: 'Seleccionar fondo 1' },
  { src: WP2_URL, label: 'Seleccionar fondo 2' },
  { src: WP3_URL, label: 'Seleccionar fondo 3' },
];

function DesktopHeroSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [preloaded, setPreloaded]       = useState(() => new Set([wp1]));

  const preloadImage = useCallback((src) => {
    if (preloaded.has(src)) return;
    const img  = new Image();
    img.src    = src;
    setPreloaded((prev) => new Set([...prev, src]));
  }, [preloaded]);

  const handleSelect = (index) => {
    preloadImage(WALLPAPERS[index].src);
    setCurrentIndex(index);
  };

  const currentSrc = WALLPAPERS[currentIndex].src;
  const isFirst    = currentIndex === 0;

  return (
    <section id="home" className="min-h-screen relative overflow-hidden">

      {/*
        <img> real en lugar de background-image CSS.

        fetchpriority="high" → el navegador lo descarga con máxima prioridad,
        antes que scripts y fuentes no críticas.
        decoding="sync" en el LCP → el navegador no retrasa el paint.

        object-fit: cover + object-position: center = bg-cover bg-center.
      */}
      <img
        key={currentSrc}
        src={currentSrc}
        alt=""
        aria-hidden="true"
        fetchpriority={isFirst ? 'high' : 'auto'}
        decoding={isFirst ? 'sync' : 'async'}
        className="absolute inset-0 w-full h-full"
        style={{
          objectFit:      'cover',
          objectPosition: 'center',
          transition:     isFirst ? 'none' : 'opacity 0.7s ease',
        }}
      />

      {/* Contenido hero */}
      <div className="relative z-10 w-full h-screen p-4 md:p-8 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <LandingWindow />
          <DesktopIcon />
        </div>
      </div>

      {/* Selector de fondos */}
      <div className="absolute z-20 bottom-5 right-5 flex space-x-2 bg-black/50 p-2 rounded-lg backdrop-blur-sm">
        {WALLPAPERS.map((wp, index) => {
          const isActive     = currentIndex === index;
          const isThumbnail  = index === 0 || preloaded.has(wp.src);

          return (
            <button
              key={index}
              onClick={() => handleSelect(index)}
              onMouseEnter={() => preloadImage(wp.src)}
              onFocus={() => preloadImage(wp.src)}
              className="w-10 h-10 rounded-md transition-all border-2"
              style={{
                backgroundImage:    isThumbnail ? `url(${wp.src})` : 'none',
                backgroundColor:    isThumbnail ? 'transparent' : '#374151',
                backgroundSize:     'cover',
                backgroundPosition: 'center',
                borderColor:        isActive ? '#e8472a' : 'transparent',
                opacity:            isActive ? 1 : 0.6,
                transform:          isActive ? 'scale(1.1)' : 'scale(1)',
              }}
              aria-label={wp.label}
              aria-pressed={isActive}
            />
          );
        })}
      </div>
    </section>
  );
}

export default DesktopHeroSection;