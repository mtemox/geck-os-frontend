// src/components/apps/WhiteboardApp.jsx
import React, { useRef, useState, useEffect } from 'react';
import { Pen, Eraser, Trash2, Download, Palette, Minus } from 'lucide-react';
import { sileo } from 'sileo';

const WhiteboardApp = () => {
    const canvasRef = useRef(null);
    const contextRef = useRef(null);
    
    const [isDrawing, setIsDrawing] = useState(false);
    const [color, setColor] = useState('#1e293b'); // Gris oscuro casi negro (Apple style)
    const [brushSize, setBrushSize] = useState(3);
    const [tool, setTool] = useState('pen'); // 'pen' o 'eraser'

    // Colores predefinidos vibrantes y elegantes
    const PRESET_COLORS = ['#1e293b', '#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6'];

    useEffect(() => {
        const canvas = canvasRef.current;
        const dpr = window.devicePixelRatio || 1;
        
        // Resolución interna en formato rectangular (16:9 clásico)
        canvas.width = 1920 * dpr;
        canvas.height = 1080 * dpr;
        
        const context = canvas.getContext("2d");
        context.scale(dpr, dpr);
        context.lineCap = "round";
        context.lineJoin = "round";
        contextRef.current = context;

        // Pizarrón estrictamente blanco al iniciar
        clearCanvas(false);
    }, []);

    // Actualizar el pincel cuando cambian las herramientas
    useEffect(() => {
        if (contextRef.current) {
            // Si usamos el borrador, pintamos de blanco
            contextRef.current.strokeStyle = tool === 'eraser' ? '#ffffff' : color; 
            contextRef.current.lineWidth = tool === 'eraser' ? brushSize * 4 : brushSize;
        }
    }, [color, brushSize, tool]);

    // 🌟 LA MAGIA: Calcula las coordenadas exactas resolviendo el desfase
    const getCoordinates = (e) => {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        
        return {
            x: ((e.clientX - rect.left) * scaleX) / dpr,
            y: ((e.clientY - rect.top) * scaleY) / dpr
        };
    };

    const startDrawing = (e) => {
        const { x, y } = getCoordinates(e);
        contextRef.current.beginPath();
        contextRef.current.moveTo(x, y);
        setIsDrawing(true);
    };

    const finishDrawing = () => {
        contextRef.current.closePath();
        setIsDrawing(false);
    };

    const draw = (e) => {
        if (!isDrawing) return;
        const { x, y } = getCoordinates(e);
        contextRef.current.lineTo(x, y);
        contextRef.current.stroke();
    };

    const clearCanvas = (showToast = true) => {
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");
        context.fillStyle = '#ffffff'; // Fondo blanco garantizado
        context.fillRect(0, 0, canvas.width, canvas.height);
        if (showToast) sileo.success({title: "Pizarrón limpio"});
    };

    const downloadCanvas = () => {
        const canvas = canvasRef.current;
        const url = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.download = `MiDesk_Pizarron_${Date.now()}.png`;
        link.href = url;
        link.click();
        sileo.success({title: "¡Dibujo descargado!"});
    };

    return (
        <div className="relative w-full h-full bg-white overflow-hidden flex flex-col">
            
            {/* Lienzo */}
            <canvas
                ref={canvasRef}
                onMouseDown={startDrawing}
                onMouseUp={finishDrawing}
                onMouseOut={finishDrawing}
                onMouseMove={draw}
                className="w-full h-full cursor-crosshair touch-none"
                style={{ width: '100%', height: '100%' }}
            />

            {/* Barra de herramientas flotante (Estilo Apple Dock) */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 p-2.5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] animate-fade-in-up">
                
                {/* Herramientas principales */}
                <div className="flex gap-1 bg-slate-100 dark:bg-white/5 rounded-full p-1">
                    <button
                        onClick={() => setTool('pen')}
                        className={`p-2.5 rounded-full transition-all duration-300 ${tool === 'pen' ? 'bg-blue-500 text-white shadow-md scale-105' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10'}`}
                        title="Lápiz"
                    >
                        <Pen size={18} />
                    </button>
                    <button
                        onClick={() => setTool('eraser')}
                        className={`p-2.5 rounded-full transition-all duration-300 ${tool === 'eraser' ? 'bg-slate-700 dark:bg-slate-200 text-white dark:text-slate-800 shadow-md scale-105' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10'}`}
                        title="Borrador"
                    >
                        <Eraser size={18} />
                    </button>
                </div>

                <div className="w-px h-6 bg-slate-300 dark:bg-white/10 mx-0.5"></div>

                {/* Colores */}
                <div className="flex items-center gap-2 px-1">
                    {PRESET_COLORS.map(c => (
                        <button
                            key={c}
                            onClick={() => { setColor(c); setTool('pen'); }}
                            className={`w-6 h-6 rounded-full transition-all duration-300 ${color === c && tool === 'pen' ? 'scale-125 ring-2 ring-offset-2 ring-offset-white dark:ring-offset-slate-900 ring-blue-400 shadow-sm' : 'hover:scale-110 opacity-80 hover:opacity-100'}`}
                            style={{ backgroundColor: c }}
                            title={`Color ${c}`}
                        />
                    ))}
                    {/* Selector de Color Custom */}
                    <label className="relative ml-1 cursor-pointer overflow-hidden rounded-full w-6 h-6 border border-slate-300 dark:border-white/20 hover:border-slate-400 transition-colors shadow-sm">
                        <input 
                            type="color" 
                            value={color}
                            onChange={(e) => { setColor(e.target.value); setTool('pen'); }}
                            className="absolute -top-2 -left-2 w-10 h-10 cursor-pointer opacity-0"
                        />
                        <div className="w-full h-full" style={{ backgroundColor: color }}></div>
                    </label>
                </div>

                <div className="w-px h-6 bg-slate-300 dark:bg-white/10 mx-0.5"></div>

                {/* Grosor de línea */}
                <div className="flex items-center gap-2 px-2 text-slate-500 dark:text-slate-400">
                    <Minus size={14} />
                    <input 
                        type="range" 
                        min="1" max="20" 
                        value={brushSize}
                        onChange={(e) => setBrushSize(Number(e.target.value))}
                        className="w-20 accent-blue-500 cursor-pointer"
                    />
                    <Minus size={20} strokeWidth={4} />
                </div>

                <div className="w-px h-6 bg-slate-300 dark:bg-white/10 mx-0.5"></div>

                {/* Acciones Rápidas */}
                <div className="flex gap-1.5 pr-1">
                    <button
                        onClick={() => clearCanvas(true)}
                        className="p-2.5 text-slate-500 dark:text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-full transition-colors"
                        title="Limpiar pizarrón"
                    >
                        <Trash2 size={18} />
                    </button>
                    <button
                        onClick={downloadCanvas}
                        className="p-2.5 text-slate-500 dark:text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-full transition-colors"
                        title="Descargar imagen"
                    >
                        <Download size={18} />
                    </button>
                </div>

            </div>
        </div>
    );
};

export default WhiteboardApp;