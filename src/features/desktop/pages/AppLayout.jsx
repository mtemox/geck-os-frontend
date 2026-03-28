// src/features/desktop/pages/AppLayout.jsx
import React, { useState, useEffect } from 'react';
import Desktop from '../components/Desktop';
import Taskbar from '../components/Taskbar';
import { useSocket } from '../../../core/context/SocketContext';
import { useSearchParams } from 'react-router-dom';

function AppLayout() {
  const [openWindows, setOpenWindows] = useState([]);
  const [nextZ, setNextZ] = useState(10);
  const { socket } = useSocket();
  const [searchParams] = useSearchParams();
  const remoteUserId = searchParams.get('remote'); // <--- ID DEL DUEÑO REMOTO

  // --- ESCUCHAR EVENTOS (EFECTO ESPEJO) ---
  useEffect(() => {
    if (!socket) return;

    // A. Alguien abrió una ventana en otra pestaña
    socket.on('window-open', (newWindow) => {
      setOpenWindows(prev => {
        // Evitar duplicados si ya existe
        if (prev.find(w => w.id === newWindow.id)) return prev;
        return [...prev, newWindow];
      });
    });

    // B. Alguien cerró una ventana
    socket.on('window-close', ({ windowId }) => {
      setOpenWindows(prev => prev.filter(win => win.id !== windowId));
    });

    // C. Alguien movió una ventana
    socket.on('window-move', ({ windowId, position }) => {
      setOpenWindows(prev => prev.map(win => 
        // 👇 CAMBIO AQUÍ: Usamos String() para asegurar que comparamos texto con texto
        String(win.id) === String(windowId) 
            ? { ...win, defaultX: position.x, defaultY: position.y } 
            : win
      ));
    });

    return () => {
      socket.off('window-open');
      socket.off('window-close');
      socket.off('window-move');
    };
  }, [socket]);

  const handleOpenWindow = (appId, title, windowOptions = {}, data = null) => {
    if (appId === 'profile' && !windowOptions.defaultWidth) {
        windowOptions = { defaultWidth: 500, defaultHeight: 600 };
    }

    // Cascada: Calculamos posición inicial
    const offset = (openWindows.length * 30) % 300; 
    const defaultX = 50 + offset; 
    const defaultY = 20 + offset;

    const newWindowId = data?._id || Date.now();
    const newZ = nextZ + 1;
    
    const newWindowObj = { 
      id: newWindowId, 
      appId, 
      title, 
      zIndex: newZ, 
      defaultX, 
      defaultY,
      isMinimized: false, 
      isMaximized: false, 
      data,
      ...windowOptions 
    };

    setOpenWindows(prev => [...prev, newWindowObj]);
    setNextZ(newZ);

    // 2. EMITIR al Socket
    if (socket) {

        const params = new URLSearchParams(window.location.search);
        const remoteId = params.get('remote');

        const user = JSON.parse(localStorage.getItem('user'));
        // Si estoy viendo a otro, le mando el evento a ÉL.
        const targetId = remoteUserId || user.id; 

        socket.emit('window-open', { 
            userId: targetId, 
            windowData: newWindowObj,
            windowId: newWindowId // 👈 ¡AQUÍ ESTABA EL ERROR! Antes decía 'windowId'
        });
     }
  };

  const handleCloseWindow = (windowId) => {
    // 1. Cerrar localmente
    setOpenWindows(prev => prev.filter(win => win.id !== windowId));

    // 2. EMITIR al Socket
    if (socket) {
      const user = JSON.parse(localStorage.getItem('user'));
      const targetId = remoteUserId || user.id;
      socket.emit('window-close', { userId: targetId, windowId });
    }
  };

  // Necesitamos pasar esta función al Desktop para que Rnd la use al terminar de arrastrar
  const handleDragStop = (windowId, x, y) => {
    // 1. Actualizamos localmente
    setOpenWindows(prev => prev.map(win => 
      win.id === windowId ? { ...win, defaultX: x, defaultY: y } : win
    ));

    // 2. EMITIR movimiento (CORRECCIÓN SALA REMOTA)
    if (socket) {
      const user = JSON.parse(localStorage.getItem('user'));
      
      // Obtenemos el ID remoto de la URL
      const params = new URLSearchParams(window.location.search);
      const remoteId = params.get('remote');
      
      // Enviamos a la sala correcta
      const targetId = remoteId || user.id;

      socket.emit('window-move', { 
          userId: targetId, 
          windowId, 
          position: { x, y } 
      });
    }
  }

  // 👈 NUEVO: Minimizar (Ocultar)
  const handleMinimizeWindow = (windowId) => {
    setOpenWindows(prev => prev.map(win => 
      win.id === windowId ? { ...win, isMinimized: !win.isMinimized } : win
    ));
  };

  // 👈 NUEVO: Maximizar (Estado)
  const handleMaximizeWindow = (windowId) => {
    setOpenWindows(prev => prev.map(win => 
        win.id === windowId ? { ...win, isMaximized: !win.isMaximized } : win
    ));
  };

  const handleFocusWindow = (windowId) => {
    setNextZ(prevZ => {
      const newZ = prevZ + 1;
      setOpenWindows(prev => prev.map(win => 
        win.id === windowId ? { ...win, zIndex: newZ } : win
      ));
      return newZ;
    });
  };

  return (
    <main className="font-sans h-screen overflow-hidden relative">
      <Desktop 
         openWindows={openWindows}
         onOpenWindow={handleOpenWindow}
         onCloseWindow={handleCloseWindow}
         onMinimizeWindow={handleMinimizeWindow}
         onMaximizeWindow={handleMaximizeWindow}
         onFocusWindow={handleFocusWindow}
         onDragStop={handleDragStop}
      />
      
      {/* (Nota: En el futuro, la Taskbar usará openWindows para restaurar las minimizadas) */}
      <Taskbar 
          openWindows={openWindows} 
          onOpenApp={handleOpenWindow}
          onMinimize={handleMinimizeWindow} // Para restaurar/minimizar desde la barra
          onFocus={handleFocusWindow}       // Para traer al frente
          
      />
    </main>
  );
}

export default AppLayout;