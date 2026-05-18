import React from 'react';
import { useNavigate } from 'react-router-dom';

function HeroSection() {
  const navigate = useNavigate();

  return (
    <section 
      id="home" 
      className="min-h-screen flex items-center justify-center 
                 bg-gradient-to-br from-orange-50 via-white to-orange-100 
                 relative overflow-hidden"
    >
      {/* Formas Decorativas */}
      <div className="absolute inset-0 opacity-10" aria-hidden="true">
        <span className="text-[40rem] absolute -right-40 -top-20 select-none">🦎</span>
        <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <svg width="600" height="600" viewBox="0 0 612 612" className="opacity-20" style={{ transform: 'rotate(-15deg)' }}>
            <rect x="0" y="0" width="612" height="612" rx="60" fill="#F97316" />
          </svg>
        </div>
      </div>
      
      {/* Contenido Principal */}
      <div className="relative z-10 text-center px-4 max-w-4xl">
        <div className="flex flex-col items-center space-y-2">
          <h1 
            className="text-8xl md:text-[10rem] font-black text-slate-900 leading-none" 
            style={{ letterSpacing: '-0.06em', lineHeight: '0.85' }}
          >
            Geck-OS
          </h1>
          <p className="text-orange-600 text-2xl md:text-4xl uppercase tracking-widest mt-8 font-semibold">
            Tu Escritorio Virtual. Reinventado.
          </p>
        </div>
        
        <div className="mt-16">
          <button 
            onClick={() => navigate('/register')}
            className="bg-orange-500 hover:bg-orange-600 text-white 
                      px-12 py-5 rounded-full text-xl font-bold
                      transition-all duration-300 transform hover:scale-105
                      shadow-2xl shadow-orange-500/50"
          >
            Comenzar Ahora
          </button>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;