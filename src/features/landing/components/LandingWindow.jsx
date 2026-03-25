// src/components/landing/LandingWindow.jsx
import React from 'react';

function LandingWindow() {
  return (
    // --- 1. Contenedor de la Ventana ---
    // Usamos el 'glassmorphism' que nos gusta: fondo semi-transparente y blur
    // 'animate-scale-in' es la animación que definimos en tailwind.config.js
    <div 
      className="w-full max-w-4xl bg-gray-900/70 backdrop-blur-md 
                 rounded-lg shadow-2xl border border-white/10
                 animate-scale-in"
    >
      
      {/* --- 2. Barra de Título --- */}
      <div 
        className="flex justify-between items-center bg-gray-800/80 
                   rounded-t-lg py-2 px-4"
      >
        {/* Botones Falsos (Estilo macOS, son más fáciles de hacer) */}
        <div className="flex space-x-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
        </div>
        
        {/* Título de la Ventana */}
        <span className="text-gray-300 text-sm">
          Bienvenido a MiDesk
        </span>
        
        {/* Espaciador (para centrar el título) */}
        <div className="w-14"></div>
      </div>
      
      {/* --- 3. Área de Contenido --- */}
      <div className="p-8 md:p-12 text-center">
        
        {/* Reusamos tu diseño de texto anterior */}
        <div className="flex flex-col items-center space-y-2">
          <h1 
            className="text-7xl md:text-9xl font-black text-white leading-none" 
            style={{ 
              letterSpacing: '-0.06em',
              lineHeight: '0.85'
            }}
          >
            MiDesk
          </h1>
          
          <p className="text-white text-xl md:text-2xl uppercase tracking-widest pt-4">
            Tu Escritorio Virtual. Reinventado.
          </p>
        </div>
      </div>
      
    </div>
  );
}

export default LandingWindow;