// src/components/WordEditor.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useSocket } from '../../core/context/SocketContext';
import { 
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, 
  List, ListOrdered, Undo, Redo, Download, Type, Palette, Sparkles, Save
} from 'lucide-react';
import { sileo } from 'sileo';
import { useFetch } from '../../core/api/useFetch';
import { useSearchParams } from 'react-router-dom';

// AHORA RECIBE PROPS DEL SISTEMA
function WordEditor({ fileId, fileName, initialContent = "" }) {
  const { socket } = useSocket();
  const [searchParams] = useSearchParams();
  const [fontSize, setFontSize] = useState('16');
  const [textColor, setTextColor] = useState('#1e293b'); // Color por defecto más suave
  const editorRef = useRef(null);
  const [isAIProcessing, setIsAIProcessing] = useState(false);
  
  const fetchDataBackend = useFetch();

  useEffect(() => {
    if (!socket || !fileId) return;

    socket.on('file-change', ({ fileId: changedId, content }) => {
      if (changedId === fileId && editorRef.current && editorRef.current.innerHTML !== content) {
         const selection = window.getSelection();
         editorRef.current.innerHTML = content;
      }
    });

    return () => {
      socket.off('file-change');
    };
  }, [socket, fileId]);

  // --- CARGAR CONTENIDO INICIAL ---
  useEffect(() => {
    if (editorRef.current && initialContent) {
      editorRef.current.innerHTML = initialContent;
    }
  }, []);

  // Aplicar formato con execCommand
  const applyFormat = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  // Cambiar tamaño de fuente
  const changeFontSize = (size) => {
    setFontSize(size);
    applyFormat('fontSize', '7'); 
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const span = document.createElement('span');
      span.style.fontSize = size + 'px';
      range.surroundContents(span);
    }
  };

  // Cambiar color de texto
  const changeColor = (color) => {
    setTextColor(color);
    applyFormat('foreColor', color);
  };

  // Exportar a texto plano
  const exportToText = () => {
    const content = editorRef.current?.innerText || '';
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName ? `${fileName}.txt` : 'documento.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  // --- GUARDAR EN BACKEND ---
  const handleSave = async () => {
    if (!fileId || fileId.toString().startsWith('sys-')) {
      sileo.info({title: "Este es un editor temporal. Crea un archivo real (Clic derecho → Nuevo) para guardar."});
      return;
    }

    const content = editorRef.current?.innerHTML || "";
    const token = localStorage.getItem('token');
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    try {
      await fetchDataBackend(
        `${backendUrl}/files/${fileId}`,
        { content }, 
        "PUT",
        { Authorization: `Bearer ${token}` }
      );
    
      window.dispatchEvent(new CustomEvent('local-file-update', { detail: { id: fileId, content } }));
      
    } catch (error) {
      console.error("Error guardando:", error);
    }
  };

  // --- FUNCIÓN IA ---
  const improveWithAI = async () => {
    const content = editorRef.current?.innerText || '';
    
    if (!content.trim()) {
      sileo.warning({title: 'Escribe algo primero para que la IA pueda mejorarlo.'});
      return;
    }

    setIsAIProcessing(true);
    const token = localStorage.getItem('token');
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    try {
      const response = await fetchDataBackend(
        `${backendUrl}/ia/improve-text`,
        { text: content }, 
        "POST",
        { Authorization: `Bearer ${token}` }
      );

      if (response && response.ok && response.improvedText) {
        if (editorRef.current) {
            editorRef.current.innerText = response.improvedText;
            sileo.success({title: "¡Texto mejorado por IA!"});
        }
      }

    } catch (error) {
      console.error('Error al mejorar con IA:', error);
    } finally {
      setIsAIProcessing(false);
    }
  };

  // EMITIR CAMBIOS AL ESCRIBIR
  const handleInput = () => {
    const content = editorRef.current.innerHTML;
    
    if (socket && fileId) {
      const user = JSON.parse(localStorage.getItem('user'));
      const remoteUserId = searchParams.get('remote');
      const targetUserId = remoteUserId || user.id; 

      socket.emit('file-change', { 
        userId: targetUserId,
        fileId, 
        content 
      });
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#1e1e2e] transition-colors duration-300">
      
      {/* ========== BARRA DE HERRAMIENTAS ========== */}
      <div className="flex flex-wrap items-center gap-1 px-3 py-2.5 bg-white dark:bg-black/20 border-b border-slate-200 dark:border-white/10 shadow-sm">
        
        {/* --- BOTÓN GUARDAR --- */}
        <button
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 dark:bg-purple-600 hover:bg-blue-600 dark:hover:bg-purple-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 mr-2 font-medium text-sm"
            title="Guardar en la Nube"
        >
            <Save size={16} strokeWidth={2.5} />
            <span className="hidden sm:inline">Guardar</span>
        </button>

        {/* Deshacer/Rehacer */}
        <div className="flex gap-0.5 mr-2">
          <button 
            onClick={() => applyFormat('undo')} 
            className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg transition-all duration-150 active:scale-95 group"
            title="Deshacer"
          >
            <Undo size={16} strokeWidth={2} className="text-slate-600 dark:text-gray-400 group-hover:text-slate-800 dark:group-hover:text-white" />
          </button>
          <button 
            onClick={() => applyFormat('redo')} 
            className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg transition-all duration-150 active:scale-95 group"
            title="Rehacer"
          >
            <Redo size={16} strokeWidth={2} className="text-slate-600 dark:text-gray-400 group-hover:text-slate-800 dark:group-hover:text-white" />
          </button>
        </div>

        {/* Separador */}
        <div className="h-6 w-px bg-slate-200 dark:bg-white/10 mx-1"></div>

        {/* Formato Básico */}
        <div className="flex gap-0.5 mr-2">
          <button 
            onClick={() => applyFormat('bold')} 
            className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg transition-all duration-150 active:scale-95 group"
            title="Negrita"
          >
            <Bold size={16} strokeWidth={2.5} className="text-slate-600 dark:text-gray-400 group-hover:text-slate-800 dark:group-hover:text-white" />
          </button>
          <button 
            onClick={() => applyFormat('italic')} 
            className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg transition-all duration-150 active:scale-95 group"
            title="Cursiva"
          >
            <Italic size={16} strokeWidth={2.5} className="text-slate-600 dark:text-gray-400 group-hover:text-slate-800 dark:group-hover:text-white" />
          </button>
          <button 
            onClick={() => applyFormat('underline')} 
            className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg transition-all duration-150 active:scale-95 group"
            title="Subrayado"
          >
            <Underline size={16} strokeWidth={2.5} className="text-slate-600 dark:text-gray-400 group-hover:text-slate-800 dark:group-hover:text-white" />
          </button>
        </div>

        {/* Separador */}
        <div className="h-6 w-px bg-slate-200 dark:bg-white/10 mx-1"></div>

        {/* Fuente y Color */}
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-white/5 px-3 py-1.5 rounded-lg mr-2 border border-slate-200 dark:border-white/10">
          <Type size={15} className="text-slate-500 dark:text-gray-400" />
          <select 
            value={fontSize} 
            onChange={(e) => changeFontSize(e.target.value)} 
            className="bg-transparent text-slate-800 dark:text-white text-sm font-medium focus:outline-none cursor-pointer hover:text-blue-500 dark:hover:text-purple-400 transition-colors"
            style={{ width: '45px' }}
          >
            <option value="12" className="bg-white dark:bg-gray-800">12</option>
            <option value="16" className="bg-white dark:bg-gray-800">16</option>
            <option value="20" className="bg-white dark:bg-gray-800">20</option>
            <option value="24" className="bg-white dark:bg-gray-800">24</option>
            <option value="28" className="bg-white dark:bg-gray-800">28</option>
            <option value="32" className="bg-white dark:bg-gray-800">32</option>
          </select>
          
          <div className="h-4 w-px bg-slate-300 dark:bg-white/20 mx-1"></div>
          
          <Palette size={15} className="text-slate-500 dark:text-gray-400" />
          <div className="relative">
            <input 
              type="color" 
              value={textColor} 
              onChange={(e) => changeColor(e.target.value)} 
              className="w-7 h-7 cursor-pointer rounded-md border-2 border-slate-300 dark:border-white/20 hover:border-blue-500 dark:hover:border-purple-500 transition-colors"
              title="Color de texto"
            />
          </div>
        </div>

        {/* Separador */}
        <div className="h-6 w-px bg-slate-200 dark:bg-white/10 mx-1"></div>

        {/* Alineación */}
        <div className="flex gap-0.5 mr-2">
          <button 
            onClick={() => applyFormat('justifyLeft')} 
            className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg transition-all duration-150 active:scale-95 group"
            title="Alinear izquierda"
          >
            <AlignLeft size={16} strokeWidth={2} className="text-slate-600 dark:text-gray-400 group-hover:text-slate-800 dark:group-hover:text-white" />
          </button>
          <button 
            onClick={() => applyFormat('justifyCenter')} 
            className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg transition-all duration-150 active:scale-95 group"
            title="Centrar"
          >
            <AlignCenter size={16} strokeWidth={2} className="text-slate-600 dark:text-gray-400 group-hover:text-slate-800 dark:group-hover:text-white" />
          </button>
          <button 
            onClick={() => applyFormat('justifyRight')} 
            className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg transition-all duration-150 active:scale-95 group"
            title="Alinear derecha"
          >
            <AlignRight size={16} strokeWidth={2} className="text-slate-600 dark:text-gray-400 group-hover:text-slate-800 dark:group-hover:text-white" />
          </button>
        </div>

        {/* Separador */}
        <div className="h-6 w-px bg-slate-200 dark:bg-white/10 mx-1"></div>

        {/* Listas */}
        <div className="flex gap-0.5 mr-2">
          <button 
            onClick={() => applyFormat('insertUnorderedList')} 
            className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg transition-all duration-150 active:scale-95 group"
            title="Lista con viñetas"
          >
            <List size={16} strokeWidth={2} className="text-slate-600 dark:text-gray-400 group-hover:text-slate-800 dark:group-hover:text-white" />
          </button>
          <button 
            onClick={() => applyFormat('insertOrderedList')} 
            className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg transition-all duration-150 active:scale-95 group"
            title="Lista numerada"
          >
            <ListOrdered size={16} strokeWidth={2} className="text-slate-600 dark:text-gray-400 group-hover:text-slate-800 dark:group-hover:text-white" />
          </button>
        </div>

        <div className="flex-1"></div>

        {/* Botón de IA */}
        <button
          onClick={improveWithAI}
          disabled={isAIProcessing}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm shadow-md transition-all duration-200 mr-2
            ${isAIProcessing 
              ? 'bg-gradient-to-r from-purple-400/50 to-pink-400/50 dark:from-purple-600/50 dark:to-pink-600/50 text-slate-400 dark:text-gray-500 cursor-wait' 
              : 'bg-gradient-to-r from-purple-500 to-pink-500 dark:from-purple-600 dark:to-pink-600 hover:from-purple-600 hover:to-pink-600 dark:hover:from-purple-700 dark:hover:to-pink-700 text-white hover:scale-105 shadow-purple-500/30 dark:shadow-purple-500/20'
            }`}
          title="Mejorar con IA"
        >
          <Sparkles size={16} strokeWidth={2.5} className={isAIProcessing ? 'animate-pulse' : ''} />
          <span className="hidden sm:inline">{isAIProcessing ? 'Procesando...' : 'IA'}</span>
        </button>

        {/* Exportar */}
        <button 
          onClick={exportToText} 
          className="p-2 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-lg transition-all duration-150 active:scale-95 group border border-transparent hover:border-emerald-200 dark:hover:border-emerald-500/30" 
          title="Descargar como TXT"
        >
          <Download size={16} strokeWidth={2.5} className="text-emerald-600 dark:text-emerald-400 group-hover:text-emerald-700 dark:group-hover:text-emerald-300" />
        </button>
      </div>

      {/* ========== ÁREA DE EDICIÓN ========== */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        className="flex-1 p-8 overflow-auto focus:outline-none bg-white dark:bg-[#1a1a2e] text-slate-800 dark:text-gray-200 custom-scrollbar transition-colors duration-300"
        style={{ 
          minHeight: '100%', 
          fontSize: `${fontSize}px`, 
          lineHeight: '1.8',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
        }}
        suppressContentEditableWarning
      >
        {/* El contenido inicial se carga vía useEffect */}
      </div>
      
      {/* ========== BARRA DE ESTADO ========== */}
      <div className="px-4 py-2 bg-slate-50 dark:bg-black/20 border-t border-slate-200 dark:border-white/10 text-xs text-slate-500 dark:text-gray-500 flex justify-between items-center">
        <span className="flex items-center gap-2">
          {fileId && !fileId.toString().startsWith('sys-') ? (
            <>
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span className="font-medium text-slate-700 dark:text-gray-300">Editando: {fileName}</span>
            </>
          ) : (
            <>
              <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
              <span className="text-amber-700 dark:text-amber-400">Modo borrador (Sin guardar)</span>
            </>
          )}
        </span>
        <span className="text-slate-400 dark:text-gray-600">
          {editorRef.current?.innerText?.length || 0} caracteres
        </span>
      </div>
    </div>
  );
}

export default WordEditor;