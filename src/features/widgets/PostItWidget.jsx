// src/features/widgets/PostItWidget.jsx
import React, { useState, useRef } from 'react';
import Draggable from 'react-draggable';
import { GripHorizontal, CheckCircle2, Circle, Repeat2, Plus } from 'lucide-react';

// Paleta de colores estilo Apple (pasteles + modo oscuro adaptativo)
const THEMES = {
    yellow: { 
        bg: 'bg-yellow-200/90 dark:bg-yellow-600/30', 
        border: 'border-yellow-300 dark:border-yellow-500/30', 
        text: 'text-yellow-950 dark:text-yellow-50', 
        muted: 'text-yellow-700 dark:text-yellow-200/70',
        fold: 'from-yellow-100 to-yellow-300 dark:from-yellow-500 dark:to-yellow-700',
        input: 'bg-white/40 dark:bg-black/20 focus:ring-yellow-400 placeholder-yellow-700/50 dark:placeholder-yellow-200/40',
        btn: 'bg-yellow-400 hover:bg-yellow-500 text-yellow-950 dark:bg-yellow-500 dark:hover:bg-yellow-400 dark:text-yellow-950'
    },
    blue: { 
        bg: 'bg-blue-200/90 dark:bg-blue-600/30', 
        border: 'border-blue-300 dark:border-blue-500/30', 
        text: 'text-blue-950 dark:text-blue-50', 
        muted: 'text-blue-700 dark:text-blue-200/70',
        fold: 'from-blue-100 to-blue-300 dark:from-blue-500 dark:to-blue-700',
        input: 'bg-white/40 dark:bg-black/20 focus:ring-blue-400 placeholder-blue-700/50 dark:placeholder-blue-200/40',
        btn: 'bg-blue-400 hover:bg-blue-500 text-blue-950 dark:bg-blue-500 dark:hover:bg-blue-400 dark:text-blue-950'
    },
    pink: { 
        bg: 'bg-pink-200/90 dark:bg-pink-600/30', 
        border: 'border-pink-300 dark:border-pink-500/30', 
        text: 'text-pink-950 dark:text-pink-50', 
        muted: 'text-pink-700 dark:text-pink-200/70',
        fold: 'from-pink-100 to-pink-300 dark:from-pink-500 dark:to-pink-700',
        input: 'bg-white/40 dark:bg-black/20 focus:ring-pink-400 placeholder-pink-700/50 dark:placeholder-pink-200/40',
        btn: 'bg-pink-400 hover:bg-pink-500 text-pink-950 dark:bg-pink-500 dark:hover:bg-pink-400 dark:text-pink-950'
    },
    green: { 
        bg: 'bg-emerald-200/90 dark:bg-emerald-600/30', 
        border: 'border-emerald-300 dark:border-emerald-500/30', 
        text: 'text-emerald-950 dark:text-emerald-50', 
        muted: 'text-emerald-700 dark:text-emerald-200/70',
        fold: 'from-emerald-100 to-emerald-300 dark:from-emerald-500 dark:to-emerald-700',
        input: 'bg-white/40 dark:bg-black/20 focus:ring-emerald-400 placeholder-emerald-700/50 dark:placeholder-emerald-200/40',
        btn: 'bg-emerald-400 hover:bg-emerald-500 text-emerald-950 dark:bg-emerald-500 dark:hover:bg-emerald-400 dark:text-emerald-950'
    }
};

// Componente para el pliegue de la esquina
const FoldedCorner = ({ theme }) => (
    <div className={`absolute bottom-0 right-0 w-8 h-8 bg-gradient-to-br ${theme.fold} rounded-tl-xl shadow-[-3px_-3px_5px_rgba(0,0,0,0.1)] dark:shadow-[-3px_-3px_5px_rgba(0,0,0,0.4)] pointer-events-none z-20`}></div>
);

