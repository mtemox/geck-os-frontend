// src/features/landing/components/DesktopIcon.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

// 1. IMPORTAMOS el ícono que preparaste
// Sube dos niveles ('../../') para llegar a 'src/assets/'
import iconImage from '../../../assets/logos/midesk.jpg';

// --- ¡Importante! ---
// Asegúrate de que la ruta de arriba ('../../assets/icons/icon-midesk-app.png')
// sea correcta y coincida con el nombre de tu archivo.

function DesktopIcon() {
  const navigate = useNavigate();

  return (
    // 2. ESTILOS DE ÍCONO DE ESCRITORIO
    // Usamos los mismos estilos de tu 'Icon.jsx' original
    // para que la simulación sea idéntica a tu app real.
    <div 
      onClick={() => navigate('/register')} // 3. ACCIÓN: Navega al registro
      className="w-20 h-24 flex flex-col items-center justify-start p-2 m-1 
                 cursor-pointer rounded-lg 
                 transition-all duration-150 
                 hover:bg-blue-500 hover:bg-opacity-30"
    >
      {/* 4. La imagen del ícono */}
      <img 
        src={iconImage} 
        alt="Comenzar Ahora" 
        className="w-12 h-12" 
      />
      
      {/* 5. El nombre del ícono */}
      <p className="text-white text-xs text-center mt-1 shadow-black/50 [text-shadow:_1px_1px_2px_var(--tw-shadow-color)]">
        Comenzar Ahora
      </p>
    </div>
  );
}

export default DesktopIcon;