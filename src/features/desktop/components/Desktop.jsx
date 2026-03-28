// src/features/desktop/components/Desktop.jsx
import React, { useState, useEffect, useRef } from 'react';
import { sileo } from 'sileo';
import { useFetch } from '../../../core/api/useFetch';
import { useSocket } from '../../../core/context/SocketContext';
import { useSearchParams } from 'react-router-dom';
import ShareForm from '../../file-system/ShareForm';
import { useTheme } from '../../../core/context/ThemeContext';

// Componentes UI
import AppWindow from '../../../core/ui/components/AppWindow';
import ContextMenu from '../../file-system/ContextMenu';
import Icon from './Icon'; 
import Modal from '../../../core/ui/components/Modal'; // Importar Modal
import NewLinkForm from '../../file-system/NewLinkForm'; 
import FolderContent from '../../file-system/FolderContent';
import NewFolderForm from '../../file-system/NewFolderForm';
import FileViewer from '../../file-system/FileViewer'; // <--- IMPORTAR

// Widgets y Apps
import ChatApp from '../../apps/ChatApp';
import CodeEditorApp from '../../apps/CodeEditorApp';
import WhiteboardApp from '../../apps/WhiteboardApp';
import WordEditorApp from '../../apps/WordEditorApp';
import ProfileApp from '../../apps/ProfileApp';
import WeatherApp from '../../apps/WeatherApp';
import NewsApp from '../../apps/NewsApp';
import WallpaperApp from '../../apps/WallpaperApp';
import RecommendationsApp from '../../apps/RecommendationsApp';
import CodeComparator from '../../apps/DiffEditorApp';
import SettingsApp from '../../apps/SettingsApp';
import StoragePlans from '../../store/StoragePlans'; // <--- IMPORTAR EL COMPONENTE NUEVO
import CalendarWidget from '../../widgets/CalendarWidget';
import PostItWidget from '../../widgets/PostItWidget';

// Imágenes e Íconos
import codeIcon from '../../../assets/icons/code.png'; 
import weatherIcon from '../../../assets/icons/weather.png'; 
import newsIcon from '../../../assets/icons/news.png';
import noteIcon from '../../../assets/icons/note.png'; 
import wallpaperIcon from '../../../assets/icons/wallpaper.png'; 
import backgroundImageUrl from '../../../assets/wallpapers/mi-fondo.jpg';
import defaultWallpaper from '../../../assets/wallpapers/mi-fondo.jpg';
import folderIcon from '../../../assets/icons/folder.png';
import computerIcon from '../../../assets/icons/desktop.png';
import linkIcon from '../../../assets/icons/link.png'; 
import wordIcon from '../../../assets/icons/doc.png';
import aiIcon from '../../../assets/icons/chat.png';
import shopIcon from '../../../assets/icons/shop.png';   // <--- O usa computerIcon si no tienes este
import fileIcon from '../../../assets/icons/file.png';
import whiteBoard from '../../../assets/icons/blackboard.png';


// --- SIMULACIÓN DE DATOS DEL BACKEND ---
// (En el futuro, esto vendrá de una API real)
// Traemos las imágenes que ya tenías

const systemAppsBase = [
  { 
    _id: 'sys-10', // Siguiente ID libre
    nombre: 'Pizarrón', 
    imgSrc: whiteBoard, // O un nuevo icono como boardIcon
    type: 'app', 
    appId: 'whiteboard', 
    windowOptions: { defaultWidth: 800, defaultHeight: 600 } // Más grande por defecto
  },
  { 
    _id: 'sys-9',
    nombre: 'Chat MiDesk', 
    imgSrc: aiIcon, 
    type: 'app', 
    appId: 'ai-chat', 
    windowOptions: { defaultWidth: 400, defaultHeight: 600 } 
  },
  { _id: 'sys-8', nombre: 'Asistente IA', imgSrc: aiIcon, type: 'app', appId: 'ai-recommendations' },
  { 
    _id: 'sys-store', 
    nombre: 'Tienda Cloud', 
    imgSrc: shopIcon, // O computerIcon
    type: 'app', 
    appId: 'store', // <--- ESTE ID ES IMPORTANTE
    windowOptions: { defaultWidth: 900, defaultHeight: 600 } 
  },
  { _id: 'sys-7', nombre: 'Bloc de Notas', imgSrc: noteIcon, type: 'app', appId: 'notepad' },
  
  { _id: 'sys-6', nombre: 'Mi Equipo', imgSrc: computerIcon, type: 'computer' },
  { _id: 'sys-5', nombre: 'VS Code (Sim)', imgSrc: codeIcon, type: 'app', appId: 'codeEditor' },
  { _id: 'sys-4', nombre: 'Word Pro', imgSrc: wordIcon, type: 'app', appId: 'wordprocessor' },
  { _id: 'sys-3', nombre: 'Fondos', imgSrc: wallpaperIcon, type: 'app', appId: 'wallpaper' },
  { _id: 'sys-2', nombre: 'Noticias', imgSrc: newsIcon, type: 'app', appId: 'news' },
  { _id: 'sys-1', nombre: 'Clima', imgSrc: weatherIcon, type: 'app', appId: 'weather' },
];

// --- HELPER: Mapear Tipo de BD a Imagen ---
const getIconImage = (type) => {
    switch (type) {
        case 'folder': return folderIcon;
        case 'link': return linkIcon;
        case 'note': return wordIcon;
        case 'code': return codeIcon;
        case 'file': return fileIcon;
        default: return linkIcon;
    }
};

