// src/features/desktop/components/StartMenu.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, User, Settings, Search, Share2, Monitor } from 'lucide-react';
import { useSocket } from '../../../core/context/SocketContext';
import { useFetch } from '../../../core/api/useFetch';
import { sileo } from 'sileo';

const StartMenu = ({ isVisible, onClose, onOpenApp, position = 'bottom' }) => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState({ nombre: 'Estudiante', email: '' });
  const { connectToSession } = useSocket();
  const [sharedUsers, setSharedUsers] = useState([]);
  const fetchDataBackend = useFetch();

  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const token = localStorage.getItem('token');

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) setCurrentUser(JSON.parse(storedUser));
  }, []);

  useEffect(() => {
    const loadShared = async () => {
      if (!token) return;
      try {
        const data = await fetchDataBackend(
          `${backendUrl}/dashboard/data`, null, "GET",
          { Authorization: `Bearer ${token}` }
        );
        if (data?.usuario?.escritoriosGuardados)
          setSharedUsers(data.usuario.escritoriosGuardados);
      } catch (error) {
        console.error("Error cargando escritorios:", error);
      }
    };
    if (isVisible) loadShared();
  }, [isVisible]);

  const handleConnectToUser = (targetUser) => {
    if (!targetUser.id) return;
    connectToSession(targetUser.id);
    navigate(`/desktop?remote=${targetUser.id}&name=${encodeURIComponent(targetUser.name)}`);
    sileo.success({ title: `Conectado al escritorio de ${targetUser.name}` });
    onClose();
  };

  const handleLaunch = (appId, title) => { onOpenApp(appId, title); onClose(); };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleOpenShare = () => {
    window.dispatchEvent(new Event('open-share-desktop-modal'));
    onClose();
  };

  if (!isVisible) return null;

  return (
    <div className={`
      fixed left-2 z-50 w-80 md:w-96
      bg-card border border-border
      backdrop-blur-2xl rounded-xl shadow-2xl
      text-foreground overflow-hidden transition-colors duration-300
      /* 👇 Ajuste mágico de posición y animación 👇 */
      ${position === 'bottom' 
          ? 'bottom-12 origin-bottom-left animate-scale-in' 
          : 'top-12 origin-top-left animate-scale-in'}
    `}>

      {/* ── CABECERA ─────────────────────────────────────────────────────── */}
      <div className="p-4 flex items-center gap-3 border-b border-border bg-muted transition-colors duration-300">
        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-brand-500 to-brand-700 flex items-center justify-center font-bold text-lg text-white shadow-lg shrink-0">
          {currentUser.nombre.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold truncate text-foreground">
            {currentUser.nombre}
          </h3>
          <p className="text-xs text-muted-foreground truncate">
            {currentUser.email}
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="p-2 rounded-lg text-muted-foreground hover:bg-destructive/20 hover:text-destructive transition-colors"
          title="Cerrar Sesión"
        >
          <LogOut size={18} />
        </button>
      </div>

      {/* ── BUSCADOR ─────────────────────────────────────────────────────── */}
      <div className="p-3">
        <div className="
          flex items-center gap-2 px-3 py-2 rounded-lg
          bg-background border border-border shadow-sm
          focus-within:ring-2 focus-within:ring-brand-500/50
          transition-all duration-200
        ">
          <Search size={16} className="text-muted-foreground shrink-0" />
          <input
            type="text"
            placeholder="Buscar archivos, compañeros..."
            className="bg-transparent outline-none text-sm w-full text-foreground placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {/* ── ESCRITORIOS COMPARTIDOS ───────────────────────────────────────── */}
      <div className="px-2 pb-2">
        <p className="px-2 text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">
          Comunidad (Compartidos conmigo)
        </p>

        <div className="space-y-1 max-h-48 overflow-y-auto custom-scrollbar">
          {sharedUsers.length === 0 ? (
            <p className="text-xs text-muted-foreground px-2 italic">
              No tienes escritorios guardados.
            </p>
          ) : (
            sharedUsers.map(user => (
              <div
                key={user._id}
                onClick={() => handleConnectToUser({ id: user._id, name: user.nombre })}
                className="group flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-muted transition-colors duration-200"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center font-bold text-xs text-white shadow-md shrink-0">
                  {user.nombre.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground group-hover:text-brand-500 transition-colors truncate">
                    {user.nombre}
                  </p>
                  <p className="text-[10px] text-muted-foreground truncate">
                    {user.email}
                  </p>
                </div>
                <Monitor size={14} className="text-muted-foreground/40 group-hover:text-brand-500 transition-colors shrink-0" />
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── PIE ──────────────────────────────────────────────────────────── */}
      <div className="p-3 bg-muted border-t border-border flex items-center justify-between transition-colors duration-300">

        <button
          onClick={handleOpenShare}
          className="
            flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium
            bg-brand-500/10 hover:bg-brand-500/20
            text-brand-500 border border-brand-500/30 hover:border-brand-500/50
            transition-all duration-200
          "
        >
          <Share2 size={14} />
          <span>Dar acceso a mi PC</span>
        </button>

        <div className="flex items-center gap-1">
          <button
            onClick={() => handleLaunch('settings', 'Configuración')}
            className="p-2 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            title="Configuración"
          >
            <Settings size={16} />
          </button>
          <button
            onClick={() => handleLaunch('profile', 'Mi Perfil')}
            className="p-2 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
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