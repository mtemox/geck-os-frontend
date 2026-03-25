// src/components/widgets/ChatWidget.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader, Sparkles, Trash2 } from 'lucide-react';
import { useFetch } from '../../core/api/useFetch';

const ChatWidget = () => {
  // Estado para guardar los mensajes: { role: 'user' | 'ai', text: '...' }
  const [messages, setMessages] = useState([
    { role: 'ai', text: '¡Hola Ariel! Soy MiDesk IA. ¿En qué te puedo ayudar hoy con tus estudios?' }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // Referencia para el scroll automático al final del chat
  const messagesEndRef = useRef(null);
  
  // Hook personalizado que ya tienes configurado
  const fetchDataBackend = useFetch();

  // Función para hacer scroll al fondo cada vez que llegan mensajes
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Lógica para enviar mensaje
  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    // 1. Agregamos el mensaje del usuario a la lista visualmente
    const userMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput(""); // Limpiamos input
    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      const backendUrl = import.meta.env.VITE_BACKEND_URL;

      // 2. Hacemos la petición a TU Backend (Node.js)
      // Node.js se encargará de hablar con Python
      const data = await fetchDataBackend(
        `${backendUrl}/ia/chat`,
        { "mensaje": currentInput }, // <--- Asegura las comillas (aunque JS lo hace solo)
        "POST",
        { 
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json" // <--- Fuérzalo aquí también
        }
      );

      console.log("📦 QUÉ LLEGÓ DE LA IA:", data);

      // 3. Procesamos la respuesta
      if (data && data.ok) {
        // data.data.respuesta es lo que devuelve Python
        const aiResponse = { 
            role: 'ai', 
            text: data.data.respuesta,
            // Opcional: mostrar métricas si quieres debuggear
            metrics: data.data.metricas 
        };
        setMessages(prev => [...prev, aiResponse]);
      } else {
        throw new Error("Respuesta inválida");
      }

    } catch (error) {
      console.error("Error Chat:", error);
      setMessages(prev => [...prev, { role: 'ai', text: '⚠️ Lo siento, tuve un problema al conectar con el servidor de IA.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([{ role: 'ai', text: 'Chat reiniciado. ¿En qué te ayudo?' }]);
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white font-sans">
      
      {/* --- CABECERA (Opcional, ya que la ventana tiene título, pero esto da estilo) --- */}
      <div className="p-3 border-b border-purple-500/30 flex justify-between items-center bg-gray-800/50">
        <div className="flex items-center gap-2 text-sm text-purple-300">
           <Sparkles size={16} />
           <span className="font-semibold">Potenciado por Gemini 2.5</span>
        </div>
        <button 
          onClick={handleClearChat}
          className="p-1.5 hover:bg-white/10 rounded-full text-gray-400 hover:text-red-400 transition-colors"
          title="Limpiar chat"
        >
          <Trash2 size={14} />
        </button>
      </div>

      {/* --- ÁREA DE MENSAJES --- */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {messages.map((msg, index) => (
          <div key={index} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            
            {/* Avatar */}
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 
              ${msg.role === 'user' ? 'bg-blue-600' : 'bg-purple-600'}`}>
              {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
            </div>

            {/* Burbuja de Texto */}
            <div className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap
              ${msg.role === 'user' 
                ? 'bg-blue-600/20 border border-blue-500/30 text-blue-100 rounded-tr-none' 
                : 'bg-gray-800 border border-gray-700 text-gray-200 rounded-tl-none'
              }`}>
              {msg.text}
              
              {/* Mostrar métricas pequeñas si existen (Opcional) */}
              {msg.metrics && (
                <div className="mt-2 pt-2 border-t border-white/10 text-[10px] text-gray-500 flex gap-2">
                  <span>⏱ {msg.metrics.tiempo_respuesta_ms}ms</span>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Indicador de "Escribiendo..." */}
        {isLoading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center shrink-0 animate-pulse">
               <Bot size={16} />
            </div>
            <div className="bg-gray-800 border border-gray-700 p-3 rounded-2xl rounded-tl-none flex items-center gap-2">
               <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></span>
               <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-75"></span>
               <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-150"></span>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* --- INPUT --- */}
      <form onSubmit={handleSend} className="p-3 bg-gray-800/80 border-t border-white/10 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Pregunta sobre tus notas o MiDesk..."
          className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-purple-500 transition-colors"
          disabled={isLoading}
        />
        <button 
          type="submit" 
          disabled={isLoading || !input.trim()}
          className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white p-2 rounded-lg transition-all"
        >
          {isLoading ? <Loader size={18} className="animate-spin" /> : <Send size={18} />}
        </button>
      </form>

    </div>
  );
};

export default ChatWidget;