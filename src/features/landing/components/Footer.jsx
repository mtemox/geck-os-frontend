// src/features/landing/components/Footer.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

function Footer() {
  const navigate = useNavigate();

  return (
    <footer
      className="bg-white pt-12 pb-8"
      style={{ borderTop: '2px solid #e8472a33' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">

          <div className="text-center md:text-left">
            <span
              className="text-2xl font-bold cursor-pointer"
              style={{ color: '#e8472a' }}
              onClick={() => navigate('/')}
            >
              Geck-OS
            </span>
            <p className="text-slate-400 text-sm mt-2">
              &copy; 2025 Geck-OS. Todos los derechos reservados.
            </p>
          </div>

          <div className="flex space-x-6">
            <a href="#" className="text-slate-500 hover:text-slate-900 transition-colors text-sm">
              Términos
            </a>
            <a href="#" className="text-slate-500 hover:text-slate-900 transition-colors text-sm">
              Privacidad
            </a>
            <a
              href="#contact"
              onClick={e => e.preventDefault()}
              className="text-slate-500 hover:text-slate-900 transition-colors text-sm"
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