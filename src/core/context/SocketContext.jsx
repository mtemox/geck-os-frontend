import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const socketRef = useRef(null);
  const [socket, setSocket] = useState(null);

  // 👇 1. ENCAPSULAMOS LA LÓGICA DE CONEXIÓN 👇
  const connectSocket = () => {
    const envUrl = import.meta.env.VITE_BACKEND_URL;
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

      const joinRoom = () => {
        if (socketRef.current && socketRef.current.connected) {
          console.log("🤝 Uniéndose a sala de usuario:", user.id);
          socketRef.current.emit('join-user-room', user.id);
        }
      };

      socketRef.current.on('connect', () => {
        console.log("🟢 [Socket] Conectado! ID:", socketRef.current.id);
        joinRoom();
      });

      if (socketRef.current.connected) {
        joinRoom();
      }

      socketRef.current.on('disconnect', (reason) => console.warn("TB [Socket] Desconectado:", reason));
      socketRef.current.on('connect_error', (err) => console.error("🔴 [Socket] Error:", err.message));

      setSocket(socketRef.current);
    }
  };

  // 👇 2. FUNCIÓN PARA APAGAR EL SOCKET AL SALIR 👇
  const disconnectSocket = () => {
      if (socketRef.current) {
          socketRef.current.disconnect();
          socketRef.current = null;
          setSocket(null);
          console.log("🛑 Socket desconectado al cerrar sesión");
      }
  };

  // Si recargan la página con F5 estando logueados, esto lo atrapa
  useEffect(() => {
    connectSocket(); 
  }, []); 

  const connectToSession = (targetUserId) => {
    if (socketRef.current) {
      console.log("🚀 Uniendo a sesión remota:", targetUserId);
      socketRef.current.emit('join-user-room', targetUserId);
    }
  };

  // 👇 3. EXPORTAMOS LAS NUEVAS FUNCIONES 👇
  const value = {
    socket,
    connectToSession,
    connectSocket,
    disconnectSocket
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};