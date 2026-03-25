import React, { useState } from 'react';
import { Save, Sparkles, Loader } from 'lucide-react';
import { sileo } from 'sileo';
import { useFetch } from '../../core/api/useFetch';

const NotepadApp = ({ fileId, fileName, initialContent = "" }) => {
  const [content, setContent] = useState(initialContent);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const fetchDataBackend = useFetch();

  // --- 1. Lógica para Guardar (SB-B-007) ---
  const handleSave = async () => {
    if (!fileId) {
      sileo.error({title: "Este archivo no se puede guardar (es temporal o de sistema)."});
      return;
    }

    const token = localStorage.getItem('token');
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    try {
      // Usamos el endpoint que memoricé: PUT /files/:id
      await fetchDataBackend(
        `${backendUrl}/files/${fileId}`,
        { content }, 
        "PUT",
        { Authorization: `Bearer ${token}` }
      );
      // El useFetch ya muestra toast de éxito si el backend devuelve msg
    } catch (error) {
      console.error("Error al guardar:", error);
    }
  };

  // --- 2. Lógica para Mejorar con IA (SB-F-008) ---
  const handleImproveWithAI = async () => {
    if (!content.trim()) {
      sileo.warning({title: "Escribe algo antes de pedir ayuda a la IA."});
      return;
    }

    setIsAiLoading(true);
    const token = localStorage.getItem('token');
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    try {
      // Usamos el endpoint que memoricé: POST /ia/improve-text
      const response = await fetchDataBackend(
        `${backendUrl}/ia/improve-text`,
        { text: content }, // El backend espera req.body.text
        "POST",
        { Authorization: `Bearer ${token}` }
      );

      if (response && response.ok && response.improvedText) {
        setContent(response.improvedText);
        sileo.success({title: "¡Texto mejorado por IA!"});
      }
    } catch (error) {
      console.error("Error IA:", error);
      sileo.error({title: "Error al conectar con la IA."});
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white">
      {/* Barra de Herramientas */}
      <div className="flex items-center gap-2 p-2 bg-gray-800 border-b border-purple-500/30">
        
        {/* Botón Guardar */}
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded text-xs font-medium transition-colors"
          title="Guardar cambios"
        >
          <Save size={14} />
          Guardar
        </button>

        <div className="flex-1"></div> {/* Espaciador */}

        {/* Botón IA */}
        <button
          onClick={handleImproveWithAI}
          disabled={isAiLoading}
          className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-medium transition-colors border border-purple-500/50
            ${isAiLoading 
              ? 'bg-purple-900/50 cursor-wait text-gray-400' 
              : 'bg-purple-600/20 hover:bg-purple-600 hover:text-white text-purple-200'
            }`}
        >
          {isAiLoading ? (
            <>
              <Loader size={14} className="animate-spin" />
              Pensando...
            </>
          ) : (
            <>
              <Sparkles size={14} />
              Mejorar con IA
            </>
          )}
        </button>
      </div>

      {/* Área de Texto */}
      <textarea
        className="flex-1 w-full h-full p-4 bg-[#1e1e2e] text-gray-200 resize-none focus:outline-none font-mono text-sm leading-relaxed"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Escribe aquí tus notas..."
        spellCheck="false"
      />
      
      {/* Barra de estado inferior */}
      <div className="px-4 py-1 bg-gray-800 text-[10px] text-gray-500 flex justify-between">
        <span>{fileId ? `Archivo: ${fileName}` : 'Archivo temporal'}</span>
        <span>{content.length} caracteres</span>
      </div>
    </div>
  );
};

export default NotepadApp;