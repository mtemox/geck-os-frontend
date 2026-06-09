// src/features/apps/SettingsApp.jsx
import React, { useState, useEffect } from 'react';
import { useFetch } from '../../core/api/useFetch';
import { Monitor, Upload, Check, Moon, Sun, Globe, RefreshCw, Loader, RotateCcw, Sparkles, Image as ImageIcon } from 'lucide-react';
import { sileo } from 'sileo';
import { useTheme } from '../../core/context/ThemeContext';
import { useThemeStore } from '../../core/store/useThemeStore';

// IMPORTANTE: Asegúrate de importar tu fondo por defecto aquí
import defaultWallpaperImg from '../../assets/wallpapers/wallpaperDefault1.png';

const SettingsApp = () => {
    // --- ESTADOS GLOBALES ---
    const [activeTab, setActiveTab] = useState('appearance');
    const { theme: currentTheme, setSpecificTheme } = useTheme();
    const [currentWallpaper, setCurrentWallpaper] = useState(null);

    // --- ESTADOS UNSPLASH ---
    const [unsplashImages, setUnsplashImages] = useState([]);
    const [loadingUnsplash, setLoadingUnsplash] = useState(false);
    const [unsplashQuery, setUnsplashQuery] = useState('nature');

    // --- ESTADOS IA & UPLOAD ---
    const [aiPrompt, setAiPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    // --- CONFIG ---
    const fetchDataBackend = useFetch();
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const unsplashKey = import.meta.env.VITE_UNSPLASH_API_KEY;
    const token = localStorage.getItem('token');


    const { mode, setMode, accent, setAccent, setWallpaper } = useThemeStore();

    // Array de colores disponibles
    const colorOptions = [
        { id: 'white', hex: 'bg-white border-2 border-gray-200 dark:border-gray-600' },
        { id: 'black', hex: 'bg-black border-2 border-gray-800' },
        { id: 'blue', hex: 'bg-blue-500' },
        { id: 'purple', hex: 'bg-purple-500' },
        { id: 'pink', hex: 'bg-pink-500' },
        { id: 'green', hex: 'bg-green-500' },
        { id: 'orange', hex: 'bg-orange-500' },
    ];

    // 1. CARGAR PREFERENCIAS AL INICIO
    useEffect(() => {
        const loadPrefs = async () => {
            const data = await fetchDataBackend(`${backendUrl}/users/profile`, null, "GET", { Authorization: `Bearer ${token}` });
            if (data && data.preferences) {
                if (data.preferences.theme) {
                    setSpecificTheme(data.preferences.theme);
                }
                setCurrentWallpaper(data.preferences.wallpaperUrl);
            }
        };
        loadPrefs();
    }, []);

    // 2. HELPER PARA CAMBIAR TEMA
    const handleThemeChange = async (newTheme) => {
        console.log("🎨 Cambiando tema a:", newTheme); // Debug

        // 1. Cambio visual inmediato (Contexto)
        setMode(newTheme);
        setSpecificTheme(newTheme);

        // 2. Guardar en Backend Y esperar respuesta
        const result = await savePreferences({ theme: newTheme });

        // 3. Solo disparar evento si guardó correctamente
        if (result !== false) {
            console.log("✅ Disparando evento theme-changed"); // Debug
            window.dispatchEvent(new CustomEvent('theme-changed', { detail: newTheme }));
        }
    };

    // 2. FUNCIÓN UNIFICADA PARA GUARDAR PREFERENCIAS
    const savePreferences = async (updates) => {
        try {
            const response = await fetchDataBackend(
                `${backendUrl}/users/preferences`,
                updates,
                "PUT",
                { Authorization: `Bearer ${token}` }
            );

            // Si actualizamos wallpaper
            if (updates.wallpaperUrl !== undefined) {
                setCurrentWallpaper(updates.wallpaperUrl);

                const bgToSend = updates.wallpaperUrl === "" ? defaultWallpaperImg : updates.wallpaperUrl;
                window.dispatchEvent(new CustomEvent('wallpaper-changed', { detail: bgToSend }));

                if (!isUploading && !isGenerating) {
                    sileo.success({ title: updates.wallpaperUrl === "" ? "Fondo restaurado" : "Fondo aplicado" });
                }
            }

            // Si actualizamos tema
            if (updates.theme !== undefined) {
                sileo.success({ title: `Tema cambiado a ${updates.theme === 'dark' ? 'oscuro' : 'claro'}` });
            }

            return response; // 👈 IMPORTANTE: Retornar respuesta

        } catch (error) {
            console.error("Error guardando preferencias:", error);
            sileo.error({ title: "Error al guardar preferencias" });
            return false;
        }
    };

    // 3. LOGICA UNSPLASH (Galería)
    const fetchUnsplashPhotos = async (query = 'nature') => {
        if (!unsplashKey) { sileo.error({ title: "Falta API Key Unsplash" }); return; }
        setLoadingUnsplash(true);
        setUnsplashQuery(query);
        try {
            const url = `https://api.unsplash.com/photos/random?count=6&query=${query}&orientation=landscape&client_id=${unsplashKey}`;
            const res = await fetch(url);
            const data = await res.json();
            if (res.ok) setUnsplashImages(data);
        } catch (error) { console.error(error); }
        finally { setLoadingUnsplash(false); }
    };

    useEffect(() => {
        if (activeTab === 'unsplash' && unsplashImages.length === 0) fetchUnsplashPhotos();
    }, [activeTab]);

    // 4. LOGICA SUBIR IMAGEN (Local)
    // 4. LOGICA SUBIR IMAGEN (Local) con sileo.promise
    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append('image', file);
        formData.append('type', 'wallpaper');

        // Creamos la promesa que Sileo va a observar
        const uploadPromise = new Promise(async (resolve, reject) => {
            try {
                const response = await fetch(`${backendUrl}/users/preferences`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` },
                    body: formData
                });
                const text = await response.text();
                console.log('Status:', response.status);
                console.log('Respuesta raw:', text);
                const data = JSON.parse(text);
                console.log('Respuesta backend:', data);

                if (response.ok) {
                    const newWallpaperUrl = data.preferences?.wallpaperUrl;
                    console.log('Nueva URL:', newWallpaperUrl);

                    setCurrentWallpaper(newWallpaperUrl);
                    setWallpaper(newWallpaperUrl);
                    window.dispatchEvent(new CustomEvent('wallpaper-changed', { detail: newWallpaperUrl }));

                    resolve(data);
                } else {
                    reject(new Error(data.msg || "Error subiendo"));
                }
            } catch (error) {
                console.error(error);
                reject(new Error("Error de conexión"));
            }
        });

        // Se la pasamos a Sileo
        sileo.promise(uploadPromise, {
            loading: { title: "Subiendo imagen..." },
            success: { title: "Imagen subida y aplicada" },
            error: (err) => ({ title: err.message })
        });

        try {
            await uploadPromise;
        } catch (e) {
            // El error ya lo renderiza Sileo
        } finally {
            setIsUploading(false);
        }
    };

    // 5. LOGICA GENERAR IA (HuggingFace)
    const handleGenerateAI = async () => {
        if (!aiPrompt.trim()) return sileo.warning({ title: "Describe tu imagen primero" });

        setIsGenerating(true);
        try {
            const data = await fetchDataBackend(
                `${backendUrl}/ai/generate-wallpaper`,
                { prompt: aiPrompt },
                "POST",
                { Authorization: `Bearer ${token}` }
            );

            if (data && data.ok) {
                // 👇 SOLO ACTUALIZA EL ESTADO LOCAL Y EL STORE
                // No llames a savePreferences() porque el backend ya lo guardó en el DB
                setCurrentWallpaper(data.url);
                setWallpaper(data.url);
                // Disparar el evento para que Desktop.jsx lo detecte
                window.dispatchEvent(new CustomEvent('wallpaper-changed', { detail: data.url }));

                sileo.success({ title: "¡Imagen generada y aplicada!" });
                setAiPrompt("");
            }
        } catch (error) {
            console.error(error);
            if (error.response?.status === 503) {
                sileo.info({ title: "La IA se está iniciando, intenta en unos segundos." });
            }
        } finally {
            setIsGenerating(false);
        }
    };

    // 6. LOGICA RESTAURAR
    const handleResetWallpaper = () => {
        savePreferences({ wallpaperUrl: "" });
    };

    return (
        <div className="flex h-full bg-transparent text-slate-900 dark:text-white font-sans overflow-hidden transition-colors duration-300">

            {/* --- SIDEBAR --- */}
            <div className="w-52 bg-white/40 dark:bg-black/20 backdrop-blur-md border-r border-slate-200 dark:border-white/10 p-3 space-y-1 flex flex-col shadow-lg">

                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-gray-500 px-3 py-2 mb-2">
                    Configuración
                </h3>

                <button
                    onClick={() => setActiveTab('appearance')}
                    className={`
            w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-3 text-sm font-medium transition-all
            ${activeTab === 'appearance'
                            ? 'bg-brand-500 dark:bg-brand-600 text-white shadow-md'
                            : 'text-slate-600 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-white/5'}
          `}
                >
                    <Monitor size={18} /> Apariencia
                </button>

                <button
                    onClick={() => setActiveTab('unsplash')}
                    className={`
            w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-3 text-sm font-medium transition-all
            ${activeTab === 'unsplash'
                            ? 'bg-brand-500 dark:bg-brand-600 text-white shadow-md'
                            : 'text-slate-600 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-white/5'}
          `}
                >
                    <Globe size={18} /> Galería Online
                </button>

                <button
                    onClick={() => setActiveTab('upload')}
                    className={`
            w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-3 text-sm font-medium transition-all
            ${activeTab === 'upload'
                            ? 'bg-brand-500 dark:bg-brand-600 text-white shadow-md'
                            : 'text-slate-600 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-white/5'}
          `}
                >
                    <Upload size={18} /> Subir Propia
                </button>

                <button
                    onClick={() => setActiveTab('ai')}
                    className={`
            w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-3 text-sm font-medium transition-all
            ${activeTab === 'ai'
                            ? 'bg-brand-500 dark:bg-brand-600 text-white shadow-md'
                            : 'text-slate-600 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-white/5'}
          `}
                >
                    <Sparkles size={18} /> Generar con IA
                </button>
            </div>

            {/* --- CONTENT --- */}
            <div className="flex-1 p-8 overflow-y-auto custom-scrollbar bg-slate-50 dark:bg-transparent">

                {/* PESTAÑA APARIENCIA */}
                {activeTab === 'appearance' && (
                    <div className="space-y-8 animate-fade-in max-w-3xl">

                        {/* Tema */}
                        <div>
                            <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Tema del Sistema</h2>
                            <p className="text-sm text-slate-500 dark:text-gray-400 mb-6">Elige entre modo claro u oscuro</p>

                            <div className="grid grid-cols-2 gap-4 max-w-md">
                                {/* BOTÓN LIGHT */}
                                <div
                                    onClick={() => handleThemeChange('light')}
                                    className={`
                                cursor-pointer border-2 rounded-xl p-6 flex flex-col items-center gap-3 transition-all duration-200
                                ${currentTheme === 'light'
                                            ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-500/10 shadow-lg shadow-yellow-500/20'
                                            : 'border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 hover:border-slate-300 dark:hover:border-white/20'}
                            `}
                                >
                                    <Sun size={40} className={currentTheme === 'light' ? "text-yellow-500" : "text-slate-400 dark:text-gray-500"} />
                                    <span className={`font-semibold text-sm ${currentTheme === 'light' ? "text-yellow-700 dark:text-yellow-400" : "text-slate-600 dark:text-gray-400"}`}>
                                        Modo Claro
                                    </span>
                                    {currentTheme === 'light' && (
                                        <div className="w-full h-1 bg-yellow-500 rounded-full mt-2"></div>
                                    )}
                                </div>

                                {/* BOTÓN DARK */}
                                <div
                                    onClick={() => handleThemeChange('dark')}
                                    className={`
                                cursor-pointer border-2 rounded-xl p-6 flex flex-col items-center gap-3 transition-all duration-200
                                ${currentTheme === 'dark'
                                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-600/20 shadow-lg shadow-blue-500/20'
                                            : 'border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 hover:border-slate-300 dark:hover:border-white/20'}
                            `}
                                >
                                    <Moon size={40} className={currentTheme === 'dark' ? "text-blue-500" : "text-slate-400 dark:text-gray-500"} />
                                    <span className={`font-semibold text-sm ${currentTheme === 'dark' ? "text-blue-700 dark:text-blue-300" : "text-slate-600 dark:text-gray-400"}`}>
                                        Modo Oscuro
                                    </span>
                                    {currentTheme === 'dark' && (
                                        <div className="w-full h-1 bg-blue-500 rounded-full mt-2"></div>
                                    )}
                                </div>

                                {/* Nuevo Selector de Color de Acento */}
                                <div className="mt-8">
                                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Color de Acento</h2>
                                    <p className="text-sm text-slate-500 dark:text-gray-400 mb-4">Personaliza el color principal de Geck-OS</p>

                                    <div className="flex gap-4">
                                        {colorOptions.map((color) => {
                                            // Desactivar Negro si el tema es Claro, desactivar Blanco si el tema es Oscuro
                                            const isConflict = (currentTheme === 'light' && color.id === 'black') ||
                                                (currentTheme === 'dark' && color.id === 'white');

                                            return (
                                                <button
                                                    key={color.id}
                                                    disabled={isConflict}
                                                    onClick={() => {
                                                        setAccent(color.id);
                                                        savePreferences({ accent: color.id });
                                                    }}
                                                    className={`
                                            w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300
                                            ${color.hex} shadow-lg
                                            ${isConflict ? 'opacity-20 cursor-not-allowed grayscale' : 'hover:scale-110'}
                                            ${accent === color.id && !isConflict ? 'ring-4 ring-offset-4 ring-offset-slate-50 dark:ring-offset-[#1e1e2e] ring-current scale-110' : (!isConflict ? 'opacity-80 hover:opacity-100' : '')}
                                        `}
                                                >
                                                    {accent === color.id && (
                                                        <Check
                                                            size={20}
                                                            // Si el color elegido es blanco, el visto debe ser negro para que se note
                                                            className={`${color.id === 'white' ? 'text-black' : 'text-white'} drop-shadow-md`}
                                                        />
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                            </div>
                        </div>

                        {/* Fondo Actual */}
                        <div>
                            <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Fondo de Pantalla</h2>
                            <p className="text-sm text-slate-500 dark:text-gray-400 mb-6">Restaurar al fondo original de Geck-OS</p>

                            <div className="flex items-start gap-6">
                                <div
                                    className="relative w-48 aspect-video rounded-xl overflow-hidden border-2 border-slate-200 dark:border-white/20 group cursor-pointer shadow-lg hover:shadow-xl transition-all"
                                    onClick={handleResetWallpaper}
                                >
                                    <img
                                        src={defaultWallpaperImg}
                                        alt="Default"
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent group-hover:from-black/40 transition-all">
                                        <div className="absolute bottom-2 left-2 text-xs font-bold text-white bg-black/50 px-2 py-1 rounded">
                                            Fondo Original
                                        </div>
                                    </div>
                                    {(!currentWallpaper || currentWallpaper === "") && (
                                        <div className="absolute top-2 right-2 bg-green-500 text-white p-1.5 rounded-full shadow-lg">
                                            <Check size={14} strokeWidth={3} />
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-col gap-3">
                                    <p className="text-sm text-slate-600 dark:text-gray-400 leading-relaxed">
                                        Vuelve al fondo de escritorio predeterminado de Geck-OS.
                                    </p>
                                    <button
                                        onClick={handleResetWallpaper}
                                        className="flex items-center gap-2 px-4 py-2.5 bg-slate-200 dark:bg-gray-700 hover:bg-slate-300 dark:hover:bg-gray-600 text-slate-800 dark:text-white rounded-lg text-sm font-semibold transition-colors shadow-sm hover:shadow-md w-fit"
                                    >
                                        <RotateCcw size={16} /> Restaurar Fondo
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* PESTAÑA UNSPLASH */}
                {activeTab === 'unsplash' && (
                    <div className="space-y-6 animate-fade-in h-full flex flex-col">
                        <div className="flex justify-between items-end border-b border-slate-200 dark:border-white/10 pb-4">
                            <div>
                                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Galería de Fondos</h2>
                                <p className="text-sm text-slate-500 dark:text-gray-400 mt-1">Imágenes de alta calidad de Unsplash</p>
                            </div>
                            <div className="flex gap-2 text-xs">
                                {['nature', 'technology', 'cyberpunk', 'architecture'].map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => fetchUnsplashPhotos(cat)}
                                        className={`
                                    px-3 py-1.5 rounded-full border capitalize font-medium transition-all
                                    ${unsplashQuery === cat
                                                ? 'bg-purple-500 dark:bg-purple-600 border-purple-500 dark:border-purple-500 text-white shadow-md'
                                                : 'bg-white dark:bg-gray-800 border-slate-300 dark:border-gray-600 text-slate-600 dark:text-gray-300 hover:border-slate-400 dark:hover:border-white/30'}
                                `}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {loadingUnsplash ? (
                            <div className="flex-1 flex items-center justify-center">
                                <div className="flex flex-col items-center gap-3">
                                    <Loader className="animate-spin text-purple-500" size={40} />
                                    <p className="text-sm text-slate-500 dark:text-gray-400">Cargando imágenes...</p>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {unsplashImages.map((img) => (
                                    <div
                                        key={img.id}
                                        className="group relative aspect-video bg-slate-200 dark:bg-gray-800 rounded-xl overflow-hidden cursor-pointer border-2 border-transparent hover:border-purple-500 transition-all shadow-md hover:shadow-xl"
                                        onClick={() => savePreferences({ wallpaperUrl: img.urls.regular })}
                                    >
                                        <img
                                            src={img.urls.small}
                                            alt={img.alt_description}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                                            <span className="bg-white text-slate-900 px-4 py-2 rounded-full text-sm font-bold shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform">
                                                Aplicar Fondo
                                            </span>
                                        </div>
                                        {currentWallpaper === img.urls.regular && (
                                            <div className="absolute top-2 right-2 bg-green-500 text-white p-1.5 rounded-full shadow-lg">
                                                <Check size={14} strokeWidth={3} />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        <button
                            onClick={() => fetchUnsplashPhotos(unsplashQuery)}
                            className="self-center flex items-center gap-2 text-sm text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white font-medium transition-colors"
                        >
                            <RefreshCw size={16} /> Cargar más imágenes
                        </button>
                    </div>
                )}

                {/* PESTAÑA UPLOAD */}
                {activeTab === 'upload' && (
                    <div className="space-y-6 animate-fade-in max-w-2xl">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Subir Imagen Propia</h2>
                            <p className="text-sm text-slate-500 dark:text-gray-400 mt-1">Carga tu imagen favorita desde tu dispositivo</p>
                        </div>

                        <div className="aspect-video w-full bg-slate-100 dark:bg-gray-800 rounded-2xl overflow-hidden border-2 border-dashed border-slate-300 dark:border-gray-600 flex flex-col items-center justify-center relative group hover:border-purple-500 dark:hover:border-purple-500 transition-all shadow-lg">
                            {isUploading ? (
                                <div className="flex flex-col items-center gap-3">
                                    <Loader className="animate-spin text-purple-500" size={40} />
                                    <span className="text-sm text-slate-600 dark:text-gray-400 font-medium">Subiendo a la nube...</span>
                                </div>
                            ) : (
                                <>
                                    {currentWallpaper && (
                                        <img
                                            src={currentWallpaper}
                                            className="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:opacity-10 transition-opacity"
                                            alt="Preview"
                                        />
                                    )}
                                    <Upload size={56} className="text-slate-400 dark:text-gray-500 mb-3 z-10" />
                                    <p className="text-slate-700 dark:text-gray-300 z-10 font-semibold text-lg">Haz clic para subir</p>
                                    <p className="text-sm text-slate-500 dark:text-gray-500 z-10 mt-2">JPG, PNG (Máx. 5MB)</p>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileUpload}
                                        className="absolute inset-0 opacity-0 cursor-pointer z-20"
                                    />
                                </>
                            )}
                        </div>
                    </div>
                )}

                {/* PESTAÑA IA */}
                {activeTab === 'ai' && (
                    <div className="space-y-6 animate-fade-in max-w-2xl">
                        <div className="flex items-center gap-3 mb-4">
                            <Sparkles className="text-purple-500" size={32} />
                            <div>
                                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Generador de Fondos IA</h2>
                                <p className="text-sm text-slate-500 dark:text-gray-400 mt-1">Crea fondos únicos con Inteligencia Artificial</p>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800/50 rounded-2xl p-6 border border-slate-200 dark:border-white/10 shadow-lg">
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-semibold text-slate-700 dark:text-gray-300 mb-2 block">
                                        Describe tu fondo ideal (en inglés):
                                    </label>
                                    <textarea
                                        value={aiPrompt}
                                        onChange={(e) => setAiPrompt(e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-gray-900 border border-slate-300 dark:border-gray-700 rounded-xl p-4 focus:border-purple-500 dark:focus:border-purple-500 outline-none resize-none h-32 text-sm text-slate-800 dark:text-white transition-colors"
                                        placeholder="Ej: A futuristic city with neon lights, cyberpunk style, high quality, 4k..."
                                    />
                                </div>

                                <button
                                    onClick={handleGenerateAI}
                                    disabled={isGenerating || !aiPrompt.trim()}
                                    className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-xl font-bold shadow-lg hover:shadow-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none flex items-center justify-center gap-3 transition-all text-white text-base"
                                >
                                    {isGenerating ? (
                                        <>
                                            <Loader className="animate-spin" size={20} />
                                            La IA está pintando tu fondo...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles size={20} />
                                            Generar Fondo con IA
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700/30 rounded-xl p-4">
                            <p className="text-xs text-blue-700 dark:text-blue-300 text-center">
                                ⚡ Powered by Stable Diffusion XL (vía HuggingFace) • La generación puede tardar 20-30 segundos
                            </p>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default SettingsApp;