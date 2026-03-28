// src/features/file-system/ShareForm.jsx
import React, { useState } from 'react';
import { UserPlus, Check, Loader, Monitor } from 'lucide-react'; // Monitor icon

function ShareForm({ onSubmit, itemToShare, isDesktop = false }) {
  const [email, setEmail] = useState('');
  const [permission, setPermission] = useState('read'); 
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    // Si es desktop, solo mandamos email. Si es archivo, mandamos permiso también.
    await onSubmit({ email, permission });
    setIsLoading(false);
  };

  return (
    <div className="space-y-4">
      
      {/* Cabecera informativa */}
      <div className={`p-3 border rounded-lg flex items-center gap-3 
          ${isDesktop ? 'bg-purple-900/20 border-purple-500/30' : 'bg-blue-900/20 border-blue-500/30'}`}>
        
        <div className={`p-2 rounded-full ${isDesktop ? 'bg-purple-600/20' : 'bg-blue-600/20'}`}>
            {isDesktop ? <Monitor size={20} className="text-purple-400"/> : <UserPlus size={20} className="text-blue-400" />}
        </div>
        
        <div>
            <p className="text-sm text-gray-200">
                {isDesktop ? "Estás dando acceso total a:" : "Estás compartiendo:"}
            </p>
            <p className="font-bold text-white truncate max-w-[200px]">
                {isDesktop ? "Tu Escritorio Virtual" : itemToShare?.nombre}
            </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Correo del estudiante
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-500"
            placeholder="amigo@epn.edu.ec"
            required
            autoFocus
          />
        </div>

        {/* Solo mostramos selector de permisos si es un archivo (no escritorio completo) */}
        {!isDesktop && (
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
      
      <p className="text-xs text-gray-500 text-center">
        {isDesktop 
            ? "El usuario verá tu escritorio en su menú de inicio." 
            : "El usuario recibirá una notificación si está conectado."}
      </p>
    </div>
  );
}

export default ShareForm;