// src/core/context/SocketContext.jsx
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';

const SocketContext = createContext();

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
  const socketRef = useRef(null);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const envUrl = import.meta.env.VITE_BACKEND_URL;
    // Quitamos /api si existe, para conectar a la raíz
    const socketUrl = envUrl.replace('/api', '');
    const storedUser = localStorage.getItem('user');

    if (storedUser && !socketRef.current) {
      const user = JSON.parse(storedUser);
      console.log("🔌 Inicializando Socket para usuario:", user.nombre);

      socketRef.current = io(socketUrl, {
        transports: ['polling', 'websocket'],
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        autoConnect: true,
      });

      // --- FUNCIÓN PARA UNIRSE A LA SALA ---
      const joinRoom = () => {
        if (socketRef.current && socketRef.current.connected) {
          console.log("🤝 Uniéndose a sala de usuario:", user.id);
          socketRef.current.emit('join-user-room', user.id);
        }
      };

      // 1. Intentar unirse cuando ocurre el evento 'connect'
      socketRef.current.on('connect', () => {
        console.log("🟢 [Socket] Conectado! ID:", socketRef.current.id);
        joinRoom();
      });

      // 2. CASO ESPECIAL: Si ya estaba conectado (por recargas rápidas), forzar la unión
      if (socketRef.current.connected) {
        joinRoom();
      }

      // Listeners de debug
      socketRef.current.on('disconnect', (reason) => console.warn("TB [Socket] Desconectado:", reason));
      socketRef.current.on('connect_error', (err) => console.error("🔴 [Socket] Error:", err.message));

      setSocket(socketRef.current);
    }
  }, []); 

  // NUEVA FUNCIÓN: Unirse a la sesión de otro usuario
  const connectToSession = (targetUserId) => {
    if (socketRef.current) {
      console.log("🚀 Uniendo a sesión remota:", targetUserId);
      // Emitimos un evento al backend para unirnos a esa sala
      socketRef.current.emit('join-user-room', targetUserId);
      // Nota: Ahora recibiremos los eventos 'window-open', 'code-change' de esa persona
    }
  };

  // Exponemos la función y el socket
  const value = {
    socket,
    connectToSession 
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};