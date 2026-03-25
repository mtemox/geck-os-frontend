// src/components/Modal.jsx
import React from 'react';

// Recibe 4 props:
// - isVisible: (true/false) para mostrarse
// - onClose: la función que se ejecuta al cerrar (ej. clic en backdrop o 'X')
// - title: El título de la ventana
// - children: El contenido (nuestro futuro formulario)
function Modal({ isVisible, onClose, title, children }) {
  
  // Si no es visible, no renderiza nada.
  if (!isVisible) {
    return null;
  }

  // Esta función maneja el clic en el fondo oscuro.
  // 'e.target' es el elemento donde se hizo clic.
  // 'e.currentTarget' es el elemento que tiene el 'onClick' (el fondo).
  // Si son el mismo, significa que se hizo clic en el fondo
  // y no en el contenido del modal.
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    // Contenedor principal (Fondo oscuro)
    // 'fixed inset-0' hace que ocupe toda la pantalla.
    
    // --- 1. FONDO (BACKDROP) MODIFICADO ---
    // Cambiamos 'backdrop-blur-sm' por 'backdrop-blur-lg' (10px es 'lg')
    
    <div 
      className="fixed inset-0 z-40 bg-black bg-opacity-60 backdrop-blur-lg 
                 flex items-center justify-center"
      onClick={handleBackdropClick} // Clic en el fondo para cerrar
    >
      
      {/* El contenedor del Modal (La ventana) */}

      {/* --- 2. VENTANA MODIFICADA --- */}
      {/* Añadimos 'animate-scale-in' (del Paso 0) */}

      <div 
        className="w-full max-w-lg p-6 bg-gray-800 bg-opacity-90 
                   rounded-lg shadow-2xl border border-purple-500/30 text-white
                   animate-scale-in"
        // Evitamos que el clic en el modal se propague al fondo
        onClick={e => e.stopPropagation()} 
      >
        
        {/* Encabezado del Modal (Título y Botón de Cerrar) */}
        <div className="flex justify-between items-center pb-3 border-b border-purple-500/30">
          <h3 className="text-2xl font-semibold">{title}</h3>
          <button 
            onClick={onClose} // Clic en la 'X' para cerrar
            className="text-gray-400 hover:text-white text-3xl font-light"
            title="Cerrar"
          >
            &times; {/* Este es el caracter 'X' */}
          </button>
        </div>

        {/* Contenido (Aquí irá nuestro formulario) */}
        <div className="mt-4">
          {children}
        </div>

      </div>
    </div>
  );
}

export default Modal;