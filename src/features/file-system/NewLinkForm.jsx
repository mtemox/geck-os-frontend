// src/features/file-system/NewLinkForm.jsx
import React, { useState } from 'react';
import { Link2 } from 'lucide-react';

function NewLinkForm({ onSubmit }) {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !url) return;
    let finalUrl = url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      finalUrl = 'https://' + url;
    }
    onSubmit({ name, url: finalUrl });
  };

  const inputClass = "w-full bg-white/50 dark:bg-black/20 border border-gray-300/50 dark:border-gray-700/50 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500/50 transition-all backdrop-blur-sm shadow-inner";
  const labelClass = "block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 ml-1";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className={labelClass}>Nombre del Enlace</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
          className={inputClass}
          placeholder="Ej: Google"
        />
      </div>
      <div>
        <label className={labelClass}>URL (Página Web)</label>
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className={inputClass}
          placeholder="Ej: google.com"
        />
      </div>

      <button
        type="submit"
        className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-400 hover:to-brand-500 text-white font-medium text-sm rounded-xl transition-all shadow-[0_4px_14px_0_rgba(0,0,0,0.1)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.15)] hover:scale-[1.01] active:scale-95 mt-2"
      >
        <Link2 size={18} />
        Crear Enlace
      </button>
    </form>
  );
}

export default NewLinkForm;