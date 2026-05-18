// src/features/file-system/ShareForm.jsx
import React, { useState, useEffect, useRef } from 'react';
import { UserPlus, Check, Loader, Monitor, Briefcase, Search } from 'lucide-react';
import { useFetch } from '../../core/api/useFetch';

function ShareForm({ onSubmit, itemToShare, isDesktop = false, isWorkspace = false }) {
  const [email, setEmail] = useState('');
  const [permission, setPermission] = useState('read');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchTimeoutRef = useRef(null);

  const fetchDataBackend = useFetch();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (email.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const response = await fetchDataBackend(
          `${backendUrl}/users/search?q=${encodeURIComponent(email)}`,
          null, "GET", { Authorization: `Bearer ${token}` }
        );
        if (response?.ok) {
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

  // Variantes de cabecera por contexto
  const headerVariants = {
    desktop: {
      icon: <Monitor size={18} className="text-brand-500" />,
      bg: 'bg-brand-500/10 border-brand-500/30',
      label: 'Estás dando acceso total a:',
      name: 'Tu Escritorio Virtual',
    },
    workspace: {
      icon: <Briefcase size={18} className="text-brand-500" />,
      bg: 'bg-brand-500/10 border-brand-500/30',
      label: 'Invitando un nuevo miembro a:',
      name: itemToShare?.nombre,
    },
    item: {
      icon: <UserPlus size={18} className="text-brand-500" />,
      bg: 'bg-brand-500/10 border-brand-500/30',
      label: 'Estás compartiendo:',
      name: itemToShare?.nombre,
    },
  };

  const variant = isDesktop ? headerVariants.desktop : isWorkspace ? headerVariants.workspace : headerVariants.item;

  const inputClass = "w-full bg-background border border-input rounded-lg pl-9 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors";

  return (
    <div className="space-y-4">

      {/* Cabecera informativa */}
      <div className={`flex items-center gap-3 p-3 rounded-lg border ${variant.bg}`}>
        <div className="p-2 rounded-lg bg-brand-500/10 shrink-0">
          {variant.icon}
        </div>
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">{variant.label}</p>
          <p className="text-sm font-semibold text-foreground truncate">{variant.name}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Input de búsqueda */}
        <div className="relative">
          <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
            Correo o nombre del estudiante
          </label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
              {isSearching
                ? <Loader size={14} className="animate-spin" />
                : <Search size={14} />}
            </div>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              className={inputClass}
              placeholder="amigo@epn.edu.ec o Juan..."
              required
              autoFocus
              autoComplete="off"
            />
          </div>

          {/* Sugerencias */}
          {showSuggestions && suggestions.length > 0 && (
            <ul className="absolute z-50 w-full mt-1 bg-card border border-border rounded-lg shadow-xl max-h-48 overflow-y-auto custom-scrollbar">
              {suggestions.map((user) => (
                <li
                  key={user._id}
                  onClick={() => handleSelectSuggestion(user.email)}
                  className="px-4 py-2.5 hover:bg-muted cursor-pointer border-b border-border last:border-none transition-colors"
                >
                  <p className="text-sm font-medium text-foreground">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Selector de permisos (solo para items, no desktop/workspace) */}
        {!isDesktop && !isWorkspace && (
          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
              Permisos
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPermission('read')}
                className={`py-2 rounded-lg text-sm font-medium transition-all border ${
                  permission === 'read'
                    ? 'bg-brand-500 border-brand-500 text-white shadow-sm'
                    : 'bg-background border-border text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                Solo leer
              </button>
              <button
                type="button"
                onClick={() => setPermission('edit')}
                className={`py-2 rounded-lg text-sm font-medium transition-all border ${
                  permission === 'edit'
                    ? 'bg-brand-500 border-brand-500 text-white shadow-sm'
                    : 'bg-background border-border text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                Editar
              </button>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 py-2.5 bg-brand-500 hover:bg-brand-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium text-sm rounded-lg transition-colors shadow-sm"
        >
          {isLoading
            ? <><Loader size={16} className="animate-spin" /> Procesando...</>
            : isDesktop
              ? <><Monitor size={16} /> Conceder Acceso</>
              : <><Check size={16} /> Enviar Invitación</>}
        </button>
      </form>
    </div>
  );
}

export default ShareForm;