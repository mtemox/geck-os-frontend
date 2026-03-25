import React from 'react';
import dragonBg from '../../../assets/wallpapers/deg3.jpg'; // Asegúrate de tener la imagen aquí

function AuthLayout({ children, title }) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-black relative overflow-hidden">
      
      {/* --- FONDO CON IMAGEN Y DEGRADADO --- */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,1)), url(${dragonBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      {/* --- CONTENEDOR DEL FORMULARIO --- */}
      {/* Usamos un fondo negro semitransparente con borde rojo */}
      <div className="relative z-10 w-full max-w-md p-8 space-y-6 
                      bg-black/80 backdrop-blur-sm 
                      rounded-xl shadow-2xl border border-red-600/50">
        
        {/* Título con efecto de brillo rojo sutil */}
        <h2 className="text-3xl font-bold text-center text-white drop-shadow-[0_0_10px_rgba(220,38,38,0.8)]">
            {title}
        </h2>
        
        {children}
      </div>
    </div>
  );
}

export default AuthLayout;