// src/features/widgets/RecommendationsApp.jsx
import React, { useState, useEffect } from 'react';
import { useFetch } from '../../core/api/useFetch';
import { Sparkles, Trash2, Zap, Info, RefreshCw } from 'lucide-react';

const RecommendationsApp = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const fetchDataBackend = useFetch();

  // Función para cargar datos
  const loadRecommendations = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    try {
      // Consumimos tu endpoint: GET /ia/recommendations
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

  // Helper para estilos según el tipo de recomendación
  const getCardStyles = (type) => {
    switch (type) {
      case 'productivity':
        return { 
          icon: <Zap size={18} className="text-yellow-400" />, 
          bg: 'bg-yellow-900/20 border-yellow-700/50' 
        };
      case 'cleanup':
        return { 
          icon: <Trash2 size={18} className="text-red-400" />, 
          bg: 'bg-red-900/20 border-red-700/50' 
        };
      case 'ai':
        return { 
          icon: <Sparkles size={18} className="text-purple-400" />, 
          bg: 'bg-purple-900/20 border-purple-700/50' 
        };
      default:
        return { 
          icon: <Info size={18} className="text-blue-400" />, 
          bg: 'bg-blue-900/20 border-blue-700/50' 
        };
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#1e1e2e] text-white p-4 overflow-hidden">
      
      {/* Cabecera */}
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/10">
        <h3 className="font-bold text-lg flex items-center gap-2">
          <Sparkles className="text-purple-500" />
          Asistente IA
        </h3>
        <button 
          onClick={loadRecommendations} 
          className="p-1 hover:bg-white/10 rounded-full transition-colors"
          title="Actualizar"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Lista de Recomendaciones */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
        
        {loading && recommendations.length === 0 ? (
          <div className="text-center text-gray-500 mt-10 animate-pulse">
            Analizando tus notas...
          </div>
        ) : recommendations.length === 0 ? (
          <div className="text-center text-gray-500 mt-10">
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
                    <h4 className="font-semibold text-sm text-gray-200">{rec.title}</h4>
                    <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                      {rec.text}
                    </p>
                    <span className="text-[10px] text-gray-500 mt-2 block">
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