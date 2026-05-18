// src/features/landing/components/RoadmapSection.jsx
import React from 'react';

const TOMATO = '#e8472a';

function RoadmapSection() {
  return (
    <section id="roadmap" className="py-20 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        <h2 className="text-5xl font-bold text-slate-900 text-center mb-16">
          Roadmap
        </h2>

        <div
          className="relative pl-8 space-y-12"
          style={{ borderLeft: `2px solid ${TOMATO}` }}
        >

          {/* Fase 01 */}
          <div className="relative">
            <div
              className="absolute top-2 w-6 h-6 rounded-full border-4 border-white shadow-md"
              style={{ left: '-33px', backgroundColor: TOMATO }}
            />
            <span className="font-bold text-sm uppercase" style={{ color: TOMATO }}>
              Fase 01
            </span>
            <h3 className="text-slate-900 text-3xl font-bold mt-2">Lanzamiento Beta</h3>
            <p className="text-lg mt-2 font-medium" style={{ color: TOMATO }}>Q4 2025</p>
            <p className="text-slate-500 mt-4">
              Lanzamiento de la versión beta con gestión de íconos, autenticación y organización básica de escritorio.
            </p>
          </div>

          {/* Fase 02 */}
          <div className="relative">
            <div
              className="absolute top-2 w-6 h-6 rounded-full border-4 border-white shadow-md"
              style={{ left: '-33px', backgroundColor: TOMATO }}
            />
            <span className="font-bold text-sm uppercase" style={{ color: TOMATO }}>
              Fase 02
            </span>
            <h3 className="text-slate-900 text-3xl font-bold mt-2">Integración de IA</h3>
            <p className="text-lg mt-2 font-medium" style={{ color: TOMATO }}>Q2 2026</p>
            <p className="text-slate-500 mt-4">
              Implementación del widget de IA, "Mejorar con IA" para notas y el editor de fragmentos de código.
            </p>
          </div>

          {/* Fase 03 */}
          <div className="relative">
            <div
              className="absolute top-2 w-6 h-6 rounded-full border-4 border-white shadow-md"
              style={{ left: '-33px', backgroundColor: TOMATO }}
            />
            <span className="font-bold text-sm uppercase" style={{ color: TOMATO }}>
              Fase 03
            </span>
            <h3 className="text-slate-900 text-3xl font-bold mt-2">Colaboración y Apps Móviles</h3>
            <p className="text-lg mt-2 font-medium" style={{ color: TOMATO }}>Q4 2026</p>
            <p className="text-slate-500 mt-4">
              Lanzamiento de funciones colaborativas en tiempo real y aplicaciones nativas para iOS y Android.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}

export default RoadmapSection;