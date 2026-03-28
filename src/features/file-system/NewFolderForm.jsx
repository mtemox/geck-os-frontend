// src/features/file-system/NewFolderForm.jsx
import React, { useState } from 'react';

function NewFolderForm({ onSubmit }) {
  const [name, setName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    // Enviamos solo el nombre. El tipo "folder" lo gestionará Desktop.jsx
    onSubmit({ name });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="folderName" className="block text-sm font-medium text-purple-200">
          Nombre de la Carpeta
        </label>
        <input
          id="folderName"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
          className="w-full px-3 py-2 mt-1 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          placeholder="Ej: Proyectos 2025"
        />
      </div>

      <div className="flex justify-end pt-2">
        <button
          type="submit"
          className="w-full py-2 px-4 font-semibold text-white bg-purple-600 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          Crear Carpeta
        </button>
      </div>
    </form>
  );
}

export default NewFolderForm;