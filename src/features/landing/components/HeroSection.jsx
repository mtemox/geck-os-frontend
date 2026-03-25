// src/components/landing/HeroSection.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

function HeroSection() {
  const navigate = useNavigate();

  return (
    // --- Estructura del Hero (Punto 5 de tu plan) ---
    <section 
      // 'id="home"' es CRUCIAL para que el link "Inicio" del Navbar funcione
      id="home" 
      // 'min-h-screen' hace que ocupe toda la altura de la pantalla
      // 'flex items-center' centra el contenido verticalmente
      // 'relative' permite posicionar el dragón de fondo
      className="min-h-screen flex items-center justify-center 
                 bg-gradient-to-br from-black via-gray-900 to-red-900 
                 relative overflow-hidden"
    >

      
      {/* --- Dragón de Fondo Decorativo --- */}
      <div className="absolute inset-0 opacity-10" aria-hidden="true">
        {/* Usamos tu idea del emoji gigante.
          'absolute -right-40 -top-20' lo saca de la pantalla
          'select-none' evita que se pueda seleccionar el emoji
        */}
        <span 
          className="text-[40rem] absolute -right-40 -top-20 select-none"
        >
          🐉
        </span>

        {/* --- Forma Decorativa Circular Rotada (SVG) --- */}
        <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <svg 
            width="600" 
            height="600" 
            viewBox="0 0 612 612" 
            className="opacity-20"
            style={{ transform: 'rotate(-15deg)' }}
          >
            <rect 
              x="0" 
              y="0" 
              width="612" 
              height="612" 
              rx="60" 
              fill="#DC2626" 
            />
          </svg>
        </div>

      </div>
      
      {/* --- Formas Decorativas Adicionales --- */}
      <div className="absolute top-20 right-20 opacity-10">
        <svg width="200" height="200" viewBox="0 0 200 200">
          <circle cx="100" cy="100" r="80" fill="#FFFFFF" />
        </svg>
      </div>

      <div className="absolute bottom-32 left-20 opacity-10">
        <svg width="150" height="150" viewBox="0 0 150 150">
          <rect x="10" y="10" width="130" height="130" rx="20" fill="#DC2626" />
        </svg>
      </div>

      {/* --- Contenido Principal --- */}
      {/* 'relative z-10' lo pone POR ENCIMA del dragón de fondo */}
      <div className="relative z-10 text-center px-4 max-w-4xl">
        {/* Contenedor del texto con disposición vertical */}
        <div className="flex flex-col items-center space-y-2">
          
          {/* Título principal - GRANDE y CENTRADO */}
          <h1 
            className="text-8xl md:text-[10rem] font-black text-white leading-none" 
            style={{ 
              letterSpacing: '-0.06em',
              lineHeight: '0.85'
            }}
          >
            MiDesk
          </h1>
          
          {/* Subtítulo - Más pequeño y espaciado */}
          <p className="text-white text-2xl md:text-4xl uppercase tracking-widest mt-8">
            as of 30 Nov, 2025
          </p>
          
        </div>
        
        {/* Botón CTA - Más abajo */}
        <div className="mt-16">
          <button 
            onClick={() => navigate('/register')}
            className="bg-red-600 hover:bg-red-700 text-white 
                      px-12 py-5 rounded-full text-xl font-bold
                      transition-all duration-300 transform hover:scale-105
                      shadow-2xl shadow-red-600/50"
          >
            Comenzar Ahora
          </button>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;