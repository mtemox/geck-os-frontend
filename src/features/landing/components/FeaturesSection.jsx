// src/features/landing/components/FeaturesSection.jsx
import React from 'react';

function FeaturesSection() {
  return (
    <section id="features" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-5xl font-bold text-slate-900 text-center mb-16">
          ¿Por qué Geck-OS?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          <div
            className="rounded-lg p-8 shadow-sm transition-all duration-300 hover:scale-105 hover:shadow-lg border"
            style={{ backgroundColor: '#fff7f5', borderColor: '#e8472a33' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = '#e8472a'}
            onMouseLeave={e => e.currentTarget.style.borderColor = '#e8472a33'}
          >
            <div className="text-6xl mb-4">📁</div>
            <h3 className="text-xl font-bold uppercase mb-4" style={{ color: '#e8472a' }}>Organización</h3>
            <p className="text-slate-600">Mantén todos tus archivos, notas y enlaces organizados en un escritorio virtual unificado.</p>
          </div>

          <div
            className="rounded-lg p-8 shadow-sm transition-all duration-300 hover:scale-105 hover:shadow-lg border"
            style={{ backgroundColor: '#fff7f5', borderColor: '#e8472a33' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = '#e8472a'}
            onMouseLeave={e => e.currentTarget.style.borderColor = '#e8472a33'}
          >
            <div className="text-6xl mb-4">👥</div>
            <h3 className="text-xl font-bold uppercase mb-4" style={{ color: '#e8472a' }}>Colaborativo</h3>
            <p className="text-slate-600">Comparte tu escritorio, trabaja en notas en tiempo real y gestiona proyectos en equipo.</p>
          </div>

          <div
            className="rounded-lg p-8 shadow-sm transition-all duration-300 hover:scale-105 hover:shadow-lg border"
            style={{ backgroundColor: '#fff7f5', borderColor: '#e8472a33' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = '#e8472a'}
            onMouseLeave={e => e.currentTarget.style.borderColor = '#e8472a33'}
          >
            <div className="text-6xl mb-4">🤖</div>
            <h3 className="text-xl font-bold uppercase mb-4" style={{ color: '#e8472a' }}>Potenciado con IA</h3>
            <p className="text-slate-600">Mejora tus notas, recibe recomendaciones de herramientas y organiza tu código con asistencia de IA.</p>
          </div>

        </div>
      </div>
    </section>
  );
}

export default FeaturesSection;