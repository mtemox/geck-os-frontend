// src/features/landing/components/DesktopIcon.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import iconImage from '../../../assets/logos/midesk.jpg';

function DesktopIcon() {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate('/register')}
      className="w-20 h-24 flex flex-col items-center justify-start p-2 m-1 cursor-pointer rounded-lg transition-all duration-150 hover:bg-white/20"
    >
      {/*
        Antes: la imagen era 1200x1200 mostrada a 48x48 → desperdicio de ~140 KB.
        Ahora: width/height explícitos + object-fit para que el navegador sepa
        exactamente el espacio reservado (evita CLS) y descargue solo lo necesario.
        loading="eager" porque está en el LCP hero, no debe diferirse.
      */}
      <img
        src={iconImage}
        alt="Comenzar con Geck-OS"
        width={48}
        height={48}
        className="w-12 h-12 object-contain rounded-lg"
        loading="eager"
        decoding="async"
        style={{ contentVisibility: 'auto' }}
      />
      <p className="text-white text-xs text-center mt-1 [text-shadow:_1px_1px_2px_rgba(0,0,0,0.8)]">
        Comenzar Ahora
      </p>
    </div>
  );
}

export default DesktopIcon;