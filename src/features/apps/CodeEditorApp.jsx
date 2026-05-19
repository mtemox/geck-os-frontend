// src/features/apps/CodeEditorApp.jsx
import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Save, Columns, Code as CodeIcon, FileCode, Loader, Play, Terminal, X } from 'lucide-react';
import { sileo } from 'sileo';
import { useFetch } from '../../core/api/useFetch';
import { useSocket } from '../../core/context/SocketContext';
import { useSearchParams } from 'react-router-dom';

// Importaciones dinámicas:
const Editor = lazy(() => import('@monaco-editor/react'));
const MonacoDiffEditor = lazy(() => import('@monaco-editor/react').then(module => ({ default: module.DiffEditor })));

const CodeEditorApp = ({ fileId, fileName, initialContent = "" }) => {
  // Estado del código actual
  const [code, setCode] = useState(initialContent);
  // Estado del código original (lo último guardado en BD)
  const [originalCode, setOriginalCode] = useState(initialContent);

  const [language, setLanguage] = useState('javascript');
  const [showDiff, setShowDiff] = useState(false);

  // Para la compilación
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [showTerminal, setShowTerminal] = useState(false);

  const { socket } = useSocket();
  const [searchParams] = useSearchParams();

  const fetchDataBackend = useFetch();

  // --- LOGICA DE SOCKET ---
  useEffect(() => {
    if (!socket) return;

    socket.on('code-change', (data) => {
      if (data.content !== code) {
        setCode(data.content);
      }
      if (data.language && data.language !== language) {
        setLanguage(data.language);
      }
    });

    return () => {
      socket.off('code-change');
    };
  }, [socket, code, language]);

  // --- FUNCIÓN PARA EMITIR CAMBIOS ---
  const handleEditorChange = (value) => {
    setCode(value);

    if (socket) {
      const user = JSON.parse(localStorage.getItem('user'));
      const remoteId = searchParams.get('remote');
      const targetUserId = remoteId || user.id;

      socket.emit('code-change', {
        userId: targetUserId,
        content: value,
        language
      });
    }
  };

  // --- FUNCIÓN GUARDAR ---
  const handleSave = async () => {
    if (!fileId || fileId.toString().startsWith('sys-')) {
      sileo.info({ title: "Modo simulación. Crea un archivo real de código para guardar." });
      return;
    }

    const token = localStorage.getItem('token');
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    try {
      await fetchDataBackend(
        `${backendUrl}/items/update/${fileId}`,
        { content: code }, 
        "PATCH",
        { Authorization: `Bearer ${token}` }
      );

      setOriginalCode(code);
      window.dispatchEvent(new CustomEvent('local-file-update', { detail: { id: fileId, content: code } }));

    } catch (error) {
      console.error("Error al guardar código:", error);
    }
  };

  // --- CAMBIAR LENGUAJE ---
  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    setLanguage(newLang);
    if (socket) {
      const user = JSON.parse(localStorage.getItem('user'));
      socket.emit('code-change', { userId: user.id, content: code, language: newLang });
    }
  };

  // --- FUNCIÓN EJECUTAR CÓDIGO (Llamada real al Backend) ---
  const handleRunCode = async () => {
    if (!code.trim()) {
      sileo.info({ title: "El editor está vacío. Escribe algo de código primero." });
      return;
    }

    setIsRunning(true);
    setShowTerminal(true);
    setOutput("Compilando y ejecutando en el servidor...\n");

    const token = localStorage.getItem('token');
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    try {
      // Consumimos el endpoint real de ejecución
      const response = await fetchDataBackend(
        `${backendUrl}/execute/run`,
        { code, language },
        "POST",
        { Authorization: `Bearer ${token}` }
      );

      if (response) {
        if (response.isError) {
          setOutput(`❌ Error de ejecución:\n\n${response.output}`);
        } else {
          setOutput(response.output || "Ejecución finalizada con éxito sin salida en consola.");
        }
      }
    } catch (error) {
      console.error("Error al ejecutar el código:", error);
      setOutput(`❌ Error de conexión:\nNo se pudo contactar con el motor de ejecución.\n${error.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-[#1e1e2e] text-slate-900 dark:text-white transition-colors duration-300">

      {/* --- BARRA DE HERRAMIENTAS PREMIUM --- */}
      <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gradient-to-b dark:from-[#252536] dark:to-[#1f1f2e] bg-gradient-to-b from-slate-100 to-white border-b border-slate-200 dark:border-white/10 backdrop-blur-xl transition-colors duration-300">

        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-gray-800/40 rounded-lg border border-slate-200 dark:border-white/5 transition-colors duration-300">
          <FileCode size={15} className="text-blue-500 dark:text-blue-400" strokeWidth={2.5} />
          <span className="text-xs font-medium text-slate-700 dark:text-gray-200 tracking-wide">{fileName || "Sin título"}</span>
        </div>

        <div className="h-6 w-px bg-slate-300 dark:bg-white/10 mx-1"></div>

        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-4 py-1.5 bg-gradient-to-b from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-lg shadow-lg shadow-blue-500/20 transition-all duration-200 hover:scale-105 font-medium text-sm text-white"
          title="Guardar cambios"
        >
          <Save size={15} strokeWidth={2.5} />
          <span>Guardar</span>
        </button>

        <button
          onClick={handleRunCode}
          disabled={isRunning || showDiff}
          className="flex items-center gap-2 px-4 py-1.5 bg-gradient-to-b from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 disabled:from-slate-400 disabled:to-slate-500 rounded-lg shadow-lg shadow-emerald-500/20 transition-all duration-200 hover:scale-105 font-medium text-sm text-white"
          title="Ejecutar código"
        >
          {isRunning ? <Loader size={15} className="animate-spin" /> : <Play size={15} strokeWidth={2.5} />}
          <span>{isRunning ? "Ejecutando..." : "Ejecutar"}</span>
        </button>

        <button
          onClick={() => setShowDiff(!showDiff)}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 border
            ${showDiff
              ? 'bg-gradient-to-r from-purple-500 to-pink-500 border-transparent shadow-lg shadow-purple-500/20 text-white hover:scale-105'
              : 'bg-slate-200 dark:bg-gray-700/30 border-slate-300 dark:border-white/10 text-slate-700 dark:text-gray-300 hover:bg-slate-300 dark:hover:bg-white/10 hover:border-slate-400 dark:hover:border-white/20'
            }`}
          title={showDiff ? "Volver a Edición" : "Comparar cambios"}
        >
          <Columns size={15} strokeWidth={2.5} />
          <span className="hidden sm:inline">{showDiff ? "Ocultar Diff" : "Comparar"}</span>
        </button>

        <div className="flex-1"></div>

        {/* --- SELECTOR DE LENGUAJE (SOLO LOS SOPORTADOS) --- */}
        <div className="flex items-center gap-2 bg-slate-200 dark:bg-gray-700/30 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-white/10 hover:border-blue-500 dark:hover:border-blue-400/50 transition-colors duration-200">
          <CodeIcon size={14} className="text-slate-500 dark:text-gray-400" strokeWidth={2} />
          <select
            value={language}
            onChange={handleLanguageChange}
            className="bg-transparent text-slate-700 dark:text-gray-200 text-sm font-medium outline-none cursor-pointer hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
            style={{ minWidth: '100px' }}
          >
            <option value="javascript" className="bg-white dark:bg-[#252536]">JavaScript</option>
            <option value="python" className="bg-white dark:bg-[#252536]">Python</option>
            <option value="cpp" className="bg-white dark:bg-[#252536]">C++</option>
            <option value="c" className="bg-white dark:bg-[#252536]">C</option>
          </select>
        </div>
      </div>

      {/* --- ÁREA DEL EDITOR --- */}
      <div className="flex-1 overflow-hidden relative flex flex-col">
        <Suspense fallback={
          <div className="flex flex-col items-center justify-center h-full text-slate-500 dark:text-slate-400">
            <Loader className="animate-spin mb-3" size={32} />
            <p className="text-sm font-medium">Cargando el motor de código...</p>
          </div>
        }>
          {showDiff ? (
            <MonacoDiffEditor
              height="100%"
              language={language}
              theme="vs-dark"
              original={originalCode}
              modified={code}
              options={{
                renderSideBySide: true,
                readOnly: true,
                minimap: { enabled: false }
              }}
            />
          ) : (
            <Editor
              height="100%"
              language={language}
              theme="vs-dark"
              value={code}
              onChange={handleEditorChange}
              options={{
                minimap: { enabled: true },
                fontSize: 14,
                scrollBeyondLastLine: false,
                automaticLayout: true,
              }}
            />
          )}
        </Suspense>

        {/* --- CONSOLA / TERMINAL --- */}
        {showTerminal && (
          <div className="h-1/3 min-h-[150px] border-t border-slate-300 dark:border-white/10 bg-[#1e1e1e] flex flex-col transition-all duration-300 animate-fade-in-up">
            <div className="flex items-center justify-between px-4 py-2 bg-[#252526] border-b border-white/5">
              <div className="flex items-center gap-2 text-gray-300">
                <Terminal size={14} />
                <span className="text-xs font-semibold tracking-wider uppercase">Terminal Salida</span>
              </div>
              <button
                onClick={() => setShowTerminal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X size={14} />
              </button>
            </div>
            <div className="flex-1 p-4 overflow-y-auto custom-scrollbar font-mono text-sm">
              <pre className="text-green-400 whitespace-pre-wrap break-words">
                {output}
              </pre>
            </div>
          </div>
        )}
      </div>

      {/* --- BARRA DE ESTADO INFERIOR --- */}
      <div className="px-4 py-1.5 bg-white dark:bg-gradient-to-b dark:from-[#252536] dark:to-[#1f1f2e] bg-gradient-to-b from-slate-100 to-white border-t border-slate-200 dark:border-white/10 flex justify-between items-center text-[10px] text-slate-500 dark:text-gray-400 font-mono backdrop-blur-sm transition-colors duration-300">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <div className={`w-1.5 h-1.5 rounded-full ${showDiff ? 'bg-purple-500 dark:bg-purple-400 animate-pulse' : 'bg-emerald-500 dark:bg-emerald-400'}`}></div>
            <span className="text-slate-600 dark:text-gray-400">{showDiff ? "Comparación Activa" : "Editando"}</span>
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-slate-500 dark:text-gray-500">Líneas: <span className="text-blue-600 dark:text-blue-400 font-semibold">{code ? code.split('\n').length : 0}</span></span>
          <span className="text-slate-500 dark:text-gray-500">Lenguaje: <span className="text-purple-600 dark:text-purple-400 font-semibold">{language.toUpperCase()}</span></span>
        </div>
      </div>

    </div>
  );
};

export default CodeEditorApp;