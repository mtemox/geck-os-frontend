// src/features/landing/components/Navbar.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import logoIcono from '../../../assets/logos/esfot.png';

function Navbar() {
  const navigate = useNavigate();

  const handleScroll = (e, targetId) => {
    e.preventDefault();
    const targetElement = document.getElementById(targetId.substring(1));
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const navLinks = [
    { href: '#home', label: 'Inicio' },
    { href: '#features', label: 'Características' },
    { href: '#roadmap', label: 'Roadmap' },
  ];

  return (
    <nav
      className="sticky top-0 w-full bg-white/90 backdrop-blur-md z-50 border-b shadow-sm"
      style={{ borderBottomColor: '#e8472a33' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <div
              className="flex items-center space-x-3 cursor-pointer"
              onClick={() => navigate('/')}
            >
              <img
                src={logoIcono}
                alt="Geck-OS logo"
                width={32}
                height={32}
                className="h-8 w-auto object-contain"
                loading="eager"
              />
              <div className="h-6 w-px" style={{ backgroundColor: '#e8472a4d' }} />
              <span className="text-2xl font-bold" style={{ color: '#e8472a' }}>
                Geck-OS
              </span>
            </div>
          </div>

          {/* Links */}
          <div className="hidden md:flex space-x-8">
            {navLinks.map(({ href, label }) => (
              <a
                key={href}
                href={href}
                onClick={(e) => handleScroll(e, href)}
                className="text-slate-600 font-medium transition-colors"
                style={{ textDecoration: 'none' }}
                onMouseEnter={e => e.currentTarget.style.color = '#e8472a'}
                onMouseLeave={e => e.currentTarget.style.color = ''}
              >
                {label}
              </a>
            ))}
          </div>

          {/* Auth buttons */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/login')}
              className="px-3 py-2 rounded-md text-sm font-medium transition-colors text-slate-600"
              onMouseEnter={e => e.currentTarget.style.color = '#e8472a'}
              onMouseLeave={e => e.currentTarget.style.color = ''}
            >
              Iniciar Sesión
            </button>
            <button
              onClick={() => navigate('/register')}
              className="text-white px-4 py-2 rounded-md text-sm font-medium transition-all hover:scale-105 shadow-md"
              style={{ backgroundColor: '#e8472a' }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = '#d03d21'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = '#e8472a'}
            >
              Registrarse
            </button>
          </div>

        </div>
      </div>
    </nav>
  );
}

export default Navbar;