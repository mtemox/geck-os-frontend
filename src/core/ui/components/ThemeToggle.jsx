// src/components/ThemeToggle.jsx
import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const ThemeToggle = ({ variant = 'default' }) => {
  const { theme, toggleTheme, isDark } = useTheme();

  // Variante DEFAULT: Botón simple con icono
  if (variant === 'default') {
    return (
      <button
        onClick={toggleTheme}
        className="group relative p-2.5 rounded-lg bg-white/10 dark:bg-white/5 hover:bg-white/20 dark:hover:bg-white/10 border border-white/20 dark:border-white/10 transition-all duration-300 shadow-lg"
        title={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      >
        {/* Icono animado */}
        <div className="relative w-5 h-5">
          {/* Sol (modo claro) */}
          <Sun 
            size={20} 
            className={`absolute inset-0 text-yellow-500 transition-all duration-300 ${
              isDark ? 'opacity-0 rotate-90 scale-0' : 'opacity-100 rotate-0 scale-100'
            }`}
          />
          {/* Luna (modo oscuro) */}
          <Moon 
            size={20} 
            className={`absolute inset-0 text-blue-300 transition-all duration-300 ${
              isDark ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-0'
            }`}
          />
        </div>
      </button>
    );
  }

  // Variante TASKBAR: Para usar en la barra de tareas
  if (variant === 'taskbar') {
    return (
      <button
        onClick={toggleTheme}
        className="group relative h-9 w-9 rounded-lg flex items-center justify-center hover:bg-white/10 transition-all duration-200"
        title={isDark ? 'Modo claro' : 'Modo oscuro'}
      >
        <div className="relative w-5 h-5">
          <Sun 
            size={18} 
            className={`absolute inset-0 text-yellow-400 transition-all duration-300 ${
              isDark ? 'opacity-0 rotate-90 scale-0' : 'opacity-100 rotate-0 scale-100'
            }`}
          />
          <Moon 
            size={18} 
            className={`absolute inset-0 text-blue-300 transition-all duration-300 ${
              isDark ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-0'
            }`}
          />
        </div>

        {/* Tooltip */}
        <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 z-[60]">
          <div className="bg-gray-900/95 backdrop-blur-xl text-white text-xs px-3 py-1.5 rounded-lg shadow-xl border border-white/10 whitespace-nowrap">
            {isDark ? 'Modo claro' : 'Modo oscuro'}
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900/95"></div>
          </div>
        </div>
      </button>
    );
  }

  // Variante SWITCH: Interruptor estilo iOS
  if (variant === 'switch') {
    return (
      <button
        onClick={toggleTheme}
        className="relative inline-flex items-center h-8 w-14 rounded-full transition-colors duration-300 bg-slate-300 dark:bg-slate-700 border-2 border-slate-400 dark:border-slate-600 shadow-inner"
        title={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      >
        {/* Slider */}
        <span
          className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-all duration-300 flex items-center justify-center ${
            isDark ? 'translate-x-7' : 'translate-x-1'
          }`}
        >
          {isDark ? (
            <Moon size={14} className="text-slate-700" />
          ) : (
            <Sun size={14} className="text-yellow-500" />
          )}
        </span>
      </button>
    );
  }

  // Variante FLOATING: Botón flotante elegante
  if (variant === 'floating') {
    return (
      <button
        onClick={toggleTheme}
        className="fixed bottom-20 right-6 z-40 group p-4 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 dark:from-slate-700 dark:to-slate-800 shadow-2xl hover:shadow-purple-500/50 dark:hover:shadow-slate-700/50 transition-all duration-300 hover:scale-110 border-2 border-white/20"
        title={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      >
        <div className="relative w-6 h-6">
          <Sun 
            size={24} 
            className={`absolute inset-0 text-white transition-all duration-300 ${
              isDark ? 'opacity-0 rotate-90 scale-0' : 'opacity-100 rotate-0 scale-100'
            }`}
          />
          <Moon 
            size={24} 
            className={`absolute inset-0 text-white transition-all duration-300 ${
              isDark ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-0'
            }`}
          />
        </div>

        {/* Ripple effect en hover */}
        <span className="absolute inset-0 rounded-full bg-white/0 group-hover:bg-white/10 transition-all duration-300"></span>
      </button>
    );
  }

  // Variante DESKTOP: Para el menú de escritorio
  if (variant === 'desktop') {
    return (
      <button
        onClick={toggleTheme}
        className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg bg-white/5 dark:bg-white/5 hover:bg-white/10 dark:hover:bg-white/10 border border-white/10 transition-all duration-200 text-left group"
      >
        <div className="relative w-5 h-5">
          <Sun 
            size={20} 
            className={`absolute inset-0 text-yellow-500 transition-all duration-300 ${
              isDark ? 'opacity-0 rotate-90 scale-0' : 'opacity-100 rotate-0 scale-100'
            }`}
          />
          <Moon 
            size={20} 
            className={`absolute inset-0 text-blue-400 transition-all duration-300 ${
              isDark ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-0'
            }`}
          />
        </div>
        <span className="text-sm font-medium text-white/90">
          {isDark ? 'Modo Claro' : 'Modo Oscuro'}
        </span>
      </button>
    );
  }

  return null;
};

export default ThemeToggle;