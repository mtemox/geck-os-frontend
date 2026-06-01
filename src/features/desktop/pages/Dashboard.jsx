// src/features/desktop/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wifi, Accessibility, Power, User, ArrowRight, Monitor, Briefcase, Plus, UserPlus, Users, ChevronRight } from 'lucide-react';
import dragonBg from '../../../assets/wallpapers/deg3.jpg';
import geckoBg from '../../../assets/logos/gecko.png';
import { useFetch } from '../../../core/api/useFetch';
import { useSocket } from '../../../core/context/SocketContext';
import { sileo } from 'sileo';

import Modal from '../../../core/ui/components/Modal';
import NewFolderForm from '../../file-system/NewFolderForm';
import ShareForm from '../../file-system/ShareForm';

function Dashboard() {
    const navigate = useNavigate();
    const [user, setUser] = useState({ nombre: 'Cargando...', email: '' });
    const [sharedDesktops, setSharedDesktops] = useState([]);
    const fetchDataBackend = useFetch();
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const token = localStorage.getItem('token');
    const [workspaces, setWorkspaces] = useState([]);

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [modalMode, setModalMode] = useState(null); // 'create-workspace' o 'invite-workspace'
    const [selectedWorkspace, setSelectedWorkspace] = useState(null);

    const { disconnectSocket } = useSocket();

    // --- MANEJADORES DE APERTURA ---

    const handleCreateWorkspace = () => {
        setModalMode('create-workspace');
        setIsModalVisible(true);
    };

    const handleInviteToWorkspace = (e, wsId, wsName) => {
        e.stopPropagation();
        // Reconstruimos el objeto para que confirmInviteMember pueda leer el _id
        setSelectedWorkspace({ _id: wsId, nombre: wsName });
        setModalMode('invite-workspace');
        setIsModalVisible(true);
    };

    const closeModal = () => {
        setIsModalVisible(false);
        setModalMode(null);
        setSelectedWorkspace(null);
    };

    // --- FUNCIONES DE CONFIRMACIÓN (PETICIONES AL BACKEND) ---

    const confirmCreateWorkspace = async (formData) => {
        try {
            const response = await fetch(`${backendUrl}/workspaces/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ nombre: formData.name })
            });
            const data = await response.json();

            if (response.ok) {
                setWorkspaces(prev => [...prev, data.workspace]);
                sileo.success({ title: "Espacio de trabajo creado" });
                closeModal();
            } else {
                sileo.error({ title: data.msg || "Error al crear" });
            }
        } catch (error) {
            console.error(error);
        }
    };

    const confirmInviteMember = async (formData) => {
        try {
            const response = await fetch(`${backendUrl}/workspaces/invite`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    workspaceId: selectedWorkspace._id,
                    email: formData.email
                })
            });
            const data = await response.json();

            if (response.ok) {
                sileo.success({ title: `Invitación enviada a ${formData.email}` });
                closeModal();
            } else {
                sileo.error({ title: data.msg || "Error al invitar" });
            }
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) setUser(JSON.parse(storedUser));

        const loadShared = async () => {
            try {
                const data = await fetchDataBackend(
                    `${backendUrl}/dashboard/data`,
                    null,
                    "GET",
                    { Authorization: `Bearer ${token}` }
                );

                if (data && data.usuario && data.usuario.escritoriosGuardados) {
                    setSharedDesktops(data.usuario.escritoriosGuardados);
                    if (data.workspaces) setWorkspaces(data.workspaces);
                }
            } catch (error) {
                console.error("Error cargando dashboard:", error);
            }
        };
        loadShared();
    }, []);

    const handleEnterDesktop = () => {
        navigate('/desktop');
    };

    const handleEnterRemoteDesktop = (remoteId, remoteName) => {
        navigate(`/desktop?remote=${remoteId}&name=${encodeURIComponent(remoteName)}`);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        disconnectSocket();
        navigate('/login');
    };

    const handleEnterWorkspace = (wsId) => {
        navigate(`/desktop?workspace=${wsId}`);
    };

    return (
        <div className="h-screen w-full overflow-hidden relative font-sans text-white select-none">

            {/* Capas de fondo */}
            <div
                className="absolute inset-0 z-0 bg-cover bg-center scale-105"
                style={{ backgroundImage: `url(${dragonBg})` }}
            />
            <div className="absolute inset-0 z-0 bg-blue-900/80 mix-blend-multiply" />
            <div className="absolute inset-0 z-0 bg-gradient-to-t from-black/40 to-transparent" />

            {/* Contenido principal */}
            <div className="relative z-10 h-full flex flex-col justify-between p-8 md:p-12">

                {/* Espacio superior vacío */}
                <div></div>

                {/* Usuario principal centrado */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center animate-fade-in-up">

                    {/* Avatar Grande */}
                    <div className="relative mb-6">
                        <div className="absolute inset-0 bg-white/20 rounded-full blur-2xl scale-110"></div>
                        <div
                            className="relative w-40 h-40 rounded-full shadow-2xl border-4 border-white/20"
                            style={{
                                backgroundImage: `url(${user.avatarUrl || geckoBg})`,
                                backgroundSize: '90%',
                                backgroundRepeat: 'no-repeat',
                                backgroundPosition: 'center',
                                backgroundColor: '#160C0B' // ← el color que quieras
                            }}
                        />
                    </div>

                    {/* Nombre de Usuario */}
                    <h1 className="text-4xl font-light mb-8 drop-shadow-lg tracking-wide">
                        {user.nombre}
                    </h1>

                    {/* Campo de entrada simulado */}
                    <div className="flex flex-col items-center gap-3 w-80">
                        <p className="text-sm text-white/70 cursor-pointer hover:text-white/90 transition-colors">
                            Opciones de inicio de sesión
                        </p>

                        <button
                            onClick={handleEnterDesktop}
                            className="group flex items-center bg-white/10 backdrop-blur-xl border border-white/30 rounded-md overflow-hidden transition-all hover:bg-white/15 hover:border-white/40 focus:ring-2 focus:ring-white/60 w-full h-14 px-5 shadow-lg"
                        >
                            <span className="flex-1 text-left text-white/90 text-base font-light">
                                Iniciar mi escritorio
                            </span>
                            <div className="bg-white/10 h-full w-14 flex items-center justify-center group-hover:bg-white/20 transition-colors border-l border-white/20">
                                <ArrowRight size={22} className="text-white/80" />
                            </div>
                        </button>
                    </div>
                </div>

                {/* Sección inferior */}
                <div className="flex justify-between items-end w-full gap-8">

                    {/* Lista de escritorios - IZQUIERDA */}
                    <div className="flex flex-col gap-3 max-w-xs animate-fade-in-left">

                        {/* Usuario actual */}
                        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-lg p-3 flex items-center gap-3 shadow-xl cursor-default transition-all hover:bg-white/15">
                            <div className="relative">
                                <div
                                    className="w-12 h-12 rounded-full border-2 border-white/30"
                                    style={{
                                        backgroundImage: `url(${user.avatarUrl || geckoBg})`,
                                        backgroundSize: '90%',
                                        backgroundRepeat: 'no-repeat',
                                        backgroundPosition: 'center',
                                        backgroundColor: '#160C0B'
                                    }}
                                />
                                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white"></div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm truncate">{user.nombre}</p>
                                <p className="text-xs text-white/60 truncate">Mi escritorio</p>
                            </div>
                        </div>

                        {/* Escritorios compartidos */}
                        {sharedDesktops.length > 0 && (
                            <>
                                <div className="flex items-center gap-2 px-2 mt-2">
                                    <Users size={14} className="text-white/60" />
                                    <p className="text-xs font-semibold text-white/70 uppercase tracking-wider">
                                        Escritorios Compartidos
                                    </p>
                                </div>

                                {sharedDesktops.map(desk => (
                                    <div
                                        key={desk._id}
                                        onClick={() => handleEnterRemoteDesktop(desk._id, desk.nombre)}
                                        className="group bg-white/10 backdrop-blur-xl border border-white/20 rounded-lg p-3 flex items-center gap-3 shadow-lg cursor-pointer transition-all hover:bg-white/15 hover:scale-[1.02]"
                                    >
                                        <div className="relative">
                                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                                                <User size={20} className="text-white" />
                                            </div>
                                            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white"></div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-sm truncate">{desk.nombre}</p>
                                            <p className="text-xs text-white/60 truncate">{desk.email}</p>
                                        </div>
                                        <ChevronRight size={18} className="text-white/40 group-hover:text-white/70 transition-colors" />
                                    </div>
                                ))}
                            </>
                        )}

                        {/* Workspaces */}
                        {workspaces.length > 0 && (
                            <>
                                <div className="flex items-center justify-between px-2 mt-2">
                                    <div className="flex items-center gap-2">
                                        <Briefcase size={14} className="text-white/60" />
                                        <p className="text-xs font-semibold text-white/70 uppercase tracking-wider">
                                            Espacios de Trabajo
                                        </p>
                                    </div>
                                    <button
                                        onClick={handleCreateWorkspace}
                                        className="p-1.5 hover:bg-white/20 rounded-full transition-colors"
                                        title="Crear Espacio"
                                    >
                                        <Plus size={14} className="text-white/70" />
                                    </button>
                                </div>

                                {workspaces.map(ws => (
                                    <div
                                        key={ws._id}
                                        onClick={() => handleEnterWorkspace(ws._id)}
                                        className="group bg-white/10 backdrop-blur-xl border border-white/20 rounded-lg p-3 flex items-center gap-3 shadow-lg cursor-pointer transition-all hover:bg-white/15 hover:scale-[1.02]"
                                    >
                                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                                            <Briefcase size={20} className="text-white" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-sm truncate">{ws.nombre}</p>
                                            <p className="text-xs text-white/60 truncate">Sala colaborativa</p>
                                        </div>
                                        <button
                                            onClick={(e) => handleInviteToWorkspace(e, ws._id, ws.nombre)}
                                            className="p-2 hover:bg-white/20 rounded-full transition-colors"
                                            title="Invitar miembro"
                                        >
                                            <UserPlus size={16} className="text-white/70" />
                                        </button>
                                    </div>
                                ))}
                            </>
                        )}

                        {/* Botón crear workspace si no hay ninguno */}
                        {workspaces.length === 0 && (
                            <>
                                <div className="flex items-center gap-2 px-2 mt-2">
                                    <Briefcase size={14} className="text-white/60" />
                                    <p className="text-xs font-semibold text-white/70 uppercase tracking-wider">
                                        Espacios de Trabajo
                                    </p>
                                </div>
                                <button
                                    onClick={handleCreateWorkspace}
                                    className="group bg-white/10 backdrop-blur-xl border border-white/20 border-dashed rounded-lg p-4 flex flex-col items-center gap-2 shadow-lg cursor-pointer transition-all hover:bg-white/15 hover:border-white/30"
                                >
                                    <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
                                        <Plus size={20} className="text-white/70" />
                                    </div>
                                    <p className="text-xs text-white/70 font-medium">Crear espacio de trabajo</p>
                                </button>
                            </>
                        )}

                    </div>

                    {/* Iconos de sistema - DERECHA */}
                    <div className="flex flex-col gap-4 animate-fade-in-right">

                        {/* Panel de estado del sistema */}
                        <div className="flex items-center gap-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-lg p-3 shadow-xl">

                            <button
                                className="p-2.5 hover:bg-white/20 rounded-lg transition-colors"
                                title="Red"
                            >
                                <Wifi size={20} className="text-white/80" />
                            </button>

                            <div className="w-px h-6 bg-white/20"></div>

                            <button
                                className="p-2.5 hover:bg-white/20 rounded-lg transition-colors"
                                title="Accesibilidad"
                            >
                                <Accessibility size={20} className="text-white/80" />
                            </button>

                            <div className="w-px h-6 bg-white/20"></div>

                            <button
                                onClick={handleLogout}
                                className="p-2.5 hover:bg-red-500/30 rounded-lg transition-colors group"
                                title="Cerrar Sesión"
                            >
                                <Power size={20} className="text-white/80 group-hover:text-red-300" />
                            </button>

                        </div>

                        {/* Reloj y fecha */}
                        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-lg p-4 shadow-xl text-right">
                            <p className="text-3xl font-light tracking-tight">
                                {new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                            <p className="text-xs text-white/70 mt-1">
                                {new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            </p>
                        </div>

                    </div>

                </div>

                {/* 👇 INTEGRACIÓN DEL MODAL 👇 */}
                <Modal
                    isVisible={isModalVisible}
                    onClose={closeModal}
                    title={
                        modalMode === 'create-workspace'
                            ? "Nuevo Espacio de Trabajo"
                            : `Invitar a ${selectedWorkspace?.nombre}`
                    }
                >
                    {modalMode === 'create-workspace' && (
                        <NewFolderForm
                            onSubmit={confirmCreateWorkspace}
                            title="Nombre del Espacio de Trabajo"
                            placeholder="Ej: Semestre 2"
                            buttonText="Crear Espacio"
                        />
                    )}

                    {modalMode === 'invite-workspace' && (
                        <ShareForm
                            onSubmit={confirmInviteMember}
                            itemToShare={selectedWorkspace}
                            isDesktop={false}
                            isWorkspace={true}
                        />
                    )}
                </Modal>

            </div>

            {/* Animaciones CSS */}
            <style>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translate(-50%, -45%);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%);
          }
        }
        
        @keyframes fade-in-left {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes fade-in-right {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out;
        }
        
        .animate-fade-in-left {
          animation: fade-in-left 0.6s ease-out;
        }
        
        .animate-fade-in-right {
          animation: fade-in-right 0.6s ease-out;
        }
      `}</style>

        </div>
    );
}

export default Dashboard;