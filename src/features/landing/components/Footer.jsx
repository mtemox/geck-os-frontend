// src/components/landing/Footer.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

function Footer() {
  const navigate = useNavigate();

  // (Podríamos reusar la lógica de scroll suave aquí,
  // pero por ahora, los links pueden ser simples)

  return (
    <footer 
      // Usamos el mismo 'to-gray-900' del Roadmap para
      // que el gradiente continúe suavemente
      className="bg-gray-900 border-t border-red-500/30 pt-12 pb-8"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          
          {/* --- Logo y Copyright --- */}
          <div className="text-center md:text-left mb-4 md:mb-0">
            <span 
              className="text-2xl font-bold text-red-500 cursor-pointer"
              onClick={() => navigate('/')} // Navega al inicio
            >
              MiDesk
            </span>
            <p className="text-gray-400 text-sm mt-2">
              {/* Usamos el año de tu plan para ser consistentes */}
              &copy; 2025 MiDesk. Todos los derechos reservados.
            </p>
          </div>
          
          {/* --- Links Adicionales --- */}
          <div className="flex space-x-6">
            <a href="#" className="text-gray-300 hover:text-white transition-colors">
              Términos
            </a>
            <a href="#" className="text-gray-300 hover:text-white transition-colors">
              Privacidad
            </a>
            <a 
              href="#contact" 
              onClick={(e) => {
                // (Simulamos un scroll a 'contacto' si existiera)
                e.preventDefault(); 
              }}
              className="text-gray-300 hover:text-white transition-colors"
            >
              Contacto
            </a>
          </div>

        </div>
      </div>
    </footer>
  );
}

export default Footer;