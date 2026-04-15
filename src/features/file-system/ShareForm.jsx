// src/features/file-system/ShareForm.jsx
import React, { useState, useEffect, useRef } from 'react';
import { UserPlus, Check, Loader, Monitor, Briefcase, Search } from 'lucide-react';
import { useFetch } from '../../core/api/useFetch'; // 👈 Importamos tu hook

function ShareForm({ onSubmit, itemToShare, isDesktop = false, isWorkspace = false }) {
  const [email, setEmail] = useState('');
  const [permission, setPermission] = useState('read'); 
  const [isLoading, setIsLoading] = useState(false);
  
  // Nuevos estados para el buscador
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchTimeoutRef = useRef(null);
  
  const fetchDataBackend = useFetch();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const token = localStorage.getItem('token');

  // Efecto buscador "As you type" (Debounce)
  useEffect(() => {
    // Si el usuario borra o el correo es muy corto, limpiamos
    if (email.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    // Cancelamos la búsqueda anterior si el usuario sigue escribiendo rápido
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    // Esperamos 400ms después de que deje de escribir para hacer la petición
    searchTimeoutRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const response = await fetchDataBackend(
          `${backendUrl}/users/search?q=${encodeURIComponent(email)}`,
          null,
          "GET",
          { Authorization: `Bearer ${token}` }
        );

        if (response && response.ok) {
          setSuggestions(response.users);
          setShowSuggestions(true);
        }
      } catch (error) {
        console.error("Error buscando usuarios:", error);
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => clearTimeout(searchTimeoutRef.current);
  }, [email]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    await onSubmit({ email, permission: (isDesktop || isWorkspace) ? undefined : permission });
    setIsLoading(false);
  };

  const handleSelectSuggestion = (selectedEmail) => {
    setEmail(selectedEmail);
    setShowSuggestions(false);
  };

  return (
    <div className="space-y-4">
      
      {/* Cabecera informativa */}
      <div className={`p-3 border rounded-lg flex items-center gap-3 
          ${isDesktop ? 'bg-purple-900/20 border-purple-500/30' 
            : isWorkspace ? 'bg-emerald-900/20 border-emerald-500/30' 
            : 'bg-blue-900/20 border-blue-500/30'}`}>
        
        <div className={`p-2 rounded-full 
          ${isDesktop ? 'bg-purple-600/20' 
            : isWorkspace ? 'bg-emerald-600/20' 
            : 'bg-blue-600/20'}`}>
            {isDesktop ? <Monitor size={20} className="text-purple-400"/> 
              : isWorkspace ? <Briefcase size={20} className="text-emerald-400" />
              : <UserPlus size={20} className="text-blue-400" />}
        </div>
        
        <div>
            <p className="text-sm text-gray-200">
                {isDesktop ? "Estás dando acceso total a:" 
                  : isWorkspace ? "Invitando un nuevo miembro a:" 
                  : "Estás compartiendo:"}
            </p>
            <p className="font-bold text-white truncate max-w-[200px]">
                {isDesktop ? "Tu Escritorio Virtual" 
                  : isWorkspace ? itemToShare?.nombre 
                  : itemToShare?.nombre}
            </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Correo o nombre del estudiante
          </label>
          <div className="relative">
            <input
              type="text" // Cambiado de email a text por si busca por nombre
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => { if(suggestions.length > 0) setShowSuggestions(true); }}
              // Retrasamos el cierre para que permita hacer click en la sugerencia
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)} 
              className="w-full pl-10 pr-3 py-2 bg-gray-900 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-500"
              placeholder="amigo@epn.edu.ec o Juan..."
              required
              autoFocus
              autoComplete="off"
            />
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
              {isSearching ? <Loader size={16} className="animate-spin" /> : <Search size={16} />}
            </div>
          </div>

          {/* Menú desplegable de sugerencias */}
          {showSuggestions && suggestions.length > 0 && (
            <ul className="absolute z-50 w-full mt-1 bg-gray-800 border border-gray-700 rounded-md shadow-lg max-h-48 overflow-y-auto custom-scrollbar">
              {suggestions.map((user) => (
                <li 
                  key={user._id}
                  onClick={() => handleSelectSuggestion(user.email)}
                  className="px-4 py-2 hover:bg-gray-700 cursor-pointer border-b border-gray-700/50 last:border-none transition-colors"
                >
                  <p className="text-sm font-medium text-white">{user.name}</p>
                  <p className="text-xs text-gray-400">{user.email}</p>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Permisos */}
        {(!isDesktop && !isWorkspace) && (
            <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
                Permisos
            </label>
            <div className="grid grid-cols-2 gap-2">
                <button
                type="button"
                onClick={() => setPermission('read')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all border ${
                    permission === 'read'
                    ? 'bg-blue-600 border-blue-500 text-white'
                    : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700'
                }`}
                >
                Solo Leer
                </button>
                <button
                type="button"
                onClick={() => setPermission('edit')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all border ${
                    permission === 'edit'
                    ? 'bg-green-600 border-green-500 text-white'
                    : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700'
                }`}
                >
                Editar
                </button>
            </div>
            </div>
        )}

        <div className="pt-2">
            <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-md flex items-center justify-center gap-2 transition-colors"
            >
                {isLoading ? <Loader size={18} className="animate-spin" /> : <Check size={18} />}
                {isLoading ? 'Procesando...' : (isDesktop ? 'Conceder Acceso' : 'Enviar Invitación')}
            </button>
        </div>
      </form>
      
    </div>
  );
}

export default ShareForm;