// --- FUNCIÓN PARA RENDERIZAR EL CONTENIDO DE LA APP ---
  // Esto decide qué mostrar DENTRO de la ventana
  const AppRenderer = React.memo(({ appId, data, windowId, onOpenWindow }) => {
    switch (appId) {

      case 'folder': // <--- NUEVO CASO PARA CARPETAS
        return (
          <FolderContent 
            folderId={data?._id} 
            folderName={data?.nombre}
            // 👇👇 AGREGAMOS ESTA LÍNEA CLAVE 👇👇
            onOpenItem={onOpenWindow} 
            // 👆👆 Esto permite que la carpeta abra nuevas ventanas
          />
        );

      case 'notepad':
      case 'note': 
        return (
          <WordEditorApp
            key={`word-${windowId}`}
            fileId={data?._id} 
            fileName={data?.nombre}
            initialContent={data?.content} // El backend lo envía si el endpoint está bien
          />
        );
      
      case 'code': 
        return (
          <CodeEditorApp
            key={`code-${windowId}`}
            fileId={data?._id} 
            fileName={data?.nombre}
            initialContent={data?.content} 
          />
        );
        
      case 'codeEditor':
        return (
          <CodeEditorApp
            key={`code-sim-${windowId}`}
            language="javascript"
            initialContent="console.log('¡Hola desde el editor de código!');"
          />
        );
        
      case 'diffEditor':
        const v1 = "function saludo() {\n  console.log('Hola');\n}";
        const v2 = "function saludo() {\n  console.log('Hola Mundo!');\n}";
        return (
          <CodeComparator
            language="javascript"
            originalCode={v1}
            modifiedCode={v2}
          />
        );

        // ¡AÑADE ESTOS DOS CASOS! 👇
      case 'weather':
        return <WeatherApp />;
        
      case 'news':
        return <NewsApp />;

      case 'wallpaper':
        return <WallpaperApp />;

      // case 'wordprocessor':
      //     return <RichTextEditor />;

      case 'wordprocessor':
      return (
        <WordEditorApp
          key={`wordprocessor-${windowId}`}
        />
      );
      
      case 'profile': 
          return <ProfileApp />; // 👈 NUEVO
      
      case 'ai-recommendations': // <--- NUEVO CASE
       return <RecommendationsApp />;

      case 'settings':
        return <SettingsApp />;

      case 'ai-chat':
        return <ChatApp />;

      case 'store':
        return <StoragePlans />;

      case 'file': 
        // ✅ AHORA USAMOS EL VISUALIZADOR INTELIGENTE
        return <FileViewer file={data} />;

      case 'whiteboard':
        return <WhiteboardApp />;

      default:
        return <div className="text-white p-4">App no encontrada</div>;
      }
  });

