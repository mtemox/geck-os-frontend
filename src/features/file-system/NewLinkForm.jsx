// src/components/NewLinkForm.jsx
import React, { useState } from 'react';

// Recibe la función 'onSubmit' desde Desktop.jsx
function NewLinkForm({ onSubmit }) {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault(); // Evita que la página se recargue

    // Validación simple
    if (!name || !url) {
      alert('Por favor, completa ambos campos.');
      return;
    }
    
    // Si la URL no empieza con http:// o https://, la añadimos
    let finalUrl = url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      finalUrl = 'https://' + url;
    }

    // Llama a la función que nos pasaron por props
    // con los datos del formulario.
    onSubmit({ name, url: finalUrl });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-purple-200">
          Nombre del Enlace
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-3 py-2 mt-1 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          placeholder="Ej: Google"
        />
      </div>
      <div>
        <label htmlFor="url" className="block text-sm font-medium text-purple-200">
          URL (Página Web)
        </label>
        <input
          id="url"
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="w-full px-3 py-2 mt-1 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          placeholder="Ej: google.com"
        />
      </div>

      {/* Botón de envío */}
      <div className="flex justify-end pt-2">
        <button
          type="submit"
          className="w-full py-2 px-4 font-semibold text-white bg-purple-600 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-800"
        >
          Crear Enlace
        </button>
      </div>
    </form>
  );
}

export default NewLinkForm;