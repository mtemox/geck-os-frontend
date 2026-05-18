// src/features/file-system/NewFolderForm.jsx
import React, { useState } from 'react';
import { FolderPlus } from 'lucide-react';

function NewFolderForm({
  onSubmit,
  title = "Nombre de la Carpeta",
  placeholder = "Ej: Proyectos 2025",
  buttonText = "Crear Carpeta"
}) {
  const [name, setName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit({ name });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
          {title}
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
          className="w-full bg-background border border-input rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors"
          placeholder={placeholder}
        />
      </div>

      <button
        type="submit"
        className="w-full flex items-center justify-center gap-2 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-medium text-sm rounded-lg transition-colors"
      >
        <FolderPlus size={16} />
        {buttonText}
      </button>
    </form>
  );
}

export default NewFolderForm;