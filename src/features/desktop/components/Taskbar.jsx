// src/features/desktop/components/Taskbar.jsx
import React, { useState, useEffect } from 'react';
import StartMenu from '../../desktop/components/StartMenu';
import { Menu, X, Settings, Circle } from 'lucide-react';

function Taskbar({ onOpenApp, openWindows = [], onMinimize, onFocus }) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [position, setPosition] = useState('bottom');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const timerId = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timerId);
  }, []);

  const timeString = currentTime.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit'
  });
  
  const dateString = currentTime.toLocaleDateString('es-ES', {
    weekday: 'short',
    day: '2-digit',
    month: 'short'
  });

  // Clases base mejoradas - MÁS FINO Y ELEGANTE
  const baseClasses = "fixed bg-black/40 backdrop-blur-2xl z-50 transition-all duration-300 ease-in-out text-white flex items-center border-white/10";

  let positionClasses = '';
  let containerClasses = '';
  let clockGroupClasses = '';

  switch (position) {
    case 'left':
      positionClasses = "left-0 top-0 h-full w-14 py-3 border-r"; 
      containerClasses = "flex-col justify-between h-full w-full items-center"; 
      clockGroupClasses = "flex flex-col-reverse items-center gap-3";
      break;

    case 'right':
      positionClasses = "right-0 top-0 h-full w-14 py-3 border-l";
      containerClasses = "flex-col justify-between h-full w-full items-center";
      clockGroupClasses = "flex flex-col-reverse items-center gap-3";
      break;
      
    default: // 'bottom' - MÁS FINO
      positionClasses = "bottom-0 left-0 w-full h-12 px-3 border-t";
      containerClasses = "flex-row justify-between w-full h-full items-center";
      clockGroupClasses = "flex flex-row items-center gap-3";
  }

  const handleChangePosition = () => {
    setPosition(current => current === 'bottom' ? 'left' : current === 'left' ? 'right' : 'bottom');
  };

  return (
    <>
      {/* Menú Inicio */}
      <StartMenu isVisible={isMenuOpen} onClose={() => setIsMenuOpen(false)} onOpenApp={onOpenApp} />

      {/* Barra de Tareas */}
      <div className={`${baseClasses} ${positionClasses}`}>
        
        <div className={`flex ${containerClasses}`}>
          
          {/* Sección Izquierda/Superior */}
          <div className="flex items-center gap-2">
            
            {/* Botón Inicio - Estilo macOS/Windows 11 */}
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`
                relative group h-9 w-9 rounded-lg flex items-center justify-center transition-all duration-200
                ${isMenuOpen 
                  ? 'bg-white/20 shadow-lg shadow-purple-500/20' 
                  : 'hover:bg-white/10'}
              `}
              title="Inicio"
            >
              {/* Icono con efecto */}
              <div className={`transition-transform duration-200 ${isMenuOpen ? 'rotate-90 scale-110' : ''}`}>
                {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </div>
              
              {/* Indicador activo (estilo macOS) */}
              {isMenuOpen && (
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full"></div>
              )}
            </button>

            {/* Separador vertical fino */}
            {position === 'bottom' && openWindows.length > 0 && (
              <div className="h-6 w-px bg-white/10"></div>
            )}

            {/* Ventanas Abiertas - Estilo macOS Dock */}
            <div className={`flex items-center ${position === 'bottom' ? 'gap-1.5' : 'flex-col gap-2'}`}>
              {openWindows.map((win) => (
                <button
                  key={win.id}
                  onClick={() => {
                    if (win.isMinimized) {
                      onMinimize(win.id);
                      onFocus(win.id);
                    } else {
                      onMinimize(win.id);
                    }
                  }}
                  className={`
                    group relative flex items-center justify-center rounded-lg transition-all duration-200
                    ${position === 'bottom' ? 'h-9 w-9' : 'h-10 w-10'}
                    ${!win.isMinimized 
                      ? 'bg-white/15 shadow-md scale-105' 
                      : 'hover:bg-white/10 opacity-70 hover:opacity-100 hover:scale-105'}
                  `}
                  title={win.title}
                >
                  {/* Icono de la App */}
                  <div className="relative w-6 h-6 flex items-center justify-center">
                    {win.data?.imgSrc ? (
                      <img 
                        src={win.data.imgSrc} 
                        alt="app" 
                        className="w-full h-full object-contain drop-shadow-md" 
                      />
                    ) : (
                      <Circle size={16} className="text-purple-400" fill="currentColor" />
                    )}
                  </div>

                  {/* Indicador de ventana activa (estilo macOS) */}
                  {!win.isMinimized && (
                    <div className={`absolute ${
                      position === 'bottom' 
                        ? '-bottom-1 left-1/2 -translate-x-1/2 w-1 h-1' 
                        : '-left-1 top-1/2 -translate-y-1/2 h-1 w-1'
                    } bg-white rounded-full shadow-lg shadow-white/50`}></div>
                  )}

                  {/* Tooltip Premium */}
                  <div className={`
                    absolute opacity-0 group-hover:opacity-100 pointer-events-none
                    transition-all duration-200 z-[60]
                    ${position === 'bottom' 
                      ? 'bottom-full mb-2' 
                      : position === 'left' 
                        ? 'left-full ml-2' 
                        : 'right-full mr-2'}
                  `}>
                    <div className="bg-gray-900/95 backdrop-blur-xl text-white text-xs px-3 py-1.5 rounded-lg shadow-xl border border-white/10 whitespace-nowrap">
                      {win.title}
                      <div className={`absolute ${
                        position === 'bottom'
                          ? 'top-full left-1/2 -translate-x-1/2 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900/95'
                          : position === 'left'
                            ? 'right-full top-1/2 -translate-y-1/2 border-t-4 border-b-4 border-r-4 border-transparent border-r-gray-900/95'
                            : 'left-full top-1/2 -translate-y-1/2 border-t-4 border-b-4 border-l-4 border-transparent border-l-gray-900/95'
                      }`}></div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Sección Derecha/Inferior */}
          <div className={`flex items-center ${clockGroupClasses}`}>
            
            {/* Reloj y Fecha - Estilo Windows 11/macOS */}
            <div className={`
              flex items-center gap-2 px-3 py-1.5 rounded-lg
              hover:bg-white/10 transition-all cursor-default
              ${position === 'bottom' ? 'flex-row' : 'flex-col'}
            `}>
              <div className={`flex ${position === 'bottom' ? 'flex-col items-end' : 'flex-col items-center'} leading-tight`}>
                <span className="text-xs font-semibold tracking-tight">{timeString}</span>
                <span className="text-[10px] text-white/60 font-medium">{dateString}</span>
              </div>
            </div>

            {/* Separador */}
            {position === 'bottom' && (
              <div className="h-6 w-px bg-white/10"></div>
            )}

            {/* Botón de Configuración - Más sutil */}
            <button 
              onClick={handleChangePosition}
              className={`
                group relative rounded-lg transition-all duration-200
                hover:bg-white/10
                ${position === 'bottom' ? 'h-9 w-9' : 'h-10 w-10'}
                flex items-center justify-center
              `}
              title="Cambiar posición"
            >
              <Settings size={18} className="text-white/70 group-hover:text-white group-hover:rotate-90 transition-all duration-300" />
              
              {/* Tooltip para el botón de configuración */}
              <div className={`
                absolute opacity-0 group-hover:opacity-100 pointer-events-none
                transition-all duration-200 z-[60]
                ${position === 'bottom' 
                  ? 'bottom-full mb-2' 
                  : position === 'left' 
                    ? 'left-full ml-2' 
                    : 'right-full mr-2'}
              `}>
                <div className="bg-gray-900/95 backdrop-blur-xl text-white text-xs px-3 py-1.5 rounded-lg shadow-xl border border-white/10 whitespace-nowrap">
                  Cambiar posición
                  <div className={`absolute ${
                    position === 'bottom'
                      ? 'top-full left-1/2 -translate-x-1/2 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900/95'
                      : position === 'left'
                        ? 'right-full top-1/2 -translate-y-1/2 border-t-4 border-b-4 border-r-4 border-transparent border-r-gray-900/95'
                        : 'left-full top-1/2 -translate-y-1/2 border-t-4 border-b-4 border-l-4 border-transparent border-l-gray-900/95'
                  }`}></div>
                </div>
              </div>
            </button>

          </div>

        </div>
      </div>

      {/* Estilos adicionales para efectos premium */}
      <style>{`
        @keyframes dock-bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        
        button:active {
          transform: scale(0.95);
        }
      `}</style>
    </>
  );
}

export default Taskbar;