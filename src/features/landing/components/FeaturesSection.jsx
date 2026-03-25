// src/components/landing/FeaturesSection.jsx
import React from 'react';

function FeaturesSection() {
  return (
    // --- Estructura de la Sección (Punto 6 de tu plan) ---
    <section 
      // ID para el link del Navbar
      id="features" 
      className="py-20 bg-black"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* --- Título de la Sección --- */}
        <h2 className="text-5xl font-bold text-white text-center mb-16">
          ¿Por qué MiDesk?
        </h2>
        
        {/* --- Grid Responsivo para las Tarjetas --- */}
        {/* 1 columna en móvil, 3 en desktop */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* --- Tarjeta 1: Organización (La que definiste) --- */}
          <div className="bg-gray-900 border border-red-500/30 rounded-lg p-8 
                          hover:border-red-500 transition-colors duration-300
                          transform hover:scale-105">
            {/* Icono (Emoji) */}
            <div className="text-6xl mb-4">📁</div>
            <h3 className="text-red-400 text-xl font-bold uppercase mb-4">
              Organización
            </h3>
            <p className="text-gray-300">
              Mantén todos tus archivos, notas y enlaces organizados en un escritorio virtual unificado.
            </p>
          </div>
          
          {/* --- Tarjeta 2: Colaboración (Completada) --- */}
          <div className="bg-gray-900 border border-red-500/30 rounded-lg p-8 
                          hover:border-red-500 transition-colors duration-300
                          transform hover:scale-105">
            {/* Icono (Emoji) */}
            <div className="text-6xl mb-4">👥</div>
            <h3 className="text-red-400 text-xl font-bold uppercase mb-4">
              Colaborativo
            </h3>
            <p className="text-gray-300">
              Comparte tu escritorio, trabaja en notas en tiempo real y gestiona proyectos en equipo.
            </p>
          </div>

          {/* --- Tarjeta 3: IA Inteligente (Completada) --- */}
          <div className="bg-gray-900 border border-red-500/30 rounded-lg p-8 
                          hover:border-red-500 transition-colors duration-300
                          transform hover:scale-105">
            {/* Icono (Emoji) */}
            <div className="text-6xl mb-4">🤖</div>
            <h3 className="text-red-400 text-xl font-bold uppercase mb-4">
              Potenciado con IA
            </h3>
            <p className="text-gray-300">
              Mejora tus notas, recibe recomendaciones de herramientas y organiza tu código con asistencia de IA.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}

export default FeaturesSection;