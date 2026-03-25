// src/components/FolderContent.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useFetch } from '../../core/api/useFetch';
import { Plus, Loader, Info, RefreshCw, ChevronRight, FileText, Folder, Link2, Code2, File, UploadCloud, ArrowLeft } from 'lucide-react';
import { useSocket } from '../../core/context/SocketContext';
import { sileo } from 'sileo';

// 👇 1. IMPORTAR MODAL Y FORMULARIO
import Modal from '../../core/ui/components/Modal';
import NewLinkForm from './NewLinkForm';

// Importar las imágenes
import codeIcon from '../../assets/icons/code.png'; 
import noteIcon from '../../assets/icons/note.png'; 
import folderIcon from '../../assets/icons/folder.png';
import linkIcon from '../../assets/icons/link.png'; 
import unknownIcon from '../../assets/icons/doc.png';
import fileIcon from '../../assets/icons/file.png';

// Helper para obtener el icono PNG
const getIconSrc = (type) => {
    switch (type) {
        case 'folder': return folderIcon;
        case 'link': return linkIcon;
        case 'note': return noteIcon;
        case 'code': return codeIcon;
        case 'file': return fileIcon;
        default: return unknownIcon;
    }
};

// Helper para obtener icono de Lucide (para UI adicional)
const getTypeIcon = (type) => {
    switch (type) {
        case 'folder': return Folder;
        case 'link': return Link2;
        case 'note': return FileText;
        case 'code': return Code2;
        default: return File;
    }
};

