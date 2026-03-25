// src/components/landing/RoadmapSection.jsx
import React from 'react';

function RoadmapSection() {
  return (
    // --- Estructura de la Sección (Punto 7 de tu plan) ---
    <section 
      // ID para el link del Navbar
      id="roadmap" 
      className="py-20 bg-gradient-to-b from-black to-gray-900"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* --- Título de la Sección --- */}
        <h2 className="text-5xl font-bold text-white text-center mb-16">
          Roadmap
        </h2>
        
        {/* --- Contenedor del Timeline Vertical --- */}
        {/* 'relative' es el padre para la línea y los círculos */}
        {/* 'border-l-2 border-red-500' es la LÍNEA ROJA principal */}
        {/* 'space-y-12' da espacio entre cada item del roadmap */}
        <div className="relative border-l-2 border-red-500 pl-8 space-y-12">
          
          {/* --- Item 1: Lanzamiento Beta (El que definiste) --- */}
          <div className="relative">
            {/* El CÍRCULO ROJO en la línea */}
            {/* 'absolute' lo saca del flujo */}
            {/* '-left-10' lo mueve 8 (del pl-8) + 2 (mitad del círculo) = 10 */}
            <div className="absolute -left-[33px] top-2 w-6 h-6 bg-red-500 rounded-full border-4 border-black"></div>
            
            <span className="text-red-400 font-bold text-sm uppercase">Fase 01</span>
            <h3 className="text-white text-3xl font-bold mt-2">Lanzamiento Beta</h3>
            <p className="text-red-400 text-lg mt-2">Q4 2025</p>
            <p className="text-gray-400 mt-4">
              Lanzamiento de la versión beta con gestión de íconos, autenticación y organización básica de escritorio.
            </p>
          </div>
          
          {/* --- Item 2: Integración de IA (Completado) --- */}
          <div className="relative">
            {/* Círculo */}
            <div className="absolute -left-[33px] top-2 w-6 h-6 bg-red-500 rounded-full border-4 border-black"></div>
            
            <span className="text-red-400 font-bold text-sm uppercase">Fase 02</span>
            <h3 className="text-white text-3xl font-bold mt-2">Integración de IA</h3>
            <p className="text-red-400 text-lg mt-2">Q2 2026</p>
            <p className="text-gray-400 mt-4">
              Implementación del widget de IA, "Mejorar con IA" para notas y el editor de fragmentos de código.
            </p>
          </div>

          {/* --- Item 3: Colaboración y Apps (Completado) --- */}
          <div className="relative">
            {/* Círculo */}
            <div className="absolute -left-[33px] top-2 w-6 h-6 bg-red-500 rounded-full border-4 border-black"></div>
            
            <span className="text-red-400 font-bold text-sm uppercase">Fase 03</span>
            <h3 className="text-white text-3xl font-bold mt-2">Colaboración y Apps Móviles</h3>
            <p className="text-red-400 text-lg mt-2">Q4 2026</p>
            <p className="text-gray-400 mt-4">
              Lanzamiento de funciones colaborativas en tiempo real y aplicaciones nativas para iOS y Android.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}

export default RoadmapSection;