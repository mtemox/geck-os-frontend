// src/features/desktop/pages/AppLayout.jsx
import React, { useState, useEffect, useCallback } from 'react';
import Desktop from '../components/Desktop';
import Taskbar from '../components/Taskbar';
import { useSocket } from '../../../core/context/SocketContext';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { LogOut, Users } from 'lucide-react';
import { useFetch } from '../../../core/api/useFetch';
import { sileo } from 'sileo';

function AppLayout() {
  const [openWindows, setOpenWindows] = useState([]);
  const [nextZ, setNextZ] = useState(10);
  const { socket } = useSocket();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const fetchDataBackend = useFetch();

  const remoteUserId = searchParams.get('remote');
  const workspaceId = searchParams.get('workspace');
  const remoteName = searchParams.get('name');

  const [taskbarPosition, setTaskbarPosition] = useState('bottom');

  const isRemote = !!remoteUserId;
  const isWorkspace = !!workspaceId;

  // ── CONECTAR AL ROOM CORRECTO AL MONTAR ──────────────────────────────────
  useEffect(() => {
    if (!socket) return;

    const user = JSON.parse(localStorage.getItem('user') || '{}');

    if (workspaceId) {
      console.log(`🏢 Uniéndose a workspace room: ${workspaceId}`);
      socket.emit('join-workspace-room', workspaceId);
      socket.emit('setup', user.id); // También el room personal
    } else if (remoteUserId) {
      console.log(`🔭 Modo remoto: ${remoteUserId}`);
      socket.emit('join-user-room', remoteUserId);
    } else {
      socket.emit('setup', user.id);
    }

    // ── ESCUCHAR EVENTOS DE VENTANAS ─────────────────────────────────────
    const handleWindowOpen = (newWindow) => {
      setOpenWindows(prev => {
        if (prev.find(w => String(w.id) === String(newWindow.id))) return prev;
        return [...prev, newWindow];
      });
    };

    const handleWindowClose = ({ windowId }) => {
      setOpenWindows(prev => prev.filter(win => String(win.id) !== String(windowId)));
    };

    const handleWindowMove = ({ windowId, position }) => {
      setOpenWindows(prev => prev.map(win =>
        String(win.id) === String(windowId)
          ? { ...win, defaultX: position.x, defaultY: position.y }
          : win
      ));
    };

    // Cuando alguien acepta la invitación y entra al workspace
    const handleMemberJoined = ({ user: newUser }) => {
      sileo.success({ title: `${newUser.name} se unió al workspace 🎉` });
    };

    const handleMemberLeft = ({ userName }) => {
      sileo.info({ title: `${userName} salió del workspace` });
    };

    socket.on('window-open', handleWindowOpen);
    socket.on('window-close', handleWindowClose);
    socket.on('window-move', handleWindowMove);
    socket.on('workspace-member-joined', handleMemberJoined);
    socket.on('workspace-member-left', handleMemberLeft);

    return () => {
      socket.off('window-open', handleWindowOpen);
      socket.off('window-close', handleWindowClose);
      socket.off('window-move', handleWindowMove);
      socket.off('workspace-member-joined', handleMemberJoined);
      socket.off('workspace-member-left', handleMemberLeft);
    };
  }, [socket, workspaceId, remoteUserId]);

  // ── ABRIR VENTANA ────────────────────────────────────────────────────────
  const handleOpenWindow = useCallback((appId, title, windowOptions = {}, data = null) => {
    if (appId === 'profile' && !windowOptions.defaultWidth) {
      windowOptions = { defaultWidth: 500, defaultHeight: 600 };
    }

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

    if (!socket) return;

    const user = JSON.parse(localStorage.getItem('user') || '{}');

    if (workspaceId) {
      socket.emit('workspace-window-open', {
        workspaceId,
        windowData: newWindowObj
      });
    } else {
      const targetId = remoteUserId || user.id;
      socket.emit('window-open', { userId: targetId, windowData: newWindowObj, windowId: newWindowId });
    }
  }, [openWindows, nextZ, socket, workspaceId, remoteUserId]);

  // ── CERRAR VENTANA ───────────────────────────────────────────────────────
  const handleCloseWindow = useCallback((windowId) => {
    setOpenWindows(prev => prev.filter(win => win.id !== windowId));

    if (!socket) return;

    const user = JSON.parse(localStorage.getItem('user') || '{}');

    if (workspaceId) {
      socket.emit('workspace-window-close', { workspaceId, windowId });
    } else {
      const targetId = remoteUserId || user.id;
      socket.emit('window-close', { userId: targetId, windowId });
    }
  }, [socket, workspaceId, remoteUserId]);

  // ── DRAG STOP ────────────────────────────────────────────────────────────
  const handleDragStop = useCallback((windowId, x, y) => {
    setOpenWindows(prev => prev.map(win =>
      win.id === windowId ? { ...win, defaultX: x, defaultY: y } : win
    ));

    if (!socket) return;

    const user = JSON.parse(localStorage.getItem('user') || '{}');

    if (workspaceId) {
      socket.emit('workspace-window-move', {
        workspaceId,
        windowId,
        position: { x, y }
      });
    } else {
      const targetId = remoteUserId || user.id;
      socket.emit('window-move', { userId: targetId, windowId, position: { x, y } });
    }
  }, [socket, workspaceId, remoteUserId]);

  const handleMinimizeWindow = (windowId) => {
    setOpenWindows(prev => prev.map(win =>
      win.id === windowId ? { ...win, isMinimized: !win.isMinimized } : win
    ));
  };

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

  // ── SALIR DEL WORKSPACE ──────────────────────────────────────────────────
  const handleLeaveWorkspace = async () => {
    if (!workspaceId) return;

    const token = localStorage.getItem('token');
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    try {
      const res = await fetchDataBackend(
        `${backendUrl}/workspaces/${workspaceId}/leave`,
        null,
        "DELETE",
        { Authorization: `Bearer ${token}` }
      );
      if (res?.ok) {
        sileo.success({ title: res.msg });
        navigate('/dashboard');
      }
    } catch (e) {
      sileo.error({ title: "Error al salir del workspace" });
    }
  };

  // ── SALIR DEL ESCRITORIO REMOTO ──────────────────────────────────────────
  const handleLeaveRemote = () => {
    // Volver a nuestro propio room
    if (socket) {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      socket.emit('setup', user.id);
    }
    navigate('/dashboard');
  };

  return (
    <main className="font-sans h-screen overflow-hidden relative">

      {/* Barra de aviso — WORKSPACE */}
      {isWorkspace && (
        <div className="fixed top-0 left-0 right-0 h-9 bg-indigo-600 z-[100] flex items-center justify-between px-4 text-white text-xs font-bold shadow-lg">
          <div className="flex items-center gap-2">
            <Users size={14} />
            <span>ESPACIO DE TRABAJO COLABORATIVO</span>
          </div>
          <button
            onClick={handleLeaveWorkspace}
            className="flex items-center gap-1.5 px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg transition-colors text-white font-bold"
          >
            <LogOut size={14} />
            Salir del Workspace
          </button>
        </div>
      )}

      {/* Barra de aviso — REMOTO */}
      {isRemote && !isWorkspace && (
        <div className="fixed top-0 left-0 right-0 h-9 bg-red-600 z-[100] flex items-center justify-between px-4 text-white text-xs font-bold shadow-lg">
          <span>👁 VISUALIZANDO: {remoteName?.toUpperCase()} (Modo Espectador)</span>
          <button
            onClick={handleLeaveRemote}
            className="flex items-center gap-1.5 px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
          >
            <LogOut size={14} />
            Volver a mi escritorio
          </button>
        </div>
      )}

      <Desktop
        openWindows={openWindows}
        onOpenWindow={handleOpenWindow}
        onCloseWindow={handleCloseWindow}
        onMinimizeWindow={handleMinimizeWindow}
        onMaximizeWindow={handleMaximizeWindow}
        onFocusWindow={handleFocusWindow}
        onDragStop={handleDragStop}
        taskbarPosition={taskbarPosition}
        // Le avisamos al Desktop si está en modo workspace/remoto para que ajuste su UI
        topOffset={isWorkspace || isRemote ? 36 : 0}
      />

      <Taskbar
        openWindows={openWindows}
        onOpenApp={handleOpenWindow}
        onMinimize={handleMinimizeWindow}
        onFocus={handleFocusWindow}
        position={taskbarPosition}
        onChangePosition={() => setTaskbarPosition(prev => prev === 'bottom' ? 'top' : 'bottom')}
        // Bajar la taskbar si hay barra de aviso arriba
        topOffset={isWorkspace || isRemote ? 36 : 0}
      />
    </main>
  );
}

export default AppLayout;