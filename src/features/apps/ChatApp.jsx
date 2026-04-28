// src/features/widgets/ChatApp.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader, Sparkles, Trash2 } from 'lucide-react';
import { useFetch } from '../../core/api/useFetch';

const ChatApp = () => {
  const [messages, setMessages] = useState([
    { role: 'ai', text: '¡Hola Ariel! Soy MiDesk IA. ¿En qué te puedo ayudar hoy con tus estudios?' }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef(null);
  const fetchDataBackend = useFetch();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { id: Date.now(), role: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput("");
    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      const backendUrl = import.meta.env.VITE_BACKEND_URL;

      const data = await fetchDataBackend(
        `${backendUrl}/ai/chat`,
        { "mensaje": currentInput },
        "POST",
        {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      );

      if (data && data.ok) {
        // Guardamos la respuesta completa para inspeccionarla
        const respuestaCompleta = data.data;

        const aiResponse = {
          id: Date.now() + 1,
          role: 'ai',
          // 👇 SOLUCIÓN: Si es un objeto, extraemos solo la propiedad 'mensaje'
          // Si por alguna razón ya fuera un string, lo dejamos como está.
          text: typeof respuestaCompleta === 'object'
            ? respuestaCompleta.mensaje
            : respuestaCompleta,

          // Si quieres guardar los otros datos (comando, apps) para usarlos luego:
          metadata: typeof respuestaCompleta === 'object' ? {
            comando: respuestaCompleta.comando,
            apps: respuestaCompleta.apps,
            contenido_nota: respuestaCompleta.contenido_nota
          } : null,

          // Ajuste de métricas según tu backend anterior
          metrics: data.metrics || null
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
    <div className="flex flex-col h-full bg-transparent text-foreground font-sans">

      {/* --- CABECERA --- */}
      <div className="p-3 border-b border-brand-500/30 flex justify-between items-center bg-card/50 backdrop-blur-sm">
        <div className="flex items-center gap-2 text-sm text-brand-400">
          <Sparkles size={16} />
          <span className="font-semibold">Potenciado por Gemini 2.5</span>
        </div>
        <button
          onClick={handleClearChat}
          className="p-1.5 hover:bg-muted rounded-full text-muted-foreground hover:text-destructive transition-colors"
          title="Limpiar chat"
        >
          <Trash2 size={14} />
        </button>
      </div>

      {/* --- ÁREA DE MENSAJES --- */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {messages.map((msg) => (
          <div key={msg.id || Math.random()} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>

            {/* Avatar */}
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-white
              ${msg.role === 'user' ? 'bg-brand-500' : 'bg-brand-700'}`}>
              {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
            </div>

            {/* Burbuja de Texto */}
            <div className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap
              ${msg.role === 'user'
                ? 'bg-brand-500/20 border border-brand-500/40 text-foreground rounded-tr-none'
                : 'bg-card border border-border text-card-foreground rounded-tl-none'
              }`}>
              {msg.text}

              {msg.metrics && (
                <div className="mt-2 pt-2 border-t border-border text-[10px] text-muted-foreground flex gap-2">
                  <span>⏱ {msg.metrics.tiempo_respuesta_ms}ms</span>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Indicador "Escribiendo..." */}
        {isLoading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-brand-700 flex items-center justify-center shrink-0 animate-pulse text-white">
              <Bot size={16} />
            </div>
            <div className="bg-card border border-border p-3 rounded-2xl rounded-tl-none flex items-center gap-2">
              <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></span>
              <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-75"></span>
              <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-150"></span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* --- INPUT --- */}
      <form onSubmit={handleSend} className="p-3 bg-card/80 backdrop-blur-sm border-t border-border flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Pregunta sobre tus notas o MiDesk..."
          className="flex-1 bg-background border border-input rounded-lg px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-brand-500 transition-colors"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="bg-brand-500 hover:bg-brand-600 disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed text-white p-2 rounded-lg transition-all"
        >
          {isLoading ? <Loader size={18} className="animate-spin" /> : <Send size={18} />}
        </button>
      </form>

    </div>
  );
};

export default ChatApp;