const FolderContent = ({ folderId: initialFolderId, folderName: initialFolderName, onOpenItem }) => {
    const [folderHistory, setFolderHistory] = useState([{ id: initialFolderId, name: initialFolderName }]);
    const currentFolder = folderHistory[folderHistory.length - 1];
    
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedItem, setSelectedItem] = useState(null);
    const fileInputRef = useRef(null);
    
    // 👇 2. NUEVOS ESTADOS PARA EL MODAL
    const [isModalVisible, setIsModalVisible] = useState(false);
    
    const fetchDataBackend = useFetch();
    const { socket } = useSocket();
    
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const token = localStorage.getItem('token');

    // Cargar datos
    const loadFolderContent = async () => {
        setLoading(true);
        try {
            const data = await fetchDataBackend(
                `${backendUrl}/desktop?folderId=${currentFolder.id}`, 
                null, "GET", { Authorization: `Bearer ${token}` }
            );
            if (data && data.items) {
                setItems(data.items);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { 
        loadFolderContent(); 
    }, [currentFolder.id]);

    // Sockets
    useEffect(() => {
        if(socket) {
            socket.on('item-created', (newItem) => {
                if (newItem.parentId === currentFolder.id) loadFolderContent();
            });
            socket.on('item-deleted', () => loadFolderContent());
        }
        return () => {
            if(socket) {
                socket.off('item-created');
                socket.off('item-deleted');
            }
        }
    }, [socket, currentFolder.id]);

    // 👇 3. MODIFICADA: Abrir Modal si es Link, Prompt si es otro
    const handleCreateInside = async (type) => {
        
        // Si es Link, abrimos el modal y terminamos aquí
        if (type === 'link') {
            setIsModalVisible(true);
            return;
        }

        const name = prompt(`Nombre para ${type === 'folder' ? 'la carpeta' : 'el archivo'}:`);
        if (!name) return;

        try {
            const newItemData = {
                type,
                name,
                parentId: currentFolder.id,
                x: 0, y: 0,
                url: null
            };

            await fetchDataBackend(
                `${backendUrl}/items`,
                newItemData, "POST", { Authorization: `Bearer ${token}` }
            );
            
            sileo.success({title: "Creado correctamente"});
            loadFolderContent(); 
        } catch (error) {
            console.error(error);
        }
    };

    // 👇 4. NUEVA FUNCIÓN: Manejar el submit del formulario de enlace
    const handleCreateLink = async (formData) => {
        try {
            const newItemData = {
                type: 'link',
                name: formData.name,
                url: formData.url,
                parentId: currentFolder.id,
                x: 0, y: 0
            };

            await fetchDataBackend(
                `${backendUrl}/items`,
                newItemData, "POST", { Authorization: `Bearer ${token}` }
            );
            
            sileo.success({title: "Enlace creado correctamente"});
            setIsModalVisible(false); // Cerrar modal
            loadFolderContent(); // Recargar
        } catch (error) {
            console.error(error);
        }
    };

    const handleOpenSubfolder = (item) => {
        setFolderHistory(prev => [...prev, { id: item._id, name: item.name }]);
        setSelectedItem(null);
    };

    const handleGoBack = () => {
        if (folderHistory.length > 1) {
            setFolderHistory(prev => prev.slice(0, -1));
            setSelectedItem(null);
        }
    };

    const handleDoubleClick = (item) => {
        if (item.type === 'folder') {
            handleOpenSubfolder(item);
        } else if (item.type === 'link') {
            window.open(item.url, '_blank');
        } else if (item.type === 'file') {
            onOpenItem('file', item.name, { defaultWidth: 800, defaultHeight: 600 }, item);
        } else {
            const appId = item.type === 'code' ? 'code' : 'note';
            onOpenItem(appId, item.name, {}, item);
        }
    };

    const triggerFileUpload = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleFileSelect = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // 1. Reseteamos el input para poder subir el mismo archivo después si es necesario
        e.target.value = null;

        // 2. Preparamos los datos a enviar
        const formData = new FormData();
        formData.append('archivo', file);
        formData.append('parentId', currentFolder.id);
        formData.append('x', 0);
        formData.append('y', 0);

        // 3. Envolvemos tu lógica de fetch original en una Promesa pura
        const uploadPromise = new Promise(async (resolve, reject) => {
            try {
                const response = await fetch(`${backendUrl}/items/upload`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    body: formData
                });

                const data = await response.json();

                // Si todo sale bien, resolvemos la promesa
                if (response.ok) {
                    resolve(data); 
                } else {
                    // Si el backend da error, rechazamos enviando el mensaje
                    reject(new Error(data.msg || "Error al subir"));
                }
            } catch (error) {
                console.error(error);
                reject(new Error("Error de red al subir archivo"));
            }
        });

        // 4. Sileo toma el control visual de la Promesa (Loading -> Success/Error)
        sileo.promise(uploadPromise, {
            loading: { title: `Subiendo ${file.name}...` },
            success: { title: "Archivo subido exitosamente" },
            error: (err) => ({ title: err.message })
        });

        // 5. Esperamos que termine para recargar la carpeta (solo si fue exitoso)
        try {
            await uploadPromise;
            loadFolderContent(); 
        } catch (error) {
            // El error ya lo mostró Sileo en pantalla, no necesitamos hacer más aquí
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="flex h-full w-full bg-gradient-to-br from-slate-50 to-slate-100 dark:from-[#1a1a2e] dark:to-[#16213e] overflow-hidden font-sans select-none transition-colors duration-300">
            
            {/* ========== PANEL IZQUIERDO: EXPLORADOR DE ARCHIVOS ========== */}
            <div className="flex-1 flex flex-col bg-white dark:bg-[#1e1e2e] shadow-xl">
                
                {/* BARRA DE HERRAMIENTAS */}
                <div className="px-4 py-3 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-800 border-b border-slate-200 dark:border-white/10 flex items-center gap-2 transition-colors duration-300">
                    
                    {/* Botón Atrás */}
                    {folderHistory.length > 1 && (
                        <button 
                            onClick={handleGoBack} 
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-300 dark:border-white/20 rounded-lg shadow-sm transition-all hover:shadow"
                            title="Volver atrás"
                        >
                            <ArrowLeft size={14} />
                            <span className="hidden sm:inline">Atrás</span>
                        </button>
                    )}
                    
                    {/* Botones de crear */}
                    <div className="flex gap-1.5">
                        <button 
                            onClick={() => handleCreateInside('folder')} 
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-300 dark:border-white/20 rounded-lg shadow-sm transition-all hover:shadow"
                            title="Nueva carpeta"
                        >
                            <Folder size={14} className="text-amber-500" />
                            <span className="hidden sm:inline">Carpeta</span>
                        </button>
                        
                        <button 
                            onClick={triggerFileUpload} 
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-300 dark:border-white/20 rounded-lg shadow-sm transition-all hover:shadow"
                            title="Subir archivo"
                        >
                            <UploadCloud size={14} className="text-purple-500" />
                            <span className="hidden sm:inline">Subir</span>
                        </button>
                        
                        <button 
                            onClick={() => handleCreateInside('note')} 
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-300 dark:border-white/20 rounded-lg shadow-sm transition-all hover:shadow"
                            title="Nueva nota"
                        >
                            <FileText size={14} className="text-blue-500" />
                            <span className="hidden sm:inline">Nota</span>
                        </button>
                        
                        <button 
                            onClick={() => handleCreateInside('code')} 
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-300 dark:border-white/20 rounded-lg shadow-sm transition-all hover:shadow"
                            title="Nuevo código"
                        >
                            <Code2 size={14} className="text-green-500" />
                            <span className="hidden sm:inline">Código</span>
                        </button>

                        <button 
                            onClick={() => handleCreateInside('link')} 
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-300 dark:border-white/20 rounded-lg shadow-sm transition-all hover:shadow"
                            title="Nuevo enlace"
                        >
                            <Link2 size={14} className="text-pink-500" />
                            <span className="hidden sm:inline">Enlace</span>
                        </button>

                    </div>

                    <div className="flex-1"></div>

                    <button 
                        onClick={loadFolderContent} 
                        className="p-2 hover:bg-slate-200 dark:hover:bg-white/10 rounded-lg transition-colors"
                        title="Recargar"
                    >
                        <RefreshCw size={16} className={`text-slate-600 dark:text-slate-400 ${loading ? "animate-spin" : ""}`} />
                    </button>
                </div>

                {/* Breadcrumb */}
                <div className="px-4 py-2 bg-slate-50 dark:bg-gray-900/50 border-b border-slate-200 dark:border-white/5 flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 transition-colors duration-300">
                    <Folder size={14} className="text-amber-500" />
                    
                    <div className="flex items-center gap-1 flex-1 overflow-x-auto scrollbar-none">
                        {folderHistory.map((folder, index) => (
                            <React.Fragment key={folder.id}>
                                {index > 0 && <ChevronRight size={12} className="text-slate-400 dark:text-slate-600" />}
                                <button
                                    onClick={() => {
                                        if (index < folderHistory.length - 1) {
                                            setFolderHistory(prev => prev.slice(0, index + 1));
                                        }
                                    }}
                                    className={`font-medium hover:text-blue-500 dark:hover:text-blue-400 transition-colors ${
                                        index === folderHistory.length - 1 
                                            ? 'text-slate-800 dark:text-slate-200' 
                                            : 'text-slate-600 dark:text-slate-400'
                                    }`}
                                >
                                    {folder.name}
                                </button>
                            </React.Fragment>
                        ))}
                    </div>
                    
                    <span className="text-slate-400 dark:text-slate-600">•</span>
                    <span>{items.length} {items.length === 1 ? 'elemento' : 'elementos'}</span>
                </div>

                {/* ENCABEZADO DE TABLA */}
                <div className="flex px-4 py-2 bg-slate-100 dark:bg-black/20 border-b border-slate-200 dark:border-white/5 text-[11px] font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide transition-colors duration-300">
                    <span className="flex-1">Nombre</span>
                    <span className="w-32 text-center hidden md:block">Tipo</span>
                    <span className="w-40 text-right hidden lg:block">Modificado</span>
                </div>

                {/* LISTA DE ARCHIVOS */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {loading && items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-slate-400 dark:text-slate-600">
                            <Loader className="animate-spin mb-3" size={32} />
                            <p className="text-sm">Cargando archivos...</p>
                        </div>
                    ) : items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-slate-400 dark:text-slate-600">
                            <Folder size={48} className="mb-3 opacity-30" />
                            <p className="text-sm font-medium">Esta carpeta está vacía</p>
                            <p className="text-xs mt-1 opacity-70">Crea un nuevo archivo o carpeta para empezar</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100 dark:divide-white/5">
                            {items.map(item => {
                                const isSelected = selectedItem?._id === item._id;
                                const TypeIcon = getTypeIcon(item.type);
                                
                                return (
                                    <div 
                                        key={item._id}
                                        onClick={() => setSelectedItem(item)}
                                        onDoubleClick={() => handleDoubleClick(item)}
                                        className={`
                                            flex items-center gap-3 px-4 py-2.5 cursor-default transition-all group
                                            ${isSelected 
                                                ? 'bg-blue-500 dark:bg-blue-600 text-white shadow-md' 
                                                : 'hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300'}
                                        `}
                                    >
                                        <div className="relative flex-shrink-0">
                                            <img src={getIconSrc(item.type)} alt="" className="w-6 h-6 object-contain drop-shadow-sm" />
                                        </div>
                                        
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm font-medium truncate ${isSelected ? 'text-white' : 'text-slate-800 dark:text-slate-200'}`}>
                                                {item.name}
                                            </p>
                                            {item.type === 'link' && (
                                                <p className={`text-xs truncate mt-0.5 ${isSelected ? 'text-blue-100' : 'text-slate-500 dark:text-slate-500'}`}>
                                                    {item.url}
                                                </p>
                                            )}
                                        </div>

                                        <div className="w-32 text-center hidden md:block">
                                            <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium ${
                                                isSelected 
                                                    ? 'bg-white/20 text-white' 
                                                    : item.type === 'folder' 
                                                        ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400'
                                                        : item.type === 'code'
                                                            ? 'bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400'
                                                            : item.type === 'link'
                                                                ? 'bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400'
                                                                : item.type === 'file'
                                                                    ? 'bg-pink-50 dark:bg-pink-500/10 text-pink-700 dark:text-pink-400'
                                                                    : 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400'
                                            }`}>
                                                <TypeIcon size={12} />
                                                {item.type === 'folder' ? 'Carpeta' : item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                                            </span>
                                        </div>

                                        <div className="w-40 text-right hidden lg:block">
                                            <p className={`text-xs ${isSelected ? 'text-white/80' : 'text-slate-500 dark:text-slate-500'}`}>
                                                {formatDate(item.updatedAt || item.createdAt)}
                                            </p>
                                        </div>

                                        {item.type === 'folder' && (
                                            <ChevronRight size={16} className={`flex-shrink-0 ${isSelected ? 'text-white' : 'text-slate-400 dark:text-slate-600 group-hover:text-slate-600 dark:group-hover:text-slate-400'}`} />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* ========== PANEL DERECHO: DETALLES ========== */}
            {selectedItem ? (
                <div className="w-80 bg-white dark:bg-[#1a1a2e] border-l border-slate-200 dark:border-white/10 flex flex-col shadow-2xl overflow-hidden transition-colors duration-300">
                    <div className="px-6 py-4 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-800 border-b border-slate-200 dark:border-white/10 transition-colors duration-300">
                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                            <Info size={14} />
                            <span>Detalles</span>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        <div className="flex flex-col items-center py-8 px-6 bg-gradient-to-b from-slate-50 to-white dark:from-gray-900/50 dark:to-transparent border-b border-slate-200 dark:border-white/10 transition-colors duration-300">
                            <div className="relative mb-4">
                                <div className="absolute inset-0 bg-blue-500/20 dark:bg-blue-400/10 blur-2xl rounded-full"></div>
                                <img src={getIconSrc(selectedItem.type)} alt="" className="relative w-24 h-24 object-contain drop-shadow-2xl" />
                            </div>
                            <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100 text-center break-words w-full px-2 leading-tight">
                                {selectedItem.name}
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-500 mt-1 capitalize">
                                {selectedItem.type === 'folder' ? 'Carpeta' : `Archivo ${selectedItem.type}`}
                            </p>
                        </div>

                        <div className="p-6 space-y-6">
                            <div>
                                <h4 className="text-xs font-bold text-slate-500 dark:text-slate-500 uppercase tracking-wider mb-3">Información</h4>
                                <div className="space-y-2.5">
                                    <div className="flex items-start justify-between text-xs">
                                        <span className="text-slate-500 dark:text-slate-500 font-medium">Tipo:</span>
                                        <span className="text-slate-800 dark:text-slate-200 font-medium capitalize">{selectedItem.type === 'folder' ? 'Carpeta' : selectedItem.type}</span>
                                    </div>
                                    <div className="flex items-start justify-between text-xs">
                                        <span className="text-slate-500 dark:text-slate-500 font-medium">ID:</span>
                                        <span className="text-slate-800 dark:text-slate-200 font-mono text-[10px] bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded">{selectedItem._id.slice(-8)}</span>
                                    </div>
                                    {selectedItem.createdAt && (
                                        <div className="flex items-start justify-between text-xs">
                                            <span className="text-slate-500 dark:text-slate-500 font-medium">Creado:</span>
                                            <span className="text-slate-800 dark:text-slate-200 text-right">{formatDate(selectedItem.createdAt)}</span>
                                        </div>
                                    )}
                                    {selectedItem.updatedAt && (
                                        <div className="flex items-start justify-between text-xs">
                                            <span className="text-slate-500 dark:text-slate-500 font-medium">Modificado:</span>
                                            <span className="text-slate-800 dark:text-slate-200 text-right">{formatDate(selectedItem.updatedAt)}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {selectedItem.type === 'link' && (
                                <div>
                                    <h4 className="text-xs font-bold text-slate-500 dark:text-slate-500 uppercase tracking-wider mb-3">Enlace</h4>
                                    <a href={selectedItem.url} target="_blank" rel="noreferrer" className="block p-3 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border border-purple-200 dark:border-purple-700/30 rounded-lg hover:shadow-md transition-shadow group">
                                        <div className="flex items-center gap-2 mb-1.5">
                                            <Link2 size={14} className="text-purple-600 dark:text-purple-400" />
                                            <span className="text-xs font-semibold text-purple-900 dark:text-purple-300">Abrir enlace</span>
                                        </div>
                                        <p className="text-xs text-purple-700 dark:text-purple-400 truncate group-hover:underline">{selectedItem.url}</p>
                                    </a>
                                </div>
                            )}

                            {(selectedItem.type === 'note' || selectedItem.type === 'code') && (
                                <div>
                                    <h4 className="text-xs font-bold text-slate-500 dark:text-slate-500 uppercase tracking-wider mb-3">Vista Previa</h4>
                                    <div className="relative">
                                        <div className="absolute top-2 right-2 z-10">
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-900/80 dark:bg-black/60 backdrop-blur-sm text-white text-[9px] font-mono rounded">
                                                {selectedItem.type === 'code' ? <Code2 size={10} /> : <FileText size={10} />}
                                                {selectedItem.type.toUpperCase()}
                                            </span>
                                        </div>
                                        <div className={`p-4 rounded-lg border h-64 overflow-y-auto custom-scrollbar ${selectedItem.type === 'code' ? 'bg-slate-900 dark:bg-black/40 border-slate-700 dark:border-white/10 font-mono text-green-400 dark:text-green-300' : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300'} text-xs leading-relaxed`}>
                                            {selectedItem.content ? <pre className="whitespace-pre-wrap">{selectedItem.content.substring(0, 500)}{selectedItem.content.length > 500 ? '...' : ''}</pre> : <span className="italic text-slate-400 dark:text-slate-600">Archivo vacío</span>}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="p-4 bg-slate-50 dark:bg-gray-900/50 border-t border-slate-200 dark:border-white/10 transition-colors duration-300">
                        <button onClick={() => handleDoubleClick(selectedItem)} className="w-full px-4 py-2.5 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white text-sm font-medium rounded-lg shadow-sm hover:shadow transition-all flex items-center justify-center gap-2">
                            {selectedItem.type === 'folder' ? <><Folder size={16} /><span>Abrir carpeta</span></> : selectedItem.type === 'link' ? <><Link2 size={16} /><span>Visitar enlace</span></> : <><FileText size={16} /><span>Abrir archivo</span></>}
                        </button>
                    </div>
                </div>
            ) : (
                <div className="w-80 bg-slate-50 dark:bg-[#1a1a2e] border-l border-slate-200 dark:border-white/10 flex flex-col items-center justify-center text-slate-400 dark:text-slate-600 p-8 text-center transition-colors duration-300">
                    <div className="mb-4 p-6 bg-slate-100 dark:bg-white/5 rounded-full">
                        <Info size={40} className="opacity-30" />
                    </div>
                    <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">Sin selección</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-600 leading-relaxed max-w-xs">Selecciona un archivo o carpeta de la lista para ver sus detalles y opciones.</p>
                </div>
            )}

            <input type="file" style={{ display: 'none' }} ref={fileInputRef} onChange={handleFileSelect} />
            
            {/* 👇 5. AÑADIR EL MODAL AL FINAL */}
            <Modal 
                isVisible={isModalVisible} 
                onClose={() => setIsModalVisible(false)} 
                title="Nuevo Enlace"
            >
                <NewLinkForm onSubmit={handleCreateLink} />
            </Modal>

        </div>
    );
};

export default FolderContent;