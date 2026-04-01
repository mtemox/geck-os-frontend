// src/features/widgets/RecommendationsApp.jsx
import React, { useState, useEffect } from 'react';
import { useFetch } from '../../core/api/useFetch';
import { Sparkles, Trash2, Zap, Info, RefreshCw } from 'lucide-react';

const RecommendationsApp = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const fetchDataBackend = useFetch();

  const loadRecommendations = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    try {
      const data = await fetchDataBackend(
        `${backendUrl}/ai/recommendations`,
        null,
        "GET",
        { Authorization: `Bearer ${token}` }
      );

      if (data && data.ok) {
        setRecommendations(data.recommendations);
      }
    } catch (error) {
      console.error("Error cargando recomendaciones:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecommendations();
  }, []);

  const getCardStyles = (type) => {
    switch (type) {
      case 'productivity':
        return { 
          icon: <Zap size={18} className="text-yellow-400" />, 
          bg: 'bg-yellow-500/10 border-yellow-500/30' 
        };
      case 'cleanup':
        return { 
          icon: <Trash2 size={18} className="text-destructive" />, 
          bg: 'bg-destructive/10 border-destructive/30' 
        };
      case 'ai':
        return { 
          icon: <Sparkles size={18} className="text-brand-400" />, 
          bg: 'bg-brand-500/10 border-brand-500/30' 
        };
      default:
        return { 
          icon: <Info size={18} className="text-brand-400" />, 
          bg: 'bg-brand-500/10 border-brand-500/20' 
        };
    }
  };

  return (
    <div className="flex flex-col h-full bg-transparent text-foreground p-4 overflow-hidden">
      
      {/* Cabecera */}
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-border">
        <h3 className="font-bold text-lg flex items-center gap-2">
          <Sparkles className="text-brand-500" />
          Asistente IA
        </h3>
        <button 
          onClick={loadRecommendations} 
          className="p-1 hover:bg-muted rounded-full transition-colors text-muted-foreground hover:text-foreground"
          title="Actualizar"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Lista de Recomendaciones */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
        
        {loading && recommendations.length === 0 ? (
          <div className="text-center text-muted-foreground mt-10 animate-pulse">
            Analizando tus notas...
          </div>
        ) : recommendations.length === 0 ? (
          <div className="text-center text-muted-foreground mt-10">
            <p>Todo está en orden.</p>
            <p className="text-xs mt-2">La IA generará sugerencias cuando crees más notas.</p>
          </div>
        ) : (
          recommendations.map((rec) => {
            const style = getCardStyles(rec.type);
            return (
              <div 
                key={rec._id} 
                className={`p-3 rounded-lg border ${style.bg} transition-all hover:scale-[1.02]`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">{style.icon}</div>
                  <div>
                    <h4 className="font-semibold text-sm text-foreground">{rec.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      {rec.text}
                    </p>
                    <span className="text-[10px] text-muted-foreground/60 mt-2 block">
                      {new Date(rec.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default RecommendationsApp;