// src/components/widgets/WallpaperWidget.jsx
import React, { useState, useEffect } from 'react';

// Asegúrate de añadir esto a tu .env.local
const API_KEY = import.meta.env.VITE_UNSPLASH_API_KEY;

function WallpaperWidget() {
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPhoto = async () => {
      // Pedimos una foto aleatoria con la palabra "nature"
      const url = `https://api.unsplash.com/photos/random?query=nature&orientation=landscape&client_id=${API_KEY}`;
      
      try {
        setLoading(true);
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('No se pudo cargar la foto');
        }
        const data = await response.json();
        setPhoto(data);
        setError(null);
      } catch (err) {
        setError(err.message);
        setPhoto(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPhoto();
  }, []);

  if (loading) {
    return <div className="text-white p-2">Cargando foto...</div>;
  }

  if (error) {
    return <div className="text-red-400 p-2">Error: {error}</div>;
  }
  
  if (!photo) return null;

  return (
    <div className="text-white h-full w-full flex flex-col">
      <img 
        src={photo.urls.regular} 
        alt={photo.alt_description}
        className="w-full h-full object-cover rounded-b-lg" // Ocupa todo el espacio
      />
      {/* Podrías poner un pie de foto sobre la imagen */}
      <p className="absolute bottom-2 left-2 text-xs bg-black/50 p-1 rounded">
        Foto por: 
        <a 
          href={photo.user.links.html} 
          target="_blank" 
          rel="noopener noreferrer"
          className="hover:underline"
        >
          {photo.user.name}
        </a> 
        en Unsplash
      </p>
    </div>
  );
}

export default WallpaperWidget;