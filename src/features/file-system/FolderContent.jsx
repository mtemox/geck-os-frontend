// src/features/file-system/FolderContent.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useFetch } from '../../core/api/useFetch';
import { Plus, Loader, Info, RefreshCw, ChevronRight, FileText, Folder, Link2, Code2, File, UploadCloud, ArrowLeft } from 'lucide-react';
import { useSocket } from '../../core/context/SocketContext';
import { sileo } from 'sileo';
import { useSearchParams } from 'react-router-dom';

import Modal from '../../core/ui/components/Modal';
import NewLinkForm from './NewLinkForm';

import codeIcon from '../../assets/icons/code.png';
import noteIcon from '../../assets/icons/note.png';
import folderIcon from '../../assets/icons/folder.png';
import linkIcon from '../../assets/icons/link.png';
import unknownIcon from '../../assets/icons/doc.png';
import fileIcon from '../../assets/icons/file.png';

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

const getTypeIcon = (type) => {
    switch (type) {
        case 'folder': return Folder;
        case 'link': return Link2;
        case 'note': return FileText;
        case 'code': return Code2;
        default: return File;
    }
};

const FolderContent = ({ folderId: initialFolderId, folderName: initialFolderName, onOpenItem, onContextMenu }) => {
    const [folderHistory, setFolderHistory] = useState([{ id: initialFolderId, name: initialFolderName }]);
    const currentFolder = folderHistory[folderHistory.length - 1];

    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedItem, setSelectedItem] = useState(null);
    const fileInputRef = useRef(null);
    const [isModalVisible, setIsModalVisible] = useState(false);

    const fetchDataBackend = useFetch();
    const { socket } = useSocket();

    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const token = localStorage.getItem('token');
    const [searchParams] = useSearchParams();
    const workspaceId = searchParams.get('workspace');

    const loadFolderContent = async () => {
        setLoading(true);
        try {
            const data = await fetchDataBackend(
                `${backendUrl}/items/desktop?folderId=${currentFolder.id}`,
                null, "GET", { Authorization: `Bearer ${token}` }
            );
            if (data && data.items) setItems(data.items);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadFolderContent(); }, [currentFolder.id]);

    useEffect(() => {
        if (!socket) return;

        // 1. Nombramos las funciones para poder referenciarlas
        const handleItemCreated = (newItem) => {
            if (newItem.parentId === currentFolder.id) loadFolderContent();
        };

        const handleItemDeleted = () => {
            loadFolderContent();
        };

        // 2. Encendemos la escucha
        socket.on('item-created', handleItemCreated);
        socket.on('item-deleted', handleItemDeleted);

        // 3. Apagamos SOLO la escucha de esta carpeta al salir
        return () => {
            socket.off('item-created', handleItemCreated);
            socket.off('item-deleted', handleItemDeleted);
        };
    }, [socket, currentFolder.id]);

    const handleCreateInside = async (type) => {
        if (type === 'link') { setIsModalVisible(true); return; }

        const name = prompt(`Nombre para ${type === 'folder' ? 'la carpeta' : 'el archivo'}:`);
        if (!name) return;

        try {
            await fetchDataBackend(
                `${backendUrl}/items/create`,
                { type, name, parentId: currentFolder.id, x: 0, y: 0, url: null, workspaceId: workspaceId || null },
                "POST",
                { Authorization: `Bearer ${token}` }
            );
            sileo.success({ title: "Creado correctamente" });
            loadFolderContent();
        } catch (error) {
            console.error(error);
        }
    };

    const handleCreateLink = async (formData) => {
        try {
            await fetchDataBackend(
                `${backendUrl}/items/create`,
                { type: 'link', name: formData.name, url: formData.url, parentId: currentFolder.id, x: 0, y: 0, workspaceId: workspaceId || null },
                "POST",
                { Authorization: `Bearer ${token}` }
            );
            sileo.success({ title: "Enlace creado correctamente" });
            setIsModalVisible(false);
            loadFolderContent();
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
        if (item.type === 'folder') handleOpenSubfolder(item);
        else if (item.type === 'link') window.open(item.url, '_blank');
        else if (item.type === 'file') onOpenItem('file', item.name, { defaultWidth: 800, defaultHeight: 600 }, item);
        else onOpenItem(item.type === 'code' ? 'code' : 'note', item.name, {}, item);
    };

    const triggerFileUpload = () => fileInputRef.current?.click();

    const handleFileSelect = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        e.target.value = null;

        const formData = new FormData();
        formData.append('archivo', file);
        formData.append('parentId', currentFolder.id);
        formData.append('x', 0);
        formData.append('y', 0);

        const uploadPromise = new Promise(async (resolve, reject) => {
            try {
                const response = await fetch(`${backendUrl}/items/upload`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` },
                    body: formData
                });
                const data = await response.json();
                response.ok ? resolve(data) : reject(new Error(data.msg || "Error al subir"));
            } catch (error) {
                reject(new Error("Error de red al subir archivo"));
            }
        });

        sileo.promise(uploadPromise, {
            loading: { title: `Subiendo ${file.name}...` },
            success: { title: "Archivo subido exitosamente" },
            error: (err) => ({ title: err.message })
        });

        try {
            await uploadPromise;
            loadFolderContent();
        } catch (_) { }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric', month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    // ── Clases reutilizables ──────────────────────────────────────────────────
    const toolbarBtn = "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-foreground bg-card hover:bg-muted border border-border rounded-lg shadow-sm transition-all hover:shadow";

    // Badge de tipo: colores semánticos fijos (amber/green/purple/pink/blue)
    // no dependen del acento — son indicadores de categoría, no de marca
    const typeBadge = (type, selected) => {
        if (selected) return 'bg-white/20 text-white';
        switch (type) {
            case 'folder': return 'bg-amber-50  dark:bg-amber-500/10  text-amber-700  dark:text-amber-400';
            case 'code': return 'bg-green-50  dark:bg-green-500/10  text-green-700  dark:text-green-400';
            case 'link': return 'bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400';
            case 'file': return 'bg-pink-50   dark:bg-pink-500/10   text-pink-700   dark:text-pink-400';
            default: return 'bg-blue-50   dark:bg-blue-500/10   text-blue-700   dark:text-blue-400';
        }
    };

    return (
        <div

            className="flex h-full w-full bg-background overflow-hidden font-sans select-none transition-colors duration-300"
            onContextMenu={(e) => {
                e.stopPropagation();
            }}

        >

            {/* ========== PANEL IZQUIERDO ========== */}
            <div className="flex-1 flex flex-col bg-card shadow-xl">

                {/* BARRA DE HERRAMIENTAS */}
                <div className="px-4 py-3 bg-muted border-b border-border flex items-center gap-2 transition-colors duration-300">

                    {folderHistory.length > 1 && (
                        <button onClick={handleGoBack} className={toolbarBtn} title="Volver atrás">
                            <ArrowLeft size={14} />
                            <span className="hidden sm:inline">Atrás</span>
                        </button>
                    )}

                    <div className="flex gap-1.5">
                        <button onClick={() => handleCreateInside('folder')} className={toolbarBtn} title="Nueva carpeta">
                            <Folder size={14} className="text-amber-500" />
                            <span className="hidden sm:inline">Carpeta</span>
                        </button>
                        <button onClick={triggerFileUpload} className={toolbarBtn} title="Subir archivo">
                            <UploadCloud size={14} className="text-brand-500" />
                            <span className="hidden sm:inline">Subir</span>
                        </button>
                        <button onClick={() => handleCreateInside('note')} className={toolbarBtn} title="Nueva nota">
                            <FileText size={14} className="text-blue-500" />
                            <span className="hidden sm:inline">Nota</span>
                        </button>
                        <button onClick={() => handleCreateInside('code')} className={toolbarBtn} title="Nuevo código">
                            <Code2 size={14} className="text-green-500" />
                            <span className="hidden sm:inline">Código</span>
                        </button>
                        <button onClick={() => handleCreateInside('link')} className={toolbarBtn} title="Nuevo enlace">
                            <Link2 size={14} className="text-pink-500" />
                            <span className="hidden sm:inline">Enlace</span>
                        </button>
                    </div>

                    <div className="flex-1" />

                    <button onClick={loadFolderContent} className="p-2 hover:bg-muted rounded-lg transition-colors" title="Recargar">
                        <RefreshCw size={16} className={`text-muted-foreground ${loading ? "animate-spin" : ""}`} />
                    </button>
                </div>

                {/* BREADCRUMB */}
                <div className="px-4 py-2 bg-card border-b border-border flex items-center gap-2 text-xs text-muted-foreground transition-colors duration-300">
                    <Folder size={14} className="text-amber-500" />
                    <div className="flex items-center gap-1 flex-1 overflow-x-auto scrollbar-none">
                        {folderHistory.map((folder, index) => (
                            <React.Fragment key={folder.id}>
                                {index > 0 && <ChevronRight size={12} className="text-muted-foreground/50" />}
                                <button
                                    onClick={() => {
                                        if (index < folderHistory.length - 1)
                                            setFolderHistory(prev => prev.slice(0, index + 1));
                                    }}
                                    className={`font-medium hover:text-brand-500 transition-colors ${index === folderHistory.length - 1
                                        ? 'text-foreground'
                                        : 'text-muted-foreground'
                                        }`}
                                >
                                    {folder.name}
                                </button>
                            </React.Fragment>
                        ))}
                    </div>
                    <span className="text-muted-foreground/50">•</span>
                    <span>{items.length} {items.length === 1 ? 'elemento' : 'elementos'}</span>
                </div>

                {/* ENCABEZADO DE TABLA */}
                <div className="flex px-4 py-2 bg-muted border-b border-border text-[11px] font-semibold text-muted-foreground uppercase tracking-wide transition-colors duration-300">
                    <span className="flex-1">Nombre</span>
                    <span className="w-32 text-center hidden md:block">Tipo</span>
                    <span className="w-40 text-right hidden lg:block">Modificado</span>
                </div>

                {/* LISTA DE ARCHIVOS */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {loading && items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                            <Loader className="animate-spin mb-3" size={32} />
                            <p className="text-sm">Cargando archivos...</p>
                        </div>
                    ) : items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                            <Folder size={48} className="mb-3 opacity-30" />
                            <p className="text-sm font-medium">Esta carpeta está vacía</p>
                            <p className="text-xs mt-1 opacity-70">Crea un nuevo archivo o carpeta para empezar</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-border">
                            {items.map(item => {
                                const isSelected = selectedItem?._id === item._id;
                                const TypeIcon = getTypeIcon(item.type);

                                return (
                                    <div
                                        key={item._id}
                                        onClick={() => setSelectedItem(item)}
                                        onDoubleClick={() => handleDoubleClick(item)}
                                        onContextMenu={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation(); // Evita que llegue al fondo de la carpeta
                                            if (onContextMenu) onContextMenu(e, item); // Llama al menú del escritorio
                                        }}
                                        className={`
                                            flex items-center gap-3 px-4 py-2.5 cursor-default transition-all group
                                            ${isSelected
                                                ? 'bg-brand-500 text-white shadow-md'
                                                : 'hover:bg-muted text-foreground'}
                                        `}
                                    >
                                        <div className="relative flex-shrink-0">
                                            <img src={getIconSrc(item.type)} alt="" className="w-6 h-6 object-contain drop-shadow-sm" />
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm font-medium truncate ${isSelected ? 'text-white' : 'text-foreground'}`}>
                                                {item.name}
                                            </p>
                                            {item.type === 'link' && (
                                                <p className={`text-xs truncate mt-0.5 ${isSelected ? 'text-white/70' : 'text-muted-foreground'}`}>
                                                    {item.url}
                                                </p>
                                            )}
                                        </div>

                                        <div className="w-32 text-center hidden md:block">
                                            <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium ${typeBadge(item.type, isSelected)}`}>
                                                <TypeIcon size={12} />
                                                {item.type === 'folder' ? 'Carpeta' : item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                                            </span>
                                        </div>

                                        <div className="w-40 text-right hidden lg:block">
                                            <p className={`text-xs ${isSelected ? 'text-white/80' : 'text-muted-foreground'}`}>
                                                {formatDate(item.updatedAt || item.createdAt)}
                                            </p>
                                        </div>

                                        {item.type === 'folder' && (
                                            <ChevronRight size={16} className={`flex-shrink-0 ${isSelected ? 'text-white' : 'text-muted-foreground/50 group-hover:text-muted-foreground'}`} />
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
                <div className="w-80 bg-card border-l border-border flex flex-col shadow-2xl overflow-hidden transition-colors duration-300">

                    <div className="px-6 py-4 bg-muted border-b border-border transition-colors duration-300">
                        <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            <Info size={14} />
                            <span>Detalles</span>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        {/* Icono + nombre */}
                        <div className="flex flex-col items-center py-8 px-6 bg-muted/50 border-b border-border transition-colors duration-300">
                            <div className="relative mb-4">
                                <div className="absolute inset-0 bg-brand-500/20 blur-2xl rounded-full"></div>
                                <img src={getIconSrc(selectedItem.type)} alt="" className="relative w-24 h-24 object-contain drop-shadow-2xl" />
                            </div>
                            <h3 className="text-base font-semibold text-foreground text-center break-words w-full px-2 leading-tight">
                                {selectedItem.name}
                            </h3>
                            <p className="text-xs text-muted-foreground mt-1 capitalize">
                                {selectedItem.type === 'folder' ? 'Carpeta' : `Archivo ${selectedItem.type}`}
                            </p>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Información general */}
                            <div>
                                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Información</h4>
                                <div className="space-y-2.5">
                                    {[
                                        { label: 'Tipo', value: selectedItem.type === 'folder' ? 'Carpeta' : selectedItem.type },
                                        { label: 'ID', value: <span className="font-mono text-[10px] bg-muted px-2 py-0.5 rounded">{selectedItem._id.slice(-8)}</span> },
                                        selectedItem.createdAt && { label: 'Creado', value: formatDate(selectedItem.createdAt) },
                                        selectedItem.updatedAt && { label: 'Modificado', value: formatDate(selectedItem.updatedAt) },
                                    ].filter(Boolean).map(({ label, value }) => (
                                        <div key={label} className="flex items-start justify-between text-xs">
                                            <span className="text-muted-foreground font-medium">{label}:</span>
                                            <span className="text-foreground font-medium capitalize text-right">{value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Enlace */}
                            {selectedItem.type === 'link' && (
                                <div>
                                    <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Enlace</h4>
                                    <a
                                        href={selectedItem.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="block p-3 bg-brand-500/10 border border-brand-500/30 rounded-lg hover:shadow-md transition-shadow group"
                                    >
                                        <div className="flex items-center gap-2 mb-1.5">
                                            <Link2 size={14} className="text-brand-500" />
                                            <span className="text-xs font-semibold text-brand-500">Abrir enlace</span>
                                        </div>
                                        <p className="text-xs text-brand-400 truncate group-hover:underline">{selectedItem.url}</p>
                                    </a>
                                </div>
                            )}

                            {/* Vista previa código / nota */}
                            {(selectedItem.type === 'note' || selectedItem.type === 'code') && (
                                <div>
                                    <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Vista Previa</h4>
                                    <div className="relative">
                                        <div className="absolute top-2 right-2 z-10">
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-card/80 backdrop-blur-sm text-foreground text-[9px] font-mono rounded border border-border">
                                                {selectedItem.type === 'code' ? <Code2 size={10} /> : <FileText size={10} />}
                                                {selectedItem.type.toUpperCase()}
                                            </span>
                                        </div>
                                        <div className={`p-4 rounded-lg border h-64 overflow-y-auto custom-scrollbar text-xs leading-relaxed
                                            ${selectedItem.type === 'code'
                                                ? 'bg-slate-900 dark:bg-black/60 border-border font-mono text-green-400'
                                                : 'bg-muted border-border text-foreground'}`}>
                                            {selectedItem.content
                                                ? <pre className="whitespace-pre-wrap">{selectedItem.content.substring(0, 500)}{selectedItem.content.length > 500 ? '...' : ''}</pre>
                                                : <span className="italic text-muted-foreground">Archivo vacío</span>}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Botón de acción */}
                    <div className="p-4 bg-muted border-t border-border transition-colors duration-300">
                        <button
                            onClick={() => handleDoubleClick(selectedItem)}
                            className="w-full px-4 py-2.5 bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium rounded-lg shadow-sm hover:shadow transition-all flex items-center justify-center gap-2"
                        >
                            {selectedItem.type === 'folder'
                                ? <><Folder size={16} /><span>Abrir carpeta</span></>
                                : selectedItem.type === 'link'
                                    ? <><Link2 size={16} /><span>Visitar enlace</span></>
                                    : <><FileText size={16} /><span>Abrir archivo</span></>}
                        </button>
                    </div>
                </div>
            ) : (
                <div className="w-80 bg-card border-l border-border flex flex-col items-center justify-center text-muted-foreground p-8 text-center transition-colors duration-300">
                    <div className="mb-4 p-6 bg-muted rounded-full">
                        <Info size={40} className="opacity-30" />
                    </div>
                    <h3 className="text-sm font-semibold text-foreground mb-2">Sin selección</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed max-w-xs">
                        Selecciona un archivo o carpeta de la lista para ver sus detalles y opciones.
                    </p>
                </div>
            )}

            <input type="file" style={{ display: 'none' }} ref={fileInputRef} onChange={handleFileSelect} />

            <Modal isVisible={isModalVisible} onClose={() => setIsModalVisible(false)} title="Nuevo Enlace">
                <NewLinkForm onSubmit={handleCreateLink} />
            </Modal>
        </div>
    );
};

export default FolderContent;