// src/core/ui/components/AppWindow.jsx
import React, { useRef, useEffect } from 'react';
import { Rnd } from 'react-rnd';
import { X, Minus, Maximize2, Minimize2 } from 'lucide-react';

function AppWindow({ 
  id, 
  title, 
  children, 
  onClose, 
  onMinimize, 
  onMaximize, 
  onDragStop, 
  zIndex, 
  onFocus, 
  defaultWidth = 640, 
  defaultHeight = 400, 
  defaultX = 50, 
  defaultY = 50, 
  isMaximized, 
  isActive 
}) {

  const rndRef = useRef(null);

  // Guardamos el tamaño/posición ANTES de maximizar para restaurarlo después
  const snapshot = useRef({ x: defaultX, y: defaultY, width: defaultWidth, height: defaultHeight });

  // Cuando cambia isMaximized, forzamos posición/tamaño en la instancia de Rnd
  useEffect(() => {
    if (!rndRef.current) return;

    if (isMaximized) {
      rndRef.current.updatePosition({ x: 0, y: 0 });
      rndRef.current.updateSize({ width: window.innerWidth, height: window.innerHeight - 48 });
    } else {
      // Restaurar al snapshot guardado
      rndRef.current.updatePosition({ x: snapshot.current.x, y: snapshot.current.y });
      rndRef.current.updateSize({ width: snapshot.current.width, height: snapshot.current.height });
    }
  }, [isMaximized]);

  // Guardar snapshot cada vez que el usuario mueve o redimensiona
  const saveSnapshot = (x, y, w, h) => {
    snapshot.current = { x, y, width: w, height: h };
  };

  useEffect(() => {
    if (!rndRef.current || isMaximized) return;
    rndRef.current.updatePosition({ x: defaultX, y: defaultY });
  }, [defaultX, defaultY, isMaximized]);

  return (
    <Rnd
      ref={rndRef}
      className="pointer-events-auto"
      disableDragging={isMaximized}
      enableResizing={!isMaximized}

      default={{
        x: defaultX,
        y: defaultY,
        width: defaultWidth,
        height: defaultHeight,
      }}

      minWidth={320}
      minHeight={220}

      dragHandleClassName="window-titlebar"

      style={{ zIndex }}

      onMouseDown={() => onFocus?.()}

      onDragStop={(e, d) => {
        if (isMaximized) return;
        onFocus?.();
        saveSnapshot(d.x, d.y, d.width, d.height);
        onDragStop?.(id, d.x, d.y);
      }}

      onResizeStop={(e, dir, ref, delta, pos) => {
        if (isMaximized) return;
        const w = parseInt(ref.style.width, 10);
        const h = parseInt(ref.style.height, 10);
        saveSnapshot(pos.x, pos.y, w, h);
      }}
    >
      {/* SHELL DE LA VENTANA */}
      <div
        className={`
          flex flex-col h-full w-full overflow-hidden pointer-events-auto
          ${isMaximized ? 'rounded-none' : 'rounded-xl'}
          bg-white dark:bg-[#1e1e2e] 
          backdrop-blur-xl
          shadow-2xl shadow-black/40
          border border-gray-200 dark:border-white/10
          transition-all duration-300
        `}
      >

        {/* TITLEBAR */}
        <div
          className={`
            window-titlebar 
            relative h-10 flex items-center select-none cursor-default shrink-0
            bg-gray-50 dark:bg-gray-900/50
            border-b border-gray-200 dark:border-white/10
            transition-colors duration-300
          `}
          onDoubleClick={onMaximize}
        >
          {/* Botones semáforo (estilo macOS) */}
          <div className="flex items-center gap-2 pl-3 group">
            
            {/* Botón Cerrar */}
            <button
              onClick={onClose}
              aria-label="Cerrar"
              className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-all duration-150 group/close"
            >
              <X 
                size={8} 
                strokeWidth={2.5} 
                className="text-red-900/60 opacity-0 group-hover/close:opacity-100 transition-opacity" 
              />
            </button>

            {/* Botón Minimizar */}
            <button
              onClick={onMinimize}
              aria-label="Minimizar"
              className="w-3 h-3 rounded-full bg-yellow-500 hover:bg-yellow-600 flex items-center justify-center transition-all duration-150 group/minimize"
            >
              <Minus 
                size={8} 
                strokeWidth={2.8} 
                className="text-yellow-900/60 opacity-0 group-hover/minimize:opacity-100 transition-opacity" 
              />
            </button>

            {/* Botón Maximizar/Restaurar */}
            <button
              onClick={onMaximize}
              aria-label={isMaximized ? 'Restaurar' : 'Maximizar'}
              className="w-3 h-3 rounded-full bg-green-500 hover:bg-green-600 flex items-center justify-center transition-all duration-150 group/maximize"
            >
              {isMaximized ? (
                <Minimize2 
                  size={8} 
                  strokeWidth={2.5} 
                  className="text-green-900/60 opacity-0 group-hover/maximize:opacity-100 transition-opacity" 
                />
              ) : (
                <Maximize2 
                  size={8} 
                  strokeWidth={2.5} 
                  className="text-green-900/60 opacity-0 group-hover/maximize:opacity-100 transition-opacity" 
                />
              )}
            </button>
          </div>

          {/* Título centrado */}
          <span className="absolute inset-x-0 text-center text-xs font-semibold text-gray-600 dark:text-gray-400 tracking-wide pointer-events-none">
            {title}
          </span>

          {/* Espacio derecho para mantener el título centrado */}
          <div className="ml-auto w-14 shrink-0" />
        </div>

        {/* CONTENIDO DE LA VENTANA */}
        <div className="flex-1 min-h-0 w-full overflow-hidden relative bg-white dark:bg-[#1e1e2e]">
          {children}
        </div>

        {/* GRIP RESIZE (esquina inferior derecha) */}
        {!isMaximized && (
          <div className="absolute bottom-0 right-0 w-5 h-5 pointer-events-none">
            <svg viewBox="0 0 12 12" className="w-full h-full">
              <line 
                x1="11" y1="3" x2="3" y2="11" 
                stroke="currentColor" 
                strokeWidth="1" 
                strokeLinecap="round" 
                className="text-gray-400 dark:text-white/20"
              />
              <line 
                x1="11" y1="6" x2="6" y2="11" 
                stroke="currentColor" 
                strokeWidth="1" 
                strokeLinecap="round" 
                className="text-gray-400 dark:text-white/20"
              />
              <line 
                x1="11" y1="9" x2="9" y2="11" 
                stroke="currentColor" 
                strokeWidth="1" 
                strokeLinecap="round" 
                className="text-gray-400 dark:text-white/20"
              />
            </svg>
          </div>
        )}

      </div>
    </Rnd>
  );
}

export default AppWindow;