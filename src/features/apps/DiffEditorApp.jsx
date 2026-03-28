// src/features/apps/DiffEditorApp.jsx
import React, { useState, useEffect } from 'react';
import { DiffEditor } from '@monaco-editor/react';
import { Sun, Moon, Copy, Download, RefreshCw, Columns, Eye } from 'lucide-react';
import { sileo } from 'sileo';
import { useTheme } from '../../core/context/ThemeContext';

// Recibe:
// - originalCode: El código en la ventana izquierda
// - modifiedCode: El código en la ventana derecha
// - language: El lenguaje
// - fileName: Nombre del archivo (opcional)
function CodeComparator({ originalCode = '', modifiedCode = '', language = 'javascript', fileName = 'comparación' }) {
  const { theme } = useTheme();
  const [editorTheme, setEditorTheme] = useState(theme === 'dark' ? 'vs-dark' : 'vs-light');
  const [viewMode, setViewMode] = useState('split'); // 'split' o 'inline'

  // Sincronizar tema del editor con el tema global
  useEffect(() => {
    setEditorTheme(theme === 'dark' ? 'vs-dark' : 'vs-light');
  }, [theme]);

  // Copiar código modificado
  const handleCopyModified = () => {
    navigator.clipboard.writeText(modifiedCode);
    sileo.success({title: 'Código modificado copiado al portapapeles'});
  };

  // Copiar código original
  const handleCopyOriginal = () => {
    navigator.clipboard.writeText(originalCode);
    sileo.success({title: 'Código original copiado al portapapeles'});
  };

  // Descargar comparación
  const handleDownload = () => {
    const comparison = `=== CÓDIGO ORIGINAL ===\n\n${originalCode}\n\n=== CÓDIGO MODIFICADO ===\n\n${modifiedCode}`;
    const blob = new Blob([comparison], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName}_comparacion.txt`;
    a.click();
    URL.revokeObjectURL(url);
    sileo.success({title: 'Comparación descargada'});
  };

  // Cambiar modo de vista
  const toggleViewMode = () => {
    setViewMode(prev => prev === 'split' ? 'inline' : 'split');
    sileo.info({title: `Modo ${viewMode === 'split' ? 'inline' : 'lado a lado'} activado`});
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#1e1e2e] transition-colors duration-300">
      
      {/* ========== BARRA DE HERRAMIENTAS ========== */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 bg-white dark:bg-black/20 border-b border-slate-200 dark:border-white/10 shadow-sm">
        
        {/* Título y info */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg">
            <Eye size={16} className="text-slate-600 dark:text-gray-400" />
            <span className="text-sm font-semibold text-slate-800 dark:text-white">
              Comparador de Código
            </span>
          </div>
          
          {fileName && (
            <span className="text-xs text-slate-500 dark:text-gray-500 hidden sm:inline">
              {fileName}
            </span>
          )}
        </div>

        {/* Controles */}
        <div className="flex items-center gap-2">
          
          {/* Botón cambiar vista */}
          <button
            onClick={toggleViewMode}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 rounded-lg transition-all text-sm font-medium text-slate-700 dark:text-gray-300"
            title={viewMode === 'split' ? 'Cambiar a vista inline' : 'Cambiar a vista lado a lado'}
          >
            <Columns size={16} />
            <span className="hidden sm:inline">
              {viewMode === 'split' ? 'Lado a lado' : 'Inline'}
            </span>
          </button>

          {/* Separador */}
          <div className="h-6 w-px bg-slate-200 dark:bg-white/10"></div>

          {/* Copiar original */}
          <button
            onClick={handleCopyOriginal}
            className="p-2 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-all group border border-transparent hover:border-blue-200 dark:hover:border-blue-500/30"
            title="Copiar código original"
          >
            <Copy size={16} className="text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300" />
          </button>

          {/* Copiar modificado */}
          <button
            onClick={handleCopyModified}
            className="p-2 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-lg transition-all group border border-transparent hover:border-emerald-200 dark:hover:border-emerald-500/30"
            title="Copiar código modificado"
          >
            <Copy size={16} className="text-emerald-600 dark:text-emerald-400 group-hover:text-emerald-700 dark:group-hover:text-emerald-300" />
          </button>

          {/* Descargar */}
          <button
            onClick={handleDownload}
            className="p-2 hover:bg-purple-50 dark:hover:bg-purple-500/10 rounded-lg transition-all group border border-transparent hover:border-purple-200 dark:hover:border-purple-500/30"
            title="Descargar comparación"
          >
            <Download size={16} className="text-purple-600 dark:text-purple-400 group-hover:text-purple-700 dark:group-hover:text-purple-300" />
          </button>
        </div>
      </div>

      {/* ========== EDITOR DIFF ========== */}
      <div className="flex-1 relative bg-white dark:bg-[#1a1a2e] transition-colors duration-300">
        {/* Overlay para mostrar tema cambiando */}
        <div className="absolute inset-0 pointer-events-none z-10">
          <div className="absolute top-0 left-0 right-1/2 px-3 py-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 dark:bg-black/40 backdrop-blur-sm border border-slate-200 dark:border-white/10 rounded-md text-xs font-medium text-slate-700 dark:text-gray-300 shadow-sm">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              Original
            </span>
          </div>
          <div className="absolute top-0 right-0 left-1/2 px-3 py-2 flex justify-end">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 dark:bg-black/40 backdrop-blur-sm border border-slate-200 dark:border-white/10 rounded-md text-xs font-medium text-slate-700 dark:text-gray-300 shadow-sm">
              <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
              Modificado
            </span>
          </div>
        </div>

        <DiffEditor
          height="100%"
          width="100%"
          language={language}
          theme={editorTheme}
          original={originalCode}
          modified={modifiedCode}
          options={{
            readOnly: true,
            renderSideBySide: viewMode === 'split',
            fontSize: 14,
            minimap: { enabled: true },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            wordWrap: 'on',
            lineNumbers: 'on',
            glyphMargin: true,
            folding: true,
            lineDecorationsWidth: 10,
            lineNumbersMinChars: 3,
            renderLineHighlight: 'all',
            scrollbar: {
              vertical: 'auto',
              horizontal: 'auto',
              verticalScrollbarSize: 10,
              horizontalScrollbarSize: 10,
            },
          }}
        />
      </div>

      {/* ========== BARRA DE ESTADO ========== */}
      <div className="px-4 py-2 bg-slate-50 dark:bg-black/20 border-t border-slate-200 dark:border-white/10 text-xs flex justify-between items-center">
        <div className="flex items-center gap-4 text-slate-500 dark:text-gray-500">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
            <span className="font-medium text-slate-700 dark:text-gray-300">
              {originalCode.split('\n').length} líneas
            </span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
            <span className="font-medium text-slate-700 dark:text-gray-300">
              {modifiedCode.split('\n').length} líneas
            </span>
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-slate-400 dark:text-gray-600 capitalize">
            Lenguaje: {language}
          </span>
          <span className="text-slate-300 dark:text-gray-700">•</span>
          <span className={`font-medium ${editorTheme === 'vs-dark' ? 'text-blue-600 dark:text-blue-400' : 'text-amber-600 dark:text-amber-400'}`}>
            Tema: {editorTheme === 'vs-dark' ? 'Oscuro' : 'Claro'}
          </span>
        </div>
      </div>
    </div>
  );
}

export default CodeComparator;