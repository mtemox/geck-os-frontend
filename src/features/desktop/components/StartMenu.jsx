// src/components/StartMenu.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, User, Settings, Search, MonitorPlay, Share2 } from 'lucide-react';
import { useSocket } from '../../../core/context/SocketContext';
import { useFetch } from '../../../core/api/useFetch';
import { sileo } from 'sileo';

const StartMenu = ({ isVisible, onClose, onOpenApp }) => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState({ nombre: 'Estudiante', email: '' });
  const { connectToSession } = useSocket();
  const [sharedUsers, setSharedUsers] = useState([]); 
  const fetchDataBackend = useFetch();

  // URL Backend
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const token = localStorage.getItem('token');

  // 1. CARGAR USUARIO ACTUAL
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
  }, []);

  // 2. CARGAR USUARIOS COMPARTIDOS
  useEffect(() => {
      const loadShared = async () => {
          if (!token) return;
          try {
              const data = await fetchDataBackend(
                  `${backendUrl}/dashboard-data`, 
                  null, 
                  "GET", 
                  { Authorization: `Bearer ${token}` }
              );
              if (data && data.usuario && data.usuario.escritoriosGuardados) {
                  setSharedUsers(data.usuario.escritoriosGuardados);
              }
          } catch (error) {
              console.error("Error cargando escritorios:", error);
          }
      };
      
      if (isVisible) {
          loadShared(); 
      }
  }, [isVisible]); 

  // --- HANDLERS ---

  const handleConnectToUser = (targetUser) => {
    if (!targetUser.id) return;
    connectToSession(targetUser.id);
    navigate(`/desktop?remote=${targetUser.id}&name=${encodeURIComponent(targetUser.name)}`);
    sileo.success({title: `Conectado al escritorio de ${targetUser.name}`});
    onClose();
  };

  const handleLaunch = (appId, title) => {
    onOpenApp(appId, title);
    onClose();
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleShareMyDesktop = async () => {
    const email = prompt("Ingresa el correo del usuario al que darás acceso:");
    if (!email) return;

    try {
        const response = await fetch(`${backendUrl}/share-desktop`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ email })
        });
        const data = await response.json();
        
        if(response.ok) {
            sileo.success({title: "¡Acceso concedido!"});
        } else {
            sileo.error({title: data.msg || "Error"});
        }
    } catch(e) { console.error(e); }
  };

  if (!isVisible) return null;

  const handleOpenShare = () => {
      window.dispatchEvent(new Event('open-share-desktop-modal'));
      onClose();
  };

  return (
    // Contenedor Flotante - ACTUALIZADO CON TEMA
    <div className="
                        fixed bottom-12 left-2 z-50 w-80 md:w-96 
                        bg-white/95 dark:bg-[#1e1e2e]/95 
                        backdrop-blur-2xl
                        border border-slate-200 dark:border-white/10
                        rounded-xl shadow-2xl 
                        shadow-black/10 dark:shadow-black/60
                        text-slate-800 dark:text-white
                        overflow-hidden animate-scale-in origin-bottom-left
                        transition-colors duration-300
                    ">
      
      {/* --- CABECERA (Perfil) - ACTUALIZADO CON TEMA --- */}
      <div className="
                        p-4 flex items-center gap-3 
                        border-b border-slate-200 dark:border-white/10 
                        bg-slate-50 dark:bg-gray-900/50
                        transition-colors duration-300
                    ">
        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center font-bold text-lg text-white shadow-lg">
          {currentUser.nombre.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold truncate text-slate-800 dark:text-white">
            {currentUser.nombre}
          </h3>
          <p className="text-xs text-slate-500 dark:text-gray-400 truncate">
            {currentUser.email}
          </p>
        </div>
        <button 
          onClick={handleLogout} 
          className="
                    p-2 rounded-lg transition-colors
                    text-slate-400 dark:text-gray-500
                    hover:bg-red-500/20 hover:text-red-500 dark:hover:text-red-400
                  "
          title="Cerrar Sesión"
        >
          <LogOut size={18} />
        </button>
      </div>

      {/* --- BUSCADOR - ACTUALIZADO CON TEMA --- */}
      <div className="p-3">
        <div className="
                        flex items-center gap-2 px-3 py-2 rounded-lg 
                        bg-white dark:bg-gray-800/50
                        border border-slate-200 dark:border-white/10
                        shadow-sm dark:shadow-none
                        focus-within:ring-2 focus-within:ring-blue-500/50
                        transition-all duration-300
                    ">
          <Search size={16} className="text-slate-400 dark:text-gray-500"/>
          <input 
            type="text" 
            placeholder="Buscar archivos, compañeros..." 
            className="
                        bg-transparent border-none outline-none text-sm w-full 
                        text-slate-800 dark:text-white 
                        placeholder-slate-400 dark:placeholder-gray-500
                    "
          />
        </div>
      </div>

      {/* --- LISTA DE "OTROS ESCRITORIOS" - ACTUALIZADO CON TEMA --- */}
      <div className="px-2 pb-2">
        <p className="px-2 text-xs font-bold text-slate-500 dark:text-gray-500 uppercase mb-2">
          Comunidad (Compartidos conmigo)
        </p>
        
        <div className="space-y-1 max-h-48 overflow-y-auto custom-scrollbar">
            {sharedUsers.length === 0 ? (
                <p className="text-xs text-slate-500 dark:text-gray-500 px-2 italic">
                  No tienes escritorios guardados.
                </p>
            ) : (
                sharedUsers.map(user => (
                    <div 
                       key={user._id} 
                       onClick={() => handleConnectToUser({ id: user._id, name: user.nombre })} 
                       className="
                                    group flex items-center gap-3 p-2 rounded-lg cursor-pointer 
                                    hover:bg-slate-100 dark:hover:bg-white/10
                                    transition-colors duration-200
                                "
                    >
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-xs text-white shadow-md">
                            {user.nombre.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-700 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                              {user.nombre}
                            </p>
                            <p className="text-[10px] text-slate-500 dark:text-gray-500 truncate">
                              {user.email}
                            </p>
                        </div>
                    </div>
                ))
            )}
        </div>
      </div>

      {/* --- ACCESOS RÁPIDOS (PIE DEL MENÚ) - ACTUALIZADO CON TEMA --- */}
      <div className="
                      p-3 
                      bg-slate-100 dark:bg-gray-900/50 
                      border-t border-slate-200 dark:border-white/10 
                      flex items-center justify-between
                      transition-colors duration-300
                    ">
          
          {/* Botón Dar Acceso */}
          <button 
              onClick={handleOpenShare} 
              className="
                        flex items-center gap-2 px-3 py-2 rounded-lg 
                        bg-blue-500/20 dark:bg-blue-600/20 
                        hover:bg-blue-500/30 dark:hover:bg-blue-600/40 
                        text-blue-600 dark:text-blue-300 
                        text-xs font-medium 
                        transition-all duration-200
                        border border-blue-500/30 dark:border-blue-500/30 
                        hover:border-blue-500/50 dark:hover:border-blue-500/50
                      "
          >
              <Share2 size={14} />
              <span>Dar acceso a mi PC</span>
          </button>
          
          <div className="flex items-center gap-1">
              {/* Botón Configuración */}
              <button 
                  onClick={() => handleLaunch('settings', 'Configuración')} 
                  className="
                            p-2 rounded-lg 
                            text-slate-500 dark:text-gray-400 
                            hover:bg-slate-200 dark:hover:bg-white/10 
                            hover:text-slate-700 dark:hover:text-white
                            transition-colors duration-200
                          "
                  title="Configuración"
              >
                  <Settings size={16} />
              </button>

              {/* Botón Perfil */}
              <button 
                  onClick={() => handleLaunch('profile', 'Mi Perfil')} 
                  className="
                            p-2 rounded-lg 
                            text-slate-500 dark:text-gray-400 
                            hover:bg-slate-200 dark:hover:bg-white/10 
                            hover:text-slate-700 dark:hover:text-white
                            transition-colors duration-200
                          "
                  title="Mi Cuenta"
              >
                  <User size={16} />
              </button>
          </div>
      </div>

    </div>
  );
};

export default StartMenu;