// src/features/apps/ComputerApp.jsx
import React, { useState, useEffect } from 'react';
import { useFetch } from '../../core/api/useFetch';
import { Loader, Info, Search, HardDrive, FileText, Folder, Link2, Code2, File, ChevronRight, Sparkles } from 'lucide-react';

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

const ComputerApp = ({ onOpenItem }) => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedItem, setSelectedItem] = useState(null);

    const [isSearchingAI, setIsSearchingAI] = useState(false);
    const [aiResults, setAiResults] = useState(null);

    const fetchDataBackend = useFetch();
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const token = localStorage.getItem('token');

    useEffect(() => {
        const loadAllItems = async () => {
            setLoading(true);
            try {
                const data = await fetchDataBackend(
                    `${backendUrl}/items/all`,
                    null, "GET", { Authorization: `Bearer ${token}` }
                );

                if (data && data.items) {
                    setItems(data.items);
                } else if (Array.isArray(data)) {
                    setItems(data);
                }
            } catch (error) {
                console.error("Error al cargar todos los archivos:", error);
            } finally {
                setLoading(false);
            }
        };
        loadAllItems();
    }, []);

    // Solución 3: Conservar el orden de relevancia que nos devuelve Python
    const handleAISearch = async () => {
        if (!searchTerm.trim()) return;
        setIsSearchingAI(true);
        try {
            const data = await fetchDataBackend(
                `${backendUrl}/ai/semantic-search`,
                { consulta: searchTerm },
                "POST",
                { Authorization: `Bearer ${token}` }
            );
            if (data && data.ok) {
                const resultadosIA = data.data; // Viene ordenado desde Python

                // Mapeamos iterando sobre la respuesta de la IA para NO PERDER el orden
                const itemsCompletos = resultadosIA
                    .map(resIA => items.find(item => (item._id?.toString() || item.id?.toString()) === resIA.id))
                    .filter(item => item !== undefined); // Filtramos undefined por si acaso

                setAiResults(itemsCompletos);
            }
        } catch (error) {
            console.error("Error en búsqueda semántica:", error);
        } finally {
            setIsSearchingAI(false);
        }
    };

    useEffect(() => {
        if (searchTerm === "") setAiResults(null);
    }, [searchTerm]);

    const displayedItems = aiResults !== null
        ? aiResults
        : items.filter(item =>
            item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.type.toLowerCase().includes(searchTerm.toLowerCase())
        );

    const handleDoubleClick = (item) => {
        if (item.type === 'folder') {
            onOpenItem('folder', item.name, { defaultWidth: 750, defaultHeight: 500 }, item);
        }
        else if (item.type === 'link') window.open(item.url, '_blank');
        else if (item.type === 'file') onOpenItem('file', item.name, { defaultWidth: 800, defaultHeight: 600 }, item);
        else onOpenItem(item.type === 'code' ? 'code' : 'note', item.name, {}, item);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric', month: 'short', day: 'numeric'
        });
    };

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
        <div className="flex h-full w-full bg-background overflow-hidden font-sans select-none transition-colors duration-300">
            {/* PANEL IZQUIERDO */}
            <div className="flex-1 flex flex-col bg-card shadow-xl relative z-10 border-r border-border">

                {/* CABECERA "MI EQUIPO" */}
                <div className="px-6 py-4 bg-muted border-b border-border flex items-center justify-between transition-colors duration-300">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-brand-500/10 rounded-xl">
                            <HardDrive size={22} className="text-brand-500" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-foreground leading-tight">Directorio Maestro</h2>
                            <p className="text-xs text-muted-foreground">
                                {aiResults !== null
                                    ? `${displayedItems.length} resultado${displayedItems.length !== 1 ? 's' : ''} de IA`
                                    : 'Todos tus archivos y carpetas'}
                            </p>
                        </div>
                    </div>

                    {/* Buscador con IA */}
                    <div className="relative flex items-center gap-2">
                        <div className="relative">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Búsqueda semántica IA..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAISearch()}
                                className="pl-9 pr-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 w-64 transition-all text-foreground placeholder:text-muted-foreground"
                            />
                        </div>
                        <button
                            onClick={handleAISearch}
                            disabled={isSearchingAI || !searchTerm.trim()}
                            className="p-2 bg-brand-500/10 hover:bg-brand-500/20 text-brand-500 border border-brand-500/30 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                            title="Buscar con Inteligencia Artificial"
                        >
                            {isSearchingAI
                                ? <Loader size={16} className="animate-spin" />
                                : <Sparkles size={16} />}
                        </button>
                        {aiResults !== null && (
                            <span className="absolute -top-2 -right-2 flex h-4 w-4">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-4 w-4 bg-brand-500 items-center justify-center">
                                    <Sparkles size={8} className="text-white" />
                                </span>
                            </span>
                        )}
                    </div>
                </div>

                {aiResults !== null && (
                    <div className="px-6 py-2 bg-brand-500/5 border-b border-brand-500/20 flex items-center gap-2">
                        <Sparkles size={12} className="text-brand-500" />
                        <p className="text-xs text-brand-600 dark:text-brand-400">
                            Mostrando resultados de búsqueda semántica con IA ·
                            <button
                                onClick={() => { setAiResults(null); setSearchTerm(""); }}
                                className="ml-1 underline hover:no-underline"
                            >
                                Limpiar
                            </button>
                        </p>
                    </div>
                )}

                {/* ENCABEZADO DE TABLA */}
                <div className="flex px-6 py-2.5 bg-background border-b border-border text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                    <span className="flex-1">Nombre del Archivo</span>
                    <span className="w-32 text-center hidden md:block">Tipo</span>
                    <span className="w-32 text-right hidden lg:block">Fecha</span>
                </div>

                {/* LISTA DE ARCHIVOS */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                            <Loader className="animate-spin mb-3" size={32} />
                            <p className="text-sm">Analizando disco...</p>
                        </div>
                    ) : displayedItems.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                            <HardDrive size={48} className="mb-3 opacity-30" />
                            <p className="text-sm font-medium">
                                {searchTerm ? 'No hay coincidencias' : 'No se encontraron archivos'}
                            </p>
                            {aiResults !== null && (
                                <p className="text-xs mt-1 text-muted-foreground">La IA no encontró archivos relevantes</p>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-1">
                            {displayedItems.map(item => {
                                const isSelected = selectedItem?._id === item._id;
                                const TypeIcon = getTypeIcon(item.type);

                                return (
                                    <div
                                        key={item._id || item.id || item.name}
                                        onClick={() => setSelectedItem(item)}
                                        onDoubleClick={() => handleDoubleClick(item)}
                                        className={`
                                            flex items-center gap-4 px-4 py-2.5 cursor-default transition-all rounded-lg group
                                            ${isSelected
                                                ? 'bg-brand-500 text-white shadow-md'
                                                : 'hover:bg-muted text-foreground'}
                                        `}
                                    >
                                        <div className="relative flex-shrink-0">
                                            <img src={getIconSrc(item.type)} alt="" className="w-7 h-7 object-contain drop-shadow-sm" />
                                            {aiResults !== null && (
                                                <span className="absolute -top-1 -right-1 w-3 h-3 bg-brand-500 rounded-full flex items-center justify-center">
                                                    <Sparkles size={6} className="text-white" />
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm font-medium truncate ${isSelected ? 'text-white' : 'text-foreground'}`}>
                                                {item.name}
                                            </p>
                                        </div>

                                        <div className="w-32 text-center hidden md:block">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${typeBadge(item.type, isSelected)}`}>
                                                <TypeIcon size={12} />
                                                {item.type === 'folder' ? 'Carpeta' : item.type ? item.type.charAt(0).toUpperCase() + item.type.slice(1) : 'Archivo'}
                                            </span>
                                        </div>

                                        <div className="w-32 text-right hidden lg:block">
                                            <p className={`text-xs ${isSelected ? 'text-white/80' : 'text-muted-foreground'}`}>
                                                {formatDate(item.updatedAt || item.createdAt)}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* PANEL DERECHO: DETALLES */}
            {selectedItem ? (
                <div className="w-80 bg-card flex flex-col shadow-2xl overflow-hidden transition-colors duration-300 z-20">
                    <div className="px-6 py-4 bg-muted border-b border-border transition-colors duration-300">
                        <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            <Info size={14} />
                            <span>Detalles del Sistema</span>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar">
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
                            <div>
                                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Metadatos</h4>
                                <div className="space-y-2.5">
                                    <div className="flex items-start justify-between text-xs">
                                        <span className="text-muted-foreground font-medium">Ubicación:</span>
                                        <span className="text-foreground font-medium truncate ml-4 text-right">
                                            {selectedItem.parentId ? 'Subcarpeta' : 'Directorio Raíz'}
                                        </span>
                                    </div>
                                    <div className="flex items-start justify-between text-xs">
                                        <span className="text-muted-foreground font-medium">ID de Archivo:</span>
                                        <span className="font-mono text-[10px] bg-muted px-2 py-0.5 rounded text-foreground">{(selectedItem._id || selectedItem.id || 'N/A').toString().slice(-8)}</span>
                                    </div>
                                </div>
                            </div>

                            {selectedItem.type === 'link' && (
                                <div>
                                    <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Enlace Directo</h4>
                                    <a href={selectedItem.url} target="_blank" rel="noreferrer" className="block p-3 bg-brand-500/10 border border-brand-500/30 rounded-lg hover:shadow-md transition-shadow group">
                                        <div className="flex items-center gap-2 mb-1.5">
                                            <Link2 size={14} className="text-brand-500" />
                                            <span className="text-xs font-semibold text-brand-500">Visitar Web</span>
                                        </div>
                                        <p className="text-xs text-brand-400 truncate group-hover:underline">{selectedItem.url}</p>
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>

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
                <div className="w-80 bg-card flex flex-col items-center justify-center text-muted-foreground p-8 text-center transition-colors duration-300 z-20 border-l border-border">
                    <div className="mb-4 p-6 bg-muted rounded-full">
                        <HardDrive size={40} className="opacity-30 text-brand-500" />
                    </div>
                    <h3 className="text-sm font-semibold text-foreground mb-2">Directorio Maestro</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed max-w-xs">
                        Explora todo el contenido de tu disco duro virtual. Selecciona un elemento para ver sus propiedades.
                    </p>
                </div>
            )}
        </div>
    );
};

export default ComputerApp;