function Desktop({ openWindows, onOpenWindow, onCloseWindow, onFocusWindow, onMinimizeWindow, onMaximizeWindow, onDragStop }) {
  // Archivos
  const fileInputRef = useRef(null);
  
  // Theme
  const { setSpecificTheme } = useTheme();

  // PASO 2: Crear el estado para los íconos
  const [icons, setIcons] = useState([])

  const [currentWallpaper, setCurrentWallpaper] = useState(defaultWallpaper);
  
  // Socket
  const { socket } = useSocket();
  const [searchParams] = useSearchParams();
  const workspaceId = searchParams.get('workspace');
  const remoteId = searchParams.get('remote');

  // DETECTAR MODO REMOTO
  const remoteUserId = searchParams.get('remote');
  const remoteUserName = searchParams.get('name');
  const isRemote = !!remoteUserId; // Booleano

  // --- CONFIGURACIÓN DE LA REJILLA ---
  const CELL_WIDTH = 100;
  const CELL_HEIGHT = 110;

  // <-- NUEVO: Estado para el menú contextual
  // 'isVisible': si se muestra o no
  // 'x' e 'y': dónde se muestra
  const [menuState, setMenuState] = useState({
    isVisible: false,
    x: 0,
    y: 0,
    selectedItem: null
  });

  // <-- NUEVO: Estado para controlar el modal
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Hook para peticiones
  const fetchDataBackend = useFetch();

  // modalMode puede ser: 'link' | 'folder' | null
  const [modalMode, setModalMode] = useState(null);

  // --- FUNCIÓN PARA CALCULAR POSICIONES SEGÚN RESOLUCIÓN ---
  const calculateSystemPositions = () => {
    const MARGIN_X = 10; 
    const MARGIN_Y = 10;
    // ÚNIFICAMOS MEDIDAS CON EL EFECTO DE AUTO-ARRANGE
    const CELL_WIDTH = 90; 
    const CELL_HEIGHT = 100; 
    const TASKBAR_HEIGHT = 55; // Ajustado a 60 para coincidir
    
    const availableHeight = window.innerHeight - TASKBAR_HEIGHT - MARGIN_Y;
    
    // Calculamos filas disponibles (Mínimo 1)
    let maxRows = Math.floor(availableHeight / CELL_HEIGHT);
    if (maxRows < 1) maxRows = 1;

    return systemAppsBase.map((app, index) => {
      // Lógica Vertical (Columna 1 llena, luego Columna 2...)
      const col = Math.floor(index / maxRows);
      const row = index % maxRows;

      return {
        ...app,
        position: {
          x: MARGIN_X + (col * CELL_WIDTH),
          y: MARGIN_Y + (row * CELL_HEIGHT)
        }
      };
    });
  };

  // --- CARGA INICIAL Y REDIMENSIONAMIENTO ---
  useEffect(() => {
  const loadEverything = async () => {
    setIcons([]);
    const positionedSystemApps = calculateSystemPositions();
    
    const token = localStorage.getItem('token');
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    
    const rawRemoteId = searchParams.get('remote'); 
    const rawFolderId = searchParams.get('folder');
    const remoteIdParam = (rawRemoteId && rawRemoteId !== "null" && rawRemoteId !== "undefined") 
                          ? rawRemoteId 
                          : null;
    const workspaceIdParam = (rawFolderId && rawFolderId !== "null") ? rawFolderId : null;
    const workspaceParam = searchParams.get('workspace');

    try {
       const params = new URLSearchParams();
       if (remoteIdParam) params.append('remoteUserId', remoteIdParam);
       if (workspaceParam) params.append('workspaceId', workspaceParam);
       
       const baseUrl = backendUrl.replace(/\/$/, ''); 
       const finalUrl = `${baseUrl}/items/desktop?${params.toString()}`;

       const data = await fetchDataBackend(
          finalUrl, 
          null, 
          "GET", 
          { Authorization: `Bearer ${token}` }
       );

      if (data && data.ok) {
        const userItems = data.items.map(item => ({
           _id: item._id,
           nombre: item.name,
           imgSrc: getIconImage(item.type),
           type: item.type,
           appId: item.type === 'file' ? 'file' : item.type,
           url: item.url,
           fileFormat: item.fileFormat,
           position: item.position || { x: 100, y: 100 }, 
           content: item.content || ""
         }));

        setIcons([...positionedSystemApps, ...userItems]);

        // 👇 CARGAR PREFERENCIAS (Tema + Wallpaper)
        if (data.preferences) {
            if (data.preferences.theme) {
                setSpecificTheme(data.preferences.theme);
            }
            if (data.preferences.wallpaperUrl) {
                setCurrentWallpaper(data.preferences.wallpaperUrl);
            } else {
                setCurrentWallpaper(defaultWallpaper);
            }
        }

      } else {
          console.warn("⚠️ No se pudieron cargar items remotos:", data?.msg);
          setIcons(positionedSystemApps);
      }
    } catch (error) {
      console.error("❌ Error carga inicial:", error);
      setIcons(positionedSystemApps); 
    }
  };

  loadEverything();

    // --- AQUÍ EMPIEZA LA LÓGICA NUEVA DE WEB SOCKETS ---
    if (socket) {
      const myUser = JSON.parse(localStorage.getItem('user'));
      
      // 👇 MODIFICAR ESTE BLOQUE LOGICO 👇
      if (workspaceId) {
          // CASO 1: ESPACIO DE TRABAJO
          console.log(`🔌 Socket: Uniéndose a WORKSPACE room: workspace:${workspaceId}`);
          socket.emit('join-workspace-room', workspaceId); // Evento especial para workspaces
      } 
      else if (isRemote) {
          // CASO 2: ESCRITORIO REMOTO (Espejo)
          console.log("🔭 Modo Remoto: Conectando a sala de", remoteUserId);
          socket.emit('join-user-room', remoteUserId);
      } 
      else {
          // CASO 3: MI ESCRITORIO (Local)
          console.log(`🔌 Socket: Uniéndose a MI sala: user:${myUser.id}`);
          socket.emit('join-user-room', myUser.id);
      }
      
      // A. Escuchar cuando se CREA un ítem (por otro usuario o por mí en otra pestaña)
      socket.on('item-created', (newItem) => {
        console.log("📡 Socket: item-created", newItem);
        
        // Formateamos el ítem que llega del socket para que coincida con nuestra UI
        const newIconUI = {
            _id: newItem._id,
            nombre: newItem.name,
            imgSrc: getIconImage(newItem.type),
            type: newItem.type,
            url: newItem.url,
            fileFormat: newItem.fileFormat,
            position: newItem.position || { x: 100, y: 100 },
            content: newItem.content || ""
        };

        // Lo agregamos al estado si no existe ya
        setIcons(prev => {
            if (prev.find(i => i._id === newItem._id)) return prev;
            return [...prev, newIconUI];
        });
      });

      // B. Escuchar cuando se MUEVE un ítem
      socket.on('item-moved', ({ id, position }) => {
        console.log("📡 Socket: item-moved", id, position);
        setIcons(prev => prev.map(icon => 
            icon._id === id ? { ...icon, position } : icon
        ));
      });

      // C. Escuchar cuando se RENOMBRA un ítem
      socket.on('item-renamed', ({ id, name }) => {
         console.log("📡 Socket: item-renamed", id, name);
         setIcons(prev => prev.map(icon => 
            icon._id === id ? { ...icon, nombre: name } : icon
         ));
      });

      // D. Escuchar cuando se ELIMINA un ítem (o varios)
      socket.on('item-deleted', ({ ids }) => {
        console.log("📡 Socket: item-deleted", ids);
        // Filtramos fuera los iconos que estén en la lista de IDs eliminados
        setIcons(prev => prev.filter(icon => !ids.includes(icon._id)));
      });

      // E. Escuchar cuando alguien me comparte algo
      socket.on('item-shared', (sharedItem) => {
        console.log("🎁 ¡Me compartieron algo!", sharedItem);
        sileo.info({title: `Te han compartido: ${sharedItem.name}`});

        // Lo formateamos para la UI
        const newIconUI = {
            _id: sharedItem._id,
            nombre: sharedItem.name,
            imgSrc: getIconImage(sharedItem.type),
            type: sharedItem.type,
            url: sharedItem.url,
            position: { x: 50, y: 50 }, // Lo ponemos en la esquina por defecto
            content: sharedItem.content || "",
            // Podrías añadir un flag visual para saber que es compartido
            isShared: true 
        };

        setIcons(prev => {
             // Evitar duplicados
             if (prev.find(i => i._id === sharedItem._id)) return prev;
             return [...prev, newIconUI];
        });
      });

      // F. Escuchar cambios de preferencias (Tema/Fondo)
      socket.on('preferences-updated', (prefs) => {
          console.log("🎨 Preferencias actualizadas:", prefs);
          
          // 1. ACTUALIZAR TEMA (Esto fuerza el cambio visual)
          if (prefs.theme) {
              setSpecificTheme(prefs.theme);
          }

          // 2. ACTUALIZAR WALLPAPER (CORREGIDO)
          // Si viene definido, verificamos si es cadena vacía.
          // Si es vacía -> Default. Si tiene URL -> Esa URL.
          if (prefs.wallpaperUrl !== undefined) {
              const bgToUse = prefs.wallpaperUrl && prefs.wallpaperUrl !== "" 
                              ? prefs.wallpaperUrl 
                              : defaultWallpaper; // 👈 Tu import del fondo .jpg
              
              setCurrentWallpaper(bgToUse);
          }
      });

      socket.on('file-change', ({ fileId, content }) => {
        // Buscamos el ícono y le actualizamos su contenido interno
        setIcons(prev => prev.map(icon => 
            icon._id === fileId ? { ...icon, content: content } : icon
        ));
      });


    }

    

    // Opcional: Recalcular si el usuario cambia el tamaño de la ventana
    const handleResize = () => {
      setIcons(prev => {
        const systemUpdated = calculateSystemPositions();
        const userOnes = prev.filter(i => !i._id.toString().startsWith('sys-'));
        return [...systemUpdated, ...userOnes];
      });
    };

    window.addEventListener('resize', handleResize);

    // Limpieza de eventos al desmontar
    return () => {
       window.removeEventListener('resize', () => {}); // Tu resize existente
       
       if (socket && isRemote) {
             const myUser = JSON.parse(localStorage.getItem('user'));
             socket.emit('join-user-room', myUser.id); // Volver a mi sala
        }
       
       if (socket) {
         socket.off('item-created');
         socket.off('item-moved');
         socket.off('item-renamed');
         socket.off('item-deleted');
         socket.off('item-shared');
         socket.off('preferences-updated');
         socket.off('file-change');
       }
    };

  }, [socket, remoteUserId, searchParams]);

  // 2. USE EFFECT PARA CARGAR PREFERENCIAS Y ESCUCHAR CAMBIOS
  useEffect(() => {
   const token = localStorage.getItem('token');
   const backendUrl = import.meta.env.VITE_BACKEND_URL;

   const fetchWallpaper = async () => {
      try {
          const data = await fetchDataBackend(`${backendUrl}/users/profile`, null, "GET", { Authorization: `Bearer ${token}` });
          if (data && data.preferences && data.preferences.wallpaperUrl) {
              setCurrentWallpaper(data.preferences.wallpaperUrl);
          }
      } catch (e) { console.error(e); }
   };
   fetchWallpaper();

   const handleWallpaperChange = (e) => {
       if (e.detail) setCurrentWallpaper(e.detail);
   };
   
   // 👇 NUEVO: Listener para tema
   const handleThemeChange = (e) => {
       if (e.detail) {
           console.log("🎨 Tema actualizado localmente:", e.detail);
           setSpecificTheme(e.detail);
       }
   };

   const handleLocalUpdate = (e) => {
        const { id, content } = e.detail;
        setIcons(prev => prev.map(icon => 
            icon._id === id ? { ...icon, content: content } : icon
        ));
    };

    const handleOpenShareEvent = () => {
       handleOpenShareDesktopModal();
   };

   window.addEventListener('wallpaper-changed', handleWallpaperChange);
   window.addEventListener('theme-changed', handleThemeChange); // 👈 NUEVO
   window.addEventListener('local-file-update', handleLocalUpdate);
   window.addEventListener('open-share-desktop-modal', handleOpenShareEvent);

   return () => {
       window.removeEventListener('wallpaper-changed', handleWallpaperChange);
       window.removeEventListener('theme-changed', handleThemeChange); // 👈 NUEVO
       window.removeEventListener('local-file-update', handleLocalUpdate);
       window.removeEventListener('open-share-desktop-modal', handleOpenShareEvent);
   };
}, []);

  // --- NUEVA FUNCIÓN: Persistir movimiento en Backend ---
  const handleMoveIcon = async (id, x, y) => {
  if (id.toString().startsWith('sys-')) return;

  // Ajustado al nuevo tamaño reducido
  const ICON_WIDTH = 74;  
  const ICON_HEIGHT = 88; 

  let finalX = x;
  let finalY = y;

  let isOccupied = true;
  let safetyNet = 0;

  while (isOccupied && safetyNet < 100) {
    const collision = icons.find(icon => {
      if (icon._id === id) return false;
      
      const otherX = icon.position?.x || 0;
      const otherY = icon.position?.y || 0;

      // Colisión AABB ajustada al nuevo tamaño
      return (
        finalX < otherX + ICON_WIDTH &&
        finalX + ICON_WIDTH > otherX &&
        finalY < otherY + ICON_HEIGHT &&
        finalY + ICON_HEIGHT > otherY
      );
    });

    if (collision) {
      finalX += 15; // Desplazamiento menor para mayor precisión
      if (finalX + ICON_WIDTH > window.innerWidth - 10) {
        finalX = 10;
        finalY += 15;
      }
      safetyNet++;
    } else {
      isOccupied = false;
    }
  }

  // Actualización optimista (Sin LAG)
  setIcons(prev => prev.map(icon => 
    icon._id === id ? { ...icon, position: { x: finalX, y: finalY } } : icon
  ));

  const token = localStorage.getItem('token');
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  try {
    // Sincronización con Backend (Persiste el orden y posición)
    await fetchDataBackend(
      `${backendUrl}/items/${id}/move`,
      { x: finalX, y: finalY },
      "PATCH",
      { Authorization: `Bearer ${token}` }
    );
  } catch (error) {
    console.error("Error al persistir posición:", error);
  }
};

    const handleRenameIcon = async (id, name) => {
    // Evitamos renombrar apps del sistema
    if (id.toString().startsWith('sys-')) return;

    const token = localStorage.getItem('token');
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    try {
      // Según tu Backend: router.patch('/items/:id/renombrar', ...)
      const response = await fetchDataBackend(
        `${backendUrl}/items/${id}/rename`,
        { name }, // Enviamos el nuevo nombre en el body
        "PATCH",
        { Authorization: `Bearer ${token}` }
      );

      if (response && response.ok) {
        // Actualizamos el estado local para que el cambio sea visible
        setIcons(prev => prev.map(icon => 
          icon._id === id ? { ...icon, nombre: name } : icon
        ));
      }
    } catch (error) {
      console.error("❌ Error al renombrar el ícono:", error);
    }
  };

  // <-- NUEVO: Manejador para el Clic Derecho
  const handleContextMenu = (e) => {
    // ¡SÚPER IMPORTANTE!
    // Esto previene que aparezca el menú
    // normal del navegador (Copiar, Pegar, Inspeccionar...)
    e.preventDefault(); 

    // Ocultamos el menú si ya estaba visible
    // (para evitar menús duplicados si hace clic derecho varias veces)
    if (menuState.isVisible) {
      setMenuState({ ...menuState, isVisible: false });
    }

    // Mostramos nuestro menú en la posición del cursor (e.clientX y e.clientY)
    setMenuState({
      isVisible: true,
      x: e.clientX,
      y: e.clientY,
    });
  };

  // 1. Clic en el Fondo (Escritorio vacío)
  const handleContextMenuDesktop = (e) => {
    e.preventDefault();
    setMenuState({ 
        isVisible: true, 
        x: e.clientX, 
        y: e.clientY, 
        selectedItem: null // No hay ítem seleccionado
    });
  };

  // 2. Clic en un Ícono (Pasado desde Icon.jsx)
  const handleContextMenuIcon = (e, iconData) => {
    e.preventDefault();
    e.stopPropagation(); // Evita que se dispare el del fondo
    setMenuState({ 
        isVisible: true, 
        x: e.clientX, 
        y: e.clientY, 
        selectedItem: iconData // Guardamos el ítem
    });
  };

  // <-- NUEVO: Manejador para cerrar el menú
  // Si el usuario hace clic izquierdo en cualquier
  // parte del escritorio, ocultamos el menú.
  const handleCloseMenu = () => {
    if (menuState.isVisible) {
      setMenuState({ ...menuState, isVisible: false });
    }
  };

  // --- NUEVAS FUNCIONES PARA EL MODAL ---

  // <-- NUEVO: Cierra el Menú y Abre el Modal
  const handleOpenNewLinkModal = () => {
    handleCloseMenu(); // Cierra el menú contextual
    setModalMode('link');
    setIsModalVisible(true); // Abre el modal
  };

  const handleOpenNewFolderModal = () => {
    handleCloseMenu();
    setModalMode('folder'); // Modo Carpeta
    setIsModalVisible(true);
  };

  // <-- NUEVO: Cierra el Modal
  const closeModal = () => {
    setIsModalVisible(false);
    setModalMode(null); // Reseteamos modo
  };

  // <-- NUEVO: Lógica para SB-F-004 (Crear ícono y actualizar UI)
  // REMPLAZADO
  const handleCreateLink = async (formData) => {
    const token = localStorage.getItem('token');
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    // Preparamos los datos para el Backend
    const newItemData = {
        type: 'link', // Por ahora solo links desde este modal
        name: formData.name,
        url: formData.url,
        x: 100, // Posición por defecto (podríamos aleatorizarla)
        y: 100
    };

  

    try {
        const response = await fetchDataBackend(
            `${backendUrl}/items`,
            newItemData,
            "POST",
            { Authorization: `Bearer ${token}` }
        );

        if (response && response.ok) {
            // Backend nos devuelve el ítem creado
            const createdItem = response.item;
            
            // Lo formateamos para la UI
            const newIconUI = {
                _id: createdItem._id,
                nombre: createdItem.name,
                imgSrc: linkIcon,
                type: 'link',
                url: createdItem.url
            };

            // Actualizamos el estado visualmente
            setIcons(prev => [...prev, newIconUI]);
            closeModal();
            sileo.success({title: "Enlace creado exitosamente"});
        }
    } catch (error) {
        console.error("Error creando ítem:", error);
    }
  };
  // FIN REMPLAZO

  const handleCreateItem = async (formData) => {
    const token = localStorage.getItem('token');
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    // Determinamos el tipo según el modo del modal
    const itemType = modalMode === 'link' ? 'link' : 'folder';

    // Preparamos datos para el Backend (Endpoint: POST /items)
    const newItemData = {
        type: itemType,
        name: formData.name,
        url: formData.url || null, // Solo si es link
        x: 100, // Podrías usar Math.random() para variar la posición
        y: 100
    };

    try {
        const response = await fetchDataBackend(
            `${backendUrl}/items`,
            newItemData,
            "POST",
            { Authorization: `Bearer ${token}` }
        );

        if (response && response.ok) {
            // const createdItem = response.item;
            
            // Formateamos para el UI
            // const newIconUI = {
            //     _id: createdItem._id,
            //     nombre: createdItem.name,
            //     imgSrc: getIconImage(createdItem.type), // Usa tu helper existente
            //     type: createdItem.type,
            //     url: createdItem.url,
            //     windowOptions: { defaultWidth: 500, defaultHeight: 400 } // Opcional
            // };

            // setIcons(prev => [...prev, newIconUI]);
            closeModal();
            sileo.success({title: itemType === 'folder' ? "Carpeta creada" : "Enlace creado"});
        }
    } catch (error) {
        console.error("Error creando ítem:", error);
    }
  };

  // --- 3. CONSUMIR ENDPOINT DELETE (Nuevo) ---
  const handleDeleteItem = async (item) => {
    // Cerramos menú
    handleCloseMenu();

    // Verificamos si es app del sistema (no se pueden borrar)
    if (item._id.startsWith('sys-')) {
        sileo.error({title: "No puedes eliminar aplicaciones del sistema."});
        return;
    }

    const token = localStorage.getItem('token');
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    try {
        const response = await fetchDataBackend(
            `${backendUrl}/items/${item._id}`, // 👈 Endpoint SB-B-003 Delete
            null,
            "DELETE",
            { Authorization: `Bearer ${token}` }
        );

        if (response && response.ok) {
            // Actualizamos el estado local quitando el ítem
            setIcons(prev => prev.filter(icon => icon._id !== item._id));
            sileo.success({title: "Elemento eliminado"});
        }
    } catch (error) {
        console.error("Error eliminando:", error);
    }
  };

  

  const handleCreateQuickNote = async () => {
    handleCloseMenu(); // Cerramos el menú
    
    const token = localStorage.getItem('token');
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    // Usamos las coordenadas del menú contextual (donde hiciste clic)
    // O un default si no están disponibles
    const posX = menuState.x > 0 ? menuState.x - 50 : 100;
    const posY = menuState.y > 0 ? menuState.y - 50 : 100;

    const newItemData = {
        type: 'note',        // Tipo Nota
        name: 'Nueva Nota',  // Nombre por defecto
        url: null,
        x: posX,
        y: posY
    };

    try {
        const response = await fetchDataBackend(
            `${backendUrl}/items`,
            newItemData,
            "POST",
            { Authorization: `Bearer ${token}` }
        );

        if (response && response.ok) {
            // const createdItem = response.item;
            
            // Creamos el objeto para la UI
            // const newIconUI = {
            //     _id: createdItem._id,
            //     nombre: createdItem.name,
            //     imgSrc: getIconImage('note'), // Asegúrate que 'note' devuelva tu icono de nota
            //     type: 'note',
            //     url: null,
            //     content: "", // Contenido vacío al inicio
            //     position: { x: posX, y: posY }
            // };

            // setIcons(prev => [...prev, newIconUI]);
            sileo.success({title: "Nota creada. Haz clic en el nombre para renombrar."});
        }
    } catch (error) {
        console.error("Error creando nota rápida:", error);
    }
  };

  // --- NUEVA FUNCIÓN: CREAR ARCHIVO DE CÓDIGO ---
  const handleCreateQuickCode = async () => {
    handleCloseMenu();
    
    const token = localStorage.getItem('token');
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    // Posición donde hiciste clic
    const posX = menuState.x > 0 ? menuState.x - 50 : 120;
    const posY = menuState.y > 0 ? menuState.y - 50 : 120;

    const newItemData = {
        type: 'code',           // <--- TIPO CODE
        name: 'script.js',      // Nombre por defecto
        url: null,
        x: posX,
        y: posY
    };

    try {
        const response = await fetchDataBackend(
            `${backendUrl}/items`,
            newItemData,
            "POST",
            { Authorization: `Bearer ${token}` }
        );

        if (response && response.ok) {
            // const createdItem = response.item;
            
            // const newIconUI = {
            //     _id: createdItem._id,
            //     nombre: createdItem.name,
            //     imgSrc: getIconImage('code'), // Usará el ícono de código
            //     type: 'code',
            //     url: null,
            //     content: "", 
            //     position: { x: posX, y: posY }
            // };

            // setIcons(prev => [...prev, newIconUI]);
            sileo.success({title: "Archivo de código creado."});
        }
    } catch (error) {
        console.error("Error creando código:", error);
    }
  };

  // 2. FUNCIÓN PARA ABRIR MODAL DE COMPARTIR
  const handleOpenShareModal = () => {
    // Verificamos que sea un item del usuario (no de sistema)
    if (menuState.selectedItem && !menuState.selectedItem._id.toString().startsWith('sys-')) {
        handleCloseMenu();
        setModalMode('share'); // Modo Compartir
        setIsModalVisible(true);
    } else {
        sileo.error({title: "No puedes compartir este elemento."});
        handleCloseMenu();
    }
  };

  // NUEVA FUNCIÓN: Abrir modal para compartir MI escritorio
  const handleOpenShareDesktopModal = () => {
      // Cerramos el menú inicio si estuviera abierto (opcional, si tienes acceso al estado)
      setModalMode('share-desktop'); // Nuevo modo
      setIsModalVisible(true);
  };

  // NUEVA FUNCIÓN: Llamar al backend para compartir escritorio
  const handleShareDesktop = async (formData) => {
      const token = localStorage.getItem('token');
      const backendUrl = import.meta.env.VITE_BACKEND_URL;

      try {
          const response = await fetchDataBackend(
              `${backendUrl}/dashboard/share-desktop`, // Endpoint del backend
              { email: formData.email },     // Body
              "POST",
              { Authorization: `Bearer ${token}` }
          );

          if (response && response.ok) {
              sileo.success({title: response.msg || "¡Acceso concedido correctamente!"});
              closeModal();
          }
      } catch (error) {
          console.error("Error compartiendo escritorio:", error);
      }
  };

  // 3. FUNCIÓN PARA LLAMAR AL BACKEND (POST /share/:id)
  const handleShareItem = async (formData) => {
    const token = localStorage.getItem('token');
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const itemId = menuState.selectedItem._id; // El item que seleccionamos con click derecho

    try {
        const response = await fetchDataBackend(
            `${backendUrl}/items/share/${itemId}`, // Endpoint memorizado
            { email: formData.email, permission: formData.permission },
            "POST",
            { Authorization: `Bearer ${token}` }
        );

        if (response && response.ok) {
            sileo.success({title: `Invitación enviada a ${formData.email}`});
            closeModal();
        }
    } catch (error) {
        console.error("Error al compartir:", error);
    }
  };

  // Para no esconder íconos

  useEffect(() => {
  // Función auxiliar para guardar en backend sin bloquear la UI
  const saveLayoutToBackend = async (changedItems) => {
      if (changedItems.length === 0) return;

      const token = localStorage.getItem('token');
      const backendUrl = import.meta.env.VITE_BACKEND_URL;

      try {
          // Preparamos los datos limpios para el backend
          const payload = changedItems.map(icon => ({
              id: icon._id,
              x: icon.position.x,
              y: icon.position.y
          }));

          await fetch(`${backendUrl}/items/positions/bulk`, {
              method: 'PATCH',
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({ items: payload })
          });
          
          console.log(`💾 Auto-guardado: ${changedItems.length} íconos actualizados.`);
      } catch (error) {
          console.error("Error auto-guardando escritorio:", error);
      }
  };

  const autoArrangeIcons = () => {
    const CELL_W = 90; 
    const CELL_H = 100; 
    const MARGIN_X = 10;
    const MARGIN_Y = 10;
    const TASKBAR_HEIGHT = 55; 

    const availableHeight = window.innerHeight - TASKBAR_HEIGHT;
    let maxRows = Math.floor(availableHeight / CELL_H);
    if (maxRows < 1) maxRows = 1;

    setIcons(prevIcons => {
      // 1. Ordenamos por columnas visuales (Izquierda a Derecha, luego Arriba a Abajo)
      // Esto asegura que al hacer Zoom Out, los íconos mantengan su orden relativo
      const sortedIcons = [...prevIcons].sort((a, b) => {
        // Tolerancia de columna (la mitad de una celda)
        if (Math.abs(a.position.x - b.position.x) > (CELL_W / 2)) {
            return a.position.x - b.position.x;
        }
        return a.position.y - b.position.y;
      });

      const changedIcons = []; // Aquí guardaremos los que se muevan

      // 2. Recalcular
      const arrangedIcons = sortedIcons.map((icon, index) => {
        const col = Math.floor(index / maxRows);
        const row = index % maxRows;

        const newX = MARGIN_X + (col * CELL_W);
        const newY = MARGIN_Y + (row * CELL_H);

        // Verificamos si cambió la posición
        // (Usamos un margen de error pequeño de 1px por si acaso)
        if (Math.abs(icon.position.x - newX) > 1 || Math.abs(icon.position.y - newY) > 1) {
            const updatedIcon = { ...icon, position: { x: newX, y: newY } };
            
            // Solo guardamos si NO es un ícono de sistema (sys-...)
            // Los de sistema no se guardan en BD, así que no enviamos update
            if (!icon._id.toString().startsWith('sys-')) {
                changedIcons.push(updatedIcon);
            }
            return updatedIcon;
        }
        return icon;
      });

      // 3. Disparar guardado (Side Effect seguro)
      if (changedIcons.length > 0) {
          saveLayoutToBackend(changedIcons);
      }

      return arrangedIcons;
    });
  };

  let resizeTimer;
  const onResize = () => {
    clearTimeout(resizeTimer);
    // Esperamos 500ms después de que dejes de redimensionar para guardar
    resizeTimer = setTimeout(autoArrangeIcons, 500);
  };

  // Ejecutar al inicio para alinear todo
  autoArrangeIcons();

  window.addEventListener('resize', onResize);
  return () => window.removeEventListener('resize', onResize);

}, []);

  // 2. FUNCIÓN QUE ABRE EL SELECTOR DE ARCHIVOS
  const triggerFileUpload = () => {
    handleCloseMenu(); // Cierra el menú contextual
    if (fileInputRef.current) {
        fileInputRef.current.click(); // Simula clic en el input oculto
    }
  };

  // 3. FUNCIÓN QUE SE EJECUTA AL SELECCIONAR UN ARCHIVO
  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    e.target.value = null; 

    const token = localStorage.getItem('token');
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const posX = menuState.x > 0 ? menuState.x - 50 : 100;
    const posY = menuState.y > 0 ? menuState.y - 50 : 100;

    const formData = new FormData();
    formData.append('archivo', file);
    formData.append('x', posX);
    formData.append('y', posY);
    if (workspaceId) formData.append('workspaceId', workspaceId);

    const uploadPromise = new Promise(async (resolve, reject) => {
        try {
            const response = await fetch(`${backendUrl}/items/upload`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });
            const data = await response.json();

            if (response.ok) {
                resolve(data);
            } else {
                reject(new Error(data.msg || "Error al subir"));
            }
        } catch (error) {
            console.error(error);
            reject(new Error("Error al subir archivo"));
        }
    });

    sileo.promise(uploadPromise, {
        loading: { title: `Subiendo ${file.name}...` },
        success: { title: "Archivo subido exitosamente" },
        error: (err) => ({ title: err.message })
    });

    await uploadPromise.catch(() => {}); // Evita que caiga la app si rechaza, Sileo ya lo muestra
  };


  return (
    <div className="w-full h-screen overflow-hidden" onContextMenu={handleContextMenu} onClick={handleCloseMenu}>
      
      {/* Fondo */}
      <div className="fixed inset-0 -z-10" 
            style={{ 
                backgroundImage: `url(${currentWallpaper})`, // <--- USAR ESTADO
                backgroundSize: 'cover', 
                backgroundPosition: 'center',
                transition: 'background-image 0.5s ease-in-out' // Efecto suave
            }} 
       />

      <CalendarWidget />
      <PostItWidget />

      {/* BARRA DE AVISO (Solo si es remoto) */}
      {/* BARRA DE AVISO (Solo si es remoto) */}
      {isRemote && (
        <div className="fixed top-0 left-0 right-0 h-8 bg-red-600 z-[100] flex items-center justify-center text-white text-xs font-bold shadow-lg">
            VISUALIZANDO ESCRITORIO DE: {remoteUserName?.toUpperCase()} (Modo Espectador)
        </div>
      )}

      {/* Grid de Íconos */}
      <div className="p-4 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4 content-start h-[calc(100vh-3rem)] overflow-y-auto">
        {icons.map(icon => (
          <Icon 
            key={icon._id} 
            nombre={icon.nombre} 
            imgSrc={icon.imgSrc} 
            iconData={icon} 
            onOpen={onOpenWindow}
            onContextMenu={handleContextMenuIcon}
            onMove={handleMoveIcon}
            onRename={handleRenameIcon}
          />
        ))}
      </div>

      <input 
        type="file" 
        style={{ display: 'none' }} 
        ref={fileInputRef} 
        onChange={handleFileSelect} 
      />

      {/* Menú Contextual y Modales */}
      <ContextMenu 
        isVisible={menuState.isVisible} 
        x={menuState.x} 
        y={menuState.y} 
        selectedItem={menuState.selectedItem}
        onNewLink={handleOpenNewLinkModal}
        onNewFolder={handleOpenNewFolderModal}
        onNewNote={handleCreateQuickNote}
        onNewCode={handleCreateQuickCode}
        onDelete={handleDeleteItem}
        onShare={handleOpenShareModal}
        onUploadFile={triggerFileUpload}
      />

      <Modal 
        isVisible={isModalVisible} 
        onClose={closeModal} 
        title={
            modalMode === 'folder' ? "Nueva Carpeta" : 
            modalMode === 'link' ? "Nuevo Enlace Web" : 
            modalMode === 'share' ? "Compartir Elemento" : // <--- Título dinámico
            modalMode === 'share-desktop' ? "Dar Acceso a mi PC" : ""
        }
      >
        {modalMode === 'folder' && <NewFolderForm onSubmit={handleCreateItem} />}
        {modalMode === 'link' && <NewLinkForm onSubmit={handleCreateItem} />}
        
        {/* Renderizamos el formulario de compartir */}
        {modalMode === 'share' && (
            <ShareForm 
                onSubmit={handleShareItem} 
                itemToShare={menuState.selectedItem} 
            />
        )}

        {/* 👇 NUEVO: Compartir Escritorio 👇 */}
        {modalMode === 'share-desktop' && (
            <ShareForm 
                onSubmit={handleShareDesktop} 
                isDesktop={true} // Prop para cambiar textos
            />
        )}

      </Modal>

      {/* Ventanas */}
      <div className="fixed inset-0 z-20 pointer-events-none">
        {openWindows.map(win => (
            <div key={win.id} style={{ display: win.isMinimized ? 'none' : 'block' }}>
              <AppWindow 
                // ... (tus props siguen igual)
                title={win.title} 
                zIndex={win.zIndex} 
                onClose={() => onCloseWindow(win.id)}
                onMinimize={() => onMinimizeWindow(win.id)}
                onMaximize={() => onMaximizeWindow(win.id)}
                onFocus={() => onFocusWindow(win.id)}
                isMaximized={win.isMaximized}
                defaultX={win.defaultX}
                defaultY={win.defaultY}
                defaultWidth={win.defaultWidth}
                defaultHeight={win.defaultHeight}
                id={win.id}
                onDragStop={onDragStop}
              >
                <AppRenderer 
                  appId={win.appId} 
                  data={win.data} 
                  windowId={win.id} 
                  onOpenWindow={onOpenWindow} 
                />
              </AppWindow>
            </div>
        ))}
      </div>
    </div>
  );
}

export default Desktop;