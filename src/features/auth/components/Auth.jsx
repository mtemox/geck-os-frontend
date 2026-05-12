// src/features/auth/components/Auth.jsx
import React from 'react';
import dragonBg from '../../../assets/auth/fondo4.jpg'; // Asegúrate de tener la imagen aquí

function AuthLayout({ children, title }) {
  return (
    <div className="flex items-center justify-center min-h-screen relative overflow-hidden">

      {/* Fondo cielo con overlay */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url(${dragonBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      {/* Overlay gradiente suave */}
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-sky-900/30 via-sky-800/20 to-slate-900/60" />

      {/* Formulario */}
      <div className="relative z-10 w-full max-w-md px-8 py-10 space-y-6
                    bg-white/10 backdrop-blur-2xl
                    rounded-2xl shadow-2xl
                    border border-white/20">

        <h2 className="text-2xl font-semibold text-center text-white tracking-wide">
          {title}
        </h2>

        {children}
      </div>
    </div>
  );
}

export default AuthLayout;