const PostItWidget = () => {
    const nodeRef = useRef(null);
    const [isFlipped, setIsFlipped] = useState(false);
    const [colorTheme, setColorTheme] = useState('yellow'); // Color por defecto
    
    const [tasks, setTasks] = useState([
        { id: 1, text: "Avanzar en widgets de MiDesk", done: false },
        { id: 2, text: "Revisar conexión ESP32", done: false },
        { id: 3, text: "Integrar IA en backend", done: true },
    ]);
    const [newTask, setNewTask] = useState("");

    const currentTheme = THEMES[colorTheme];

    const toggleTask = (e, id) => {
        e.stopPropagation(); 
        setTasks(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t));
    };

    const addTask = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!newTask.trim()) return;
        setTasks([...tasks, { id: Date.now(), text: newTask, done: false }]);
        setNewTask("");
    };


    return (
        <Draggable nodeRef={nodeRef} handle=".drag-handle" bounds="parent">
            <div ref={nodeRef} className="absolute top-36 right-8 z-10 pointer-events-auto w-max">
                
                <div 
                    className="group relative h-[280px] w-[240px] [perspective:2000px]"
                    onMouseEnter={() => setIsFlipped(true)}
                    onMouseLeave={() => setIsFlipped(false)}
                >
                    <div className={`relative h-full w-full [transform-style:preserve-3d] transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] ${isFlipped ? '[transform:rotateY(180deg)]' : '[transform:rotateY(0deg)]'}`}>
                        
                        {/* --- CARA FRONTAL --- */}
                        <div className={`absolute inset-0 h-full w-full [backface-visibility:hidden] [transform:rotateY(0deg)] rounded-2xl rounded-br-[2rem] ${currentTheme.bg} backdrop-blur-2xl border ${currentTheme.border} shadow-2xl shadow-black/10 flex flex-col transition-all duration-700 overflow-hidden ${isFlipped ? 'opacity-0' : 'opacity-100'}`}>
                            
                            <div className={`drag-handle w-full flex justify-center py-4 cursor-grab active:cursor-grabbing ${currentTheme.muted} opacity-50 hover:opacity-100 transition-opacity`}>
                                <GripHorizontal size={20} strokeWidth={2.5} />
                            </div>

                            <div className="flex-1 flex flex-col items-center justify-center p-6">
                                <h3 className={`font-bold text-3xl ${currentTheme.text} text-center leading-tight tracking-tighter transition-transform duration-500 group-hover:-translate-y-2`}>
                                    Cosas<br/>Pendientes
                                </h3>
                                <div className={`mt-8 flex items-center gap-1.5 ${currentTheme.muted} text-[10px] uppercase tracking-widest font-bold opacity-70`}>
                                    <Repeat2 size={14} /> Girar
                                </div>
                            </div>
                            <FoldedCorner theme={currentTheme} />
                        </div>

                        {/* --- CARA TRASERA (CHECKLIST) --- */}
                        <div className={`absolute inset-0 h-full w-full [backface-visibility:hidden] [transform:rotateY(180deg)] rounded-2xl rounded-bl-[2rem] ${currentTheme.bg} backdrop-blur-2xl border ${currentTheme.border} shadow-2xl shadow-black/10 flex flex-col transition-all duration-700 overflow-hidden ${isFlipped ? 'opacity-100' : 'opacity-0'}`}>
                            
                            {/* Selector de colores */}
                            <div className="absolute top-4 left-4 flex gap-1.5 z-30">
                                {Object.keys(THEMES).map((color) => (
                                    <button
                                        key={color}
                                        onClick={(e) => { e.stopPropagation(); setColorTheme(color); }}
                                        className={`w-3.5 h-3.5 rounded-full transition-transform ${colorTheme === color ? 'scale-125 ring-2 ring-offset-1 ring-black/20 dark:ring-white/20' : 'hover:scale-110 opacity-70 hover:opacity-100'}`}
                                        style={{ backgroundColor: color === 'yellow' ? '#fcd34d' : color === 'blue' ? '#93c5fd' : color === 'pink' ? '#f9a8d4' : '#6ee7b7' }}
                                    />
                                ))}
                            </div>

                            <div className={`drag-handle w-full flex justify-center py-3 cursor-grab active:cursor-grabbing ${currentTheme.muted} opacity-50 hover:opacity-100 transition-opacity`}>
                                <GripHorizontal size={20} strokeWidth={2.5} />
                            </div>

                            <div className="flex-1 flex flex-col px-5 pb-5">
                                <ul className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3">
                                    {tasks.map(task => (
                                        <li 
                                            key={task.id} 
                                            className="flex items-start gap-2.5 cursor-pointer group/item" 
                                            onClick={(e) => toggleTask(e, task.id)}
                                        >
                                            <div className={`mt-0.5 ${currentTheme.muted} transition-transform group-hover/item:scale-110`}>
                                                {task.done ? <CheckCircle2 size={16} /> : <Circle size={16} />}
                                            </div>
                                            <span className={`text-sm font-medium tracking-tight leading-snug transition-all ${task.done ? `line-through opacity-50 ${currentTheme.text}` : currentTheme.text}`}>
                                                {task.text}
                                            </span>
                                        </li>
                                    ))}
                                </ul>

                                <form onSubmit={addTask} className="mt-4 flex gap-2 relative z-30">
                                    <input 
                                        type="text" 
                                        value={newTask}
                                        onChange={(e) => setNewTask(e.target.value)}
                                        onClick={(e) => e.stopPropagation()} 
                                        placeholder="Nueva tarea..." 
                                        className={`flex-1 rounded-lg px-3 py-2 text-xs font-medium focus:outline-none focus:ring-2 transition-all ${currentTheme.text} ${currentTheme.input}`}
                                    />
                                    <button 
                                        type="submit" 
                                        onClick={(e) => e.stopPropagation()} 
                                        className={`px-2.5 rounded-lg transition-transform hover:scale-105 active:scale-95 flex items-center justify-center shadow-sm ${currentTheme.btn}`}
                                    >
                                        <Plus size={16} strokeWidth={3} />
                                    </button>
                                </form>
                            </div>
                            
                            {/* Pliegue invertido para la parte trasera */}
                            <div className={`absolute bottom-0 left-0 w-8 h-8 bg-gradient-to-tr ${currentTheme.fold} rounded-tr-xl shadow-[3px_-3px_5px_rgba(0,0,0,0.1)] dark:shadow-[3px_-3px_5px_rgba(0,0,0,0.4)] pointer-events-none z-20`}></div>
                        </div>

                    </div>
                </div>
            </div>
        </Draggable>
    );
};

export default PostItWidget;