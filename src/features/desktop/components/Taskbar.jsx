// src/features/desktop/components/Taskbar.jsx
import React, { useState, useEffect } from 'react';
import StartMenu from '../../desktop/components/StartMenu';
import { Menu, X, Settings, Circle } from 'lucide-react';

// 👇 Recibimos position y onChangePosition como props 👇
function Taskbar({ onOpenApp, openWindows = [], onMinimize, onFocus, position = 'bottom', onChangePosition }) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const timerId = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timerId);
  }, []);

  const timeString = currentTime.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  const dateString = currentTime.toLocaleDateString('es-ES', { weekday: 'short', day: '2-digit', month: 'short' });

  const baseClasses = "fixed bg-black/40 backdrop-blur-2xl z-50 transition-all duration-300 ease-in-out text-white flex items-center border-white/10";
  
  // 👇 Solo manejamos Top y Bottom 👇
  const isBottom = position === 'bottom';
  const positionClasses = isBottom ? "bottom-0 left-0 w-full h-12 px-3 border-t" : "top-0 left-0 w-full h-12 px-3 border-b";

  return (
    <>
      {/* Pasamos position al StartMenu para que sepa de dónde abrirse */}
      <StartMenu isVisible={isMenuOpen} onClose={() => setIsMenuOpen(false)} onOpenApp={onOpenApp} position={position} />

      <div className={`${baseClasses} ${positionClasses}`}>
        <div className="flex flex-row justify-between w-full h-full items-center">
          
          <div className="flex items-center gap-2">
            {/* Botón Inicio */}
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`relative group h-9 w-9 rounded-lg flex items-center justify-center transition-all duration-200 ${isMenuOpen ? 'bg-white/20 shadow-lg shadow-purple-500/20' : 'hover:bg-white/10'}`}
              title="Inicio"
            >
              <div className={`transition-transform duration-200 ${isMenuOpen ? 'rotate-90 scale-110' : ''}`}>
                {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </div>
              {isMenuOpen && (
                <div className={`absolute left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full ${isBottom ? '-bottom-1' : '-top-1'}`}></div>
              )}
            </button>

            {openWindows.length > 0 && <div className="h-6 w-px bg-white/10"></div>}

            {/* Ventanas Abiertas */}
            <div className="flex items-center gap-1.5">
              {openWindows.map((win) => (
                <button
                  key={win.id}
                  onClick={() => {
                    win.isMinimized ? (onMinimize(win.id), onFocus(win.id)) : onMinimize(win.id);
                  }}
                  className={`group relative flex items-center justify-center rounded-lg transition-all duration-200 h-9 w-9 ${!win.isMinimized ? 'bg-white/15 shadow-md scale-105' : 'hover:bg-white/10 opacity-70 hover:opacity-100 hover:scale-105'}`}
                >
                  <div className="relative w-6 h-6 flex items-center justify-center">
                    {win.data?.imgSrc ? (
                      <img src={win.data.imgSrc} alt="app" className="w-full h-full object-contain drop-shadow-md" />
                    ) : (
                      <Circle size={16} className="text-purple-400" fill="currentColor" />
                    )}
                  </div>

                  {!win.isMinimized && (
                    <div className={`absolute left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full shadow-lg shadow-white/50 ${isBottom ? '-bottom-1' : '-top-1'}`}></div>
                  )}

                  {/* Tooltip Dinámico */}
                  <div className={`absolute opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 z-[60] ${isBottom ? 'bottom-full mb-2' : 'top-full mt-2'}`}>
                    <div className="bg-gray-900/95 backdrop-blur-xl text-white text-xs px-3 py-1.5 rounded-lg shadow-xl border border-white/10 whitespace-nowrap">
                      {win.title}
                      <div className={`absolute left-1/2 -translate-x-1/2 border-l-4 border-r-4 border-transparent ${isBottom ? 'top-full border-t-4 border-t-gray-900/95' : 'bottom-full border-b-4 border-b-gray-900/95'}`}></div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Sección Derecha */}
          <div className="flex flex-row items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/10 transition-all cursor-default">
              <div className="flex flex-col items-end leading-tight">
                <span className="text-xs font-semibold tracking-tight">{timeString}</span>
                <span className="text-[10px] text-white/60 font-medium">{dateString}</span>
              </div>
            </div>

            <div className="h-6 w-px bg-white/10"></div>

            {/* Botón de Configuración Dinámico */}
            <button 
              onClick={onChangePosition}
              className="group relative rounded-lg transition-all duration-200 hover:bg-white/10 h-9 w-9 flex items-center justify-center"
            >
              <Settings size={18} className="text-white/70 group-hover:text-white group-hover:rotate-90 transition-all duration-300" />
              <div className={`absolute opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 z-[60] ${isBottom ? 'bottom-full mb-2' : 'top-full mt-2'}`}>
                <div className="bg-gray-900/95 backdrop-blur-xl text-white text-xs px-3 py-1.5 rounded-lg shadow-xl border border-white/10 whitespace-nowrap">
                  Cambiar posición
                  <div className={`absolute left-1/2 -translate-x-1/2 border-l-4 border-r-4 border-transparent ${isBottom ? 'top-full border-t-4 border-t-gray-900/95' : 'bottom-full border-b-4 border-b-gray-900/95'}`}></div>
                </div>
              </div>
            </button>

          </div>
        </div>
      </div>
    </>
  );
}

export default Taskbar;