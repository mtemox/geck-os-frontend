// src/features/apps/WordEditorApp.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useSocket } from '../../core/context/SocketContext';
import {
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight,
  List, ListOrdered, Undo, Redo, Download, Type, Palette, Sparkles, Save, Code, ChevronDown
} from 'lucide-react';
import { sileo } from 'sileo';
import { useFetch } from '../../core/api/useFetch';
import { useSearchParams } from 'react-router-dom';

function WordEditorApp({ fileId, fileName, initialContent = "" }) {
  const { socket } = useSocket();
  const [searchParams] = useSearchParams();
  const [fontSize, setFontSize] = useState('16');
  const [textColor, setTextColor] = useState('#1e293b');
  const editorRef = useRef(null);

  // Estados para la IA
  const [isAIProcessing, setIsAIProcessing] = useState(false);
  const [showAIOptions, setShowAIOptions] = useState(false);
  const [customPrompt, setCustomPrompt] = useState("");
  const aiMenuRef = useRef(null);

  const fetchDataBackend = useFetch();

  // Cerrar el menú IA al hacer clic afuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (aiMenuRef.current && !aiMenuRef.current.contains(event.target)) {
        setShowAIOptions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!socket || !fileId) return;
    socket.on('file-change', ({ fileId: changedId, content }) => {
      if (changedId === fileId && editorRef.current && editorRef.current.innerHTML !== content) {
        editorRef.current.innerHTML = content;
      }
    });
    return () => { socket.off('file-change'); };
  }, [socket, fileId]);

  useEffect(() => {
    if (editorRef.current && initialContent) {
      editorRef.current.innerHTML = initialContent;
    }
  }, []);

  const applyFormat = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  const changeFontSize = (size) => {
    setFontSize(size);
    const selection = window.getSelection();
    if (selection.rangeCount > 0 && !selection.isCollapsed) {
      document.execCommand('fontSize', false, '7');
      const fontTags = editorRef.current.querySelectorAll('font[size="7"]');
      fontTags.forEach(font => {
        font.removeAttribute('size');
        font.style.fontSize = `${size}px`;
      });
      handleInput();
    }
    editorRef.current?.focus();
  };

  const changeColor = (color) => {
    setTextColor(color);
    applyFormat('foreColor', color);
  };

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

  const insertCodeBlock = () => {
    const codeHtml = `<pre style="background-color: #1e1e1e; color: #4ade80; padding: 12px; border-radius: 8px; font-family: monospace; font-size: 14px; overflow-x: auto; margin: 10px 0;"><code>// Escribe tu código aquí...</code></pre><p><br></p>`;
    document.execCommand('insertHTML', false, codeHtml);
    handleInput();
    editorRef.current?.focus();
  };

  const handleSave = async () => {
    if (!fileId || fileId.toString().startsWith('sys-')) {
      sileo.info({ title: "Este es un editor temporal. Crea un archivo real (Clic derecho → Nuevo) para guardar." });
      return;
    }
    const content = editorRef.current?.innerHTML || "";
    const token = localStorage.getItem('token');
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    try {
      await fetchDataBackend(
        `${backendUrl}/items/update/${fileId}`,
        { content }, 
        "PATCH",
        { Authorization: `Bearer ${token}` }
      );
      window.dispatchEvent(new CustomEvent('local-file-update', { detail: { id: fileId, content } }));
    } catch (error) {
      console.error("Error guardando:", error);
    }
  };

  // Función IA con Prompt Dinámico
  const handleAIAction = async (promptElegido) => {
    setShowAIOptions(false); // Cerramos el menú

    const contentHTML = editorRef.current?.innerHTML || '';
    const rawText = editorRef.current?.innerText || '';

    if (!rawText.trim()) {
      sileo.warning({ title: 'Escribe algo en el documento primero para que la IA pueda trabajar.' });
      return;
    }

    setIsAIProcessing(true);
    const token = localStorage.getItem('token');
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    try {
      const response = await fetchDataBackend(
        `${backendUrl}/ai/improve-text`,
        {
          texto: contentHTML,
          // Anexamos reglas estrictas al prompt que elige el usuario
          accion: `${promptElegido} MUY IMPORTANTE: El texto contiene etiquetas HTML. Debes devolver la respuesta manteniendo y respetando estrictamente todas las etiquetas HTML originales para no perder el formato del documento.`
        },
        "POST",
        { Authorization: `Bearer ${token}` }
      );

      if (response && response.ok && response.data?.respuesta?.resultado) {
        if (editorRef.current) {
          editorRef.current.innerHTML = response.data.respuesta.resultado;
          sileo.success({ title: "¡Documento actualizado con IA!" });
          handleInput();
        }
      } else {
        sileo.error({ title: "La IA no pudo procesar el formato adecuadamente." });
      }
    } catch (error) {
      console.error('Error al procesar con IA:', error);
    } finally {
      setIsAIProcessing(false);
    }
  };

  const handleInput = () => {
    const content = editorRef.current.innerHTML;
    if (socket && fileId) {
      const user = JSON.parse(localStorage.getItem('user'));
      const remoteUserId = searchParams.get('remote');
      const targetUserId = remoteUserId || user.id;
      socket.emit('file-change', { userId: targetUserId, fileId, content });
    }
  };

  // Clases reutilizables
  const toolbarBtn = "p-2 hover:bg-muted rounded-lg transition-all duration-150 active:scale-95 group";
  const toolbarIcon = "text-muted-foreground group-hover:text-foreground";
  const toolbarSep = "h-6 w-px bg-border mx-1";

  return (
    <div className="flex flex-col h-full bg-background transition-colors duration-300">

      {/* ========== BARRA DE HERRAMIENTAS ========== */}
      <div className="shrink-0 flex flex-wrap items-center gap-1 px-3 py-2.5 bg-card border-b border-border shadow-sm z-10">

        {/* Guardar */}
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 mr-2 font-medium text-sm"
          title="Guardar en la Nube"
        >
          <Save size={16} strokeWidth={2.5} />
          <span className="hidden sm:inline">Guardar</span>
        </button>

        {/* Deshacer / Rehacer */}
        <div className="flex gap-0.5 mr-2">
          <button onClick={() => applyFormat('undo')} className={toolbarBtn} title="Deshacer">
            <Undo size={16} strokeWidth={2} className={toolbarIcon} />
          </button>
          <button onClick={() => applyFormat('redo')} className={toolbarBtn} title="Rehacer">
            <Redo size={16} strokeWidth={2} className={toolbarIcon} />
          </button>
        </div>

        <div className={toolbarSep}></div>

        {/* Formato básico */}
        <div className="flex gap-0.5 mr-2">
          <button onClick={() => applyFormat('bold')} className={toolbarBtn} title="Negrita">
            <Bold size={16} strokeWidth={2.5} className={toolbarIcon} />
          </button>
          <button onClick={() => applyFormat('italic')} className={toolbarBtn} title="Cursiva">
            <Italic size={16} strokeWidth={2.5} className={toolbarIcon} />
          </button>
          <button onClick={() => applyFormat('underline')} className={toolbarBtn} title="Subrayado">
            <Underline size={16} strokeWidth={2.5} className={toolbarIcon} />
          </button>
        </div>

        <div className={toolbarSep}></div>

        {/* Fuente y color */}
        <div className="flex items-center gap-2 bg-muted px-3 py-1.5 rounded-lg mr-2 border border-border">
          <Type size={15} className="text-muted-foreground" />
          <select
            value={fontSize}
            onChange={(e) => changeFontSize(e.target.value)}
            className="bg-transparent text-foreground text-sm font-medium focus:outline-none cursor-pointer hover:text-brand-500 transition-colors"
            style={{ width: '45px' }}
          >
            {['12', '16', '20', '24', '28', '32'].map(s => (
              <option key={s} value={s} className="bg-card text-foreground">{s}</option>
            ))}
          </select>

          <div className="h-4 w-px bg-border mx-1"></div>

          <Palette size={15} className="text-muted-foreground" />
          <input
            type="color"
            value={textColor}
            onChange={(e) => changeColor(e.target.value)}
            className="w-7 h-7 cursor-pointer rounded-md border-2 border-border hover:border-brand-500 transition-colors"
            title="Color de texto"
          />
        </div>

        <div className={toolbarSep}></div>

        {/* Alineación */}
        <div className="flex gap-0.5 mr-2">
          <button onClick={() => applyFormat('justifyLeft')} className={toolbarBtn} title="Izquierda">
            <AlignLeft size={16} strokeWidth={2} className={toolbarIcon} />
          </button>
          <button onClick={() => applyFormat('justifyCenter')} className={toolbarBtn} title="Centrar">
            <AlignCenter size={16} strokeWidth={2} className={toolbarIcon} />
          </button>
          <button onClick={() => applyFormat('justifyRight')} className={toolbarBtn} title="Derecha">
            <AlignRight size={16} strokeWidth={2} className={toolbarIcon} />
          </button>
        </div>

        <div className={toolbarSep}></div>

        {/* Listas */}
        <div className="flex gap-0.5 mr-2">
          <button onClick={() => applyFormat('insertUnorderedList')} className={toolbarBtn} title="Lista con viñetas">
            <List size={16} strokeWidth={2} className={toolbarIcon} />
          </button>
          <button onClick={() => applyFormat('insertOrderedList')} className={toolbarBtn} title="Lista numerada">
            <ListOrdered size={16} strokeWidth={2} className={toolbarIcon} />
          </button>
        </div>

        {/* Bloque de código */}
        <div className="flex gap-0.5 mr-2">
          <button
            onClick={insertCodeBlock}
            className={`${toolbarBtn} border border-transparent hover:border-border`}
            title="Insertar bloque de código"
          >
            <Code size={16} strokeWidth={2.5} className={toolbarIcon} />
          </button>
        </div>

        <div className="flex-1"></div>

        {/* ========== MENÚ INTELIGENTE IA ========== */}
        <div className="relative mr-2" ref={aiMenuRef}>
          <button
            onClick={() => setShowAIOptions(!showAIOptions)}
            disabled={isAIProcessing}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm shadow-md transition-all duration-200
              ${isAIProcessing
                ? 'bg-brand-500/40 text-muted-foreground cursor-wait'
                : 'bg-gradient-to-r from-brand-500 to-brand-700 hover:from-brand-600 hover:to-brand-700 text-white hover:scale-105 shadow-brand-500/30'
              }`}
            title="Herramientas IA"
          >
            <Sparkles size={16} strokeWidth={2.5} className={isAIProcessing ? 'animate-pulse' : ''} />
            <span className="hidden sm:inline">{isAIProcessing ? 'Generando...' : 'Asistente IA'}</span>
            {!isAIProcessing && <ChevronDown size={14} />}
          </button>

          {/* Opciones Desplegables Estilo Apple */}
          {showAIOptions && !isAIProcessing && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-card/95 backdrop-blur-xl border border-border rounded-xl shadow-2xl overflow-hidden z-50 animate-scale-in">
              <div className="py-2">
                <p className="px-4 py-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider bg-muted/50 border-b border-border">Acciones Rápidas</p>
                
                <button 
                  onClick={() => handleAIAction("Mejora la redacción, claridad y corrige la ortografía de este documento completo.")} 
                  className="w-full text-left px-4 py-2.5 text-sm text-foreground hover:bg-brand-500 hover:text-white transition-colors flex items-center gap-2"
                >
                  ✨ Mejorar redacción general
                </button>
                
                <button 
                  onClick={() => handleAIAction("Reescribe este texto con un tono académico formal, usando palabras sencillas, redactado en tercera persona.")} 
                  className="w-full text-left px-4 py-2.5 text-sm text-foreground hover:bg-brand-500 hover:text-white transition-colors flex items-center gap-2"
                >
                  🎓 Tono académico (3ra persona)
                </button>
                
                <button 
                  onClick={() => handleAIAction("Genera un resumen conciso de este texto, eliminando redundancias pero manteniendo los puntos principales.")} 
                  className="w-full text-left px-4 py-2.5 text-sm text-foreground hover:bg-brand-500 hover:text-white transition-colors flex items-center gap-2"
                >
                  📝 Resumir documento
                </button>
                
                <button 
                  onClick={() => handleAIAction("Traduce todo el contenido de este documento al inglés de manera natural y profesional.")} 
                  className="w-full text-left px-4 py-2.5 text-sm text-foreground hover:bg-brand-500 hover:text-white transition-colors flex items-center gap-2"
                >
                  🌐 Traducir al Inglés
                </button>

                {/* 👇 NUEVO: INPUT PERSONALIZADO 👇 */}
                <div className="border-t border-border mt-2 pt-3 px-4 pb-2">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Petición Personalizada</p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customPrompt}
                      onChange={(e) => setCustomPrompt(e.target.value)}
                      placeholder="Ej: Hazlo más divertido..."
                      className="flex-1 bg-background border border-input rounded-md px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-brand-500 transition-colors"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && customPrompt.trim()) {
                          handleAIAction(customPrompt);
                          setCustomPrompt(""); // Limpiamos tras enviar
                        }
                      }}
                    />
                    <button
                      onClick={() => {
                        if (customPrompt.trim()) {
                          handleAIAction(customPrompt);
                          setCustomPrompt("");
                        }
                      }}
                      disabled={!customPrompt.trim()}
                      className="bg-brand-500 hover:bg-brand-600 disabled:bg-muted disabled:text-muted-foreground text-white px-3 rounded-md transition-colors shadow-sm flex items-center justify-center"
                      title="Enviar petición"
                    >
                      <Sparkles size={14} />
                    </button>
                  </div>
                </div>

              </div>
            </div>
          )}
        </div>

        {/* Exportar */}
        <button
          onClick={exportToText}
          className="p-2 hover:bg-emerald-500/10 rounded-lg transition-all duration-150 active:scale-95 group border border-transparent hover:border-emerald-500/30"
          title="Descargar como TXT"
        >
          <Download size={16} strokeWidth={2.5} className="text-emerald-600 dark:text-emerald-400 group-hover:text-emerald-500" />
        </button>
      </div>

      {/* ========== ÁREA DE EDICIÓN ========== */}
      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar bg-background transition-colors duration-300">
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          className="p-8 focus:outline-none text-foreground min-h-full"
          style={{
            fontSize: '16px',
            lineHeight: '1.8',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
          }}
          suppressContentEditableWarning
        />
      </div>

      {/* ========== BARRA DE ESTADO ========== */}
      <div className="px-4 py-2 bg-card border-t border-border text-xs text-muted-foreground flex justify-between items-center">
        <span className="flex items-center gap-2">
          {fileId && !fileId.toString().startsWith('sys-') ? (
            <>
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span className="font-medium text-foreground">Editando: {fileName}</span>
            </>
          ) : (
            <>
              <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
              <span className="text-amber-600 dark:text-amber-400">Modo borrador (Sin guardar)</span>
            </>
          )}
        </span>
        <span className="text-muted-foreground/60">
          {editorRef.current?.innerText?.length || 0} caracteres
        </span>
      </div>
    </div>
  );
}

export default WordEditorApp;