// src/components/landing/Navbar.jsx

import React from 'react';
// Importamos 'useNavigate' para los botones de Login/Register
import { useNavigate } from 'react-router-dom'; 

import logoIcono from '../../../assets/logos/esfot.png'; 

function Navbar() {
  // 'useNavigate' nos da una función para cambiar de página
  const navigate = useNavigate();

  // --- Lógica para el Scroll Suave (Punto 9 de tu plan) ---
  const handleScroll = (e, targetId) => {
    e.preventDefault(); // Evita el salto brusco del 'href'
    
    // Quita el '#' del 'targetId'
    const targetElement = document.getElementById(targetId.substring(1));
    
    if (targetElement) {
      targetElement.scrollIntoView({
        behavior: 'smooth', // ¡La magia del scroll suave!
        block: 'start'
      });
    }
  };

  return (
    // --- Estructura del Navbar (Punto 4 de tu plan) ---
    <nav className="fixed top-0 w-full bg-black/90 backdrop-blur-md z-50 border-b border-red-500/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* --- Logo (MODIFICADO) --- */}
          <div className="flex-shrink-0 flex items-center">
            <div 
              className="flex items-center space-x-3 cursor-pointer" 
              onClick={() => navigate('/')}
            >
              {/* 3. Logo 1 (Imagen de Ícono) */}
              <img 
                src={logoIcono} 
                alt="MiDesk Icono" 
                className="h-8 w-auto" // 'w-auto' mantiene la proporción
              />
              
              {/* Un separador bonito */}
              <div className="h-6 w-px bg-red-500/30"></div>

              {/* 4. Logo 2 (Imagen de Texto) */}
              {/* <-- 3. Logo 2 (El Texto) */}
              <span className="text-2xl font-bold text-red-500">
                MiDesk
              </span>

            </div>
          </div>
          
          {/* --- Links de Navegación (Desktop) --- */}
          {/* 'hidden md:flex' = Oculto en móvil, visible en desktop */}
          <div className="hidden md:flex space-x-8">
            <a 
              href="#home" 
              onClick={(e) => handleScroll(e, '#home')}
              className="text-gray-300 hover:text-white transition-colors"
            >
              Inicio
            </a>
            <a 
              href="#features" 
              onClick={(e) => handleScroll(e, '#features')}
              className="text-gray-300 hover:text-white transition-colors"
            >
              Características
            </a>
            <a 
              href="#roadmap" 
              onClick={(e) => handleScroll(e, '#roadmap')}
              className="text-gray-300 hover:text-white transition-colors"
            >
              Roadmap
            </a>
          </div>
          
          {/* --- Botones de Autenticación --- */}
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => navigate('/login')}
              className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Iniciar Sesión
            </button>
            <button 
              onClick={() => navigate('/register')}
              className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 transition-transform hover:scale-105"
            >
              Registrarse
            </button>
          </div>

          {/* (Aquí se podría añadir un botón de menú para móviles en el futuro) */}

        </div>
      </div>
    </nav>
  );
}

export default Navbar;