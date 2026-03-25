// src/components/landing/DesktopHeroSection.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DesktopIcon from './DesktopIcon';
import LandingWindow from './LandingWindow';

// 1. IMPORTAMOS LOS FONDOS "QUEMADOS"
import wp1 from '../../../assets/wallpapers/mi-fondo.jpg';
import wp2 from '../../../assets/wallpapers/win_ni.jpg';
import wp3 from '../../../assets/wallpapers/windows_2.jpg';

// 2. Creamos un array con los fondos importados
const wallpapers = [wp1, wp2, wp3];


function DesktopHeroSection() {
  const navigate = useNavigate();
  const [currentBg, setCurrentBg] = useState(wallpapers[0]);

  return (
    <section 
      id="home" 
      className="min-h-screen relative overflow-hidden"
    >
      
      {/* --- Fondo de Pantalla (Sigue igual) --- */}
      <div 
        className="absolute inset-0 w-full h-full bg-cover bg-center transition-all duration-1000"
        style={{ backgroundImage: `url(${currentBg})` }}
        aria-hidden="true"
      />

      {/* --- Contenido del Escritorio (Centrado) --- */}
      <div className="relative z-10 w-full h-screen p-4 md:p-8 
                      flex items-center justify-center">
        
        {/* --- 1. NUEVO CONTENEDOR (Wrapper) --- */}
        {/* Este 'div' agrupa la ventana y el ícono */}
        {/* 'flex-col' los apila verticalmente */}
        {/* 'items-center' los centra horizontalmente */}
        {/* 'space-y-4' les da espacio entre ellos */}
        <div className="flex flex-col items-center space-y-4">

          {/* --- 2. LA VENTANA --- */}
          {/* (Ahora está dentro del nuevo wrapper) */}
          <LandingWindow />

          {/* --- 3. EL ÍCONO (¡YA NO ES 'ABSOLUTE'!) --- */}
          {/* (Ahora está dentro del nuevo wrapper) */}
          <DesktopIcon />

          </div>
      
      </div>

      {/* --- Selector de Fondos (Sigue igual) --- */}
      <div className="absolute z-20 bottom-5 right-5 flex space-x-2 bg-black/50 p-2 rounded-lg backdrop-blur-sm">
        {wallpapers.map((wp, index) => (
          <button 
            key={index}
            onClick={() => setCurrentBg(wp)}
            className={`w-10 h-10 rounded-md bg-cover bg-center transition-all 
                        border-2 
                        ${currentBg === wp ? 'border-red-500 scale-110' : 'border-transparent opacity-60 hover:opacity-100'}`}
            style={{ backgroundImage: `url(${wp})` }}
            aria-label={`Seleccionar fondo ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}

export default DesktopHeroSection;