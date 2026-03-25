// tailwind.config.js

/** @type {import('tailwindcss').Config} */
export default {
  // Esto le dice a Tailwind dónde buscar tus clases
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", 
  ],
  
  darkMode: 'class',
  
  theme: {
    extend: {
      
      // 1. Aquí definimos los "fotogramas clave"
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        }
      },
      // 2. Aquí registramos las animaciones para poder usarlas
      animation: {
        'fade-in': 'fade-in 0.3s ease-out',
        'scale-in': 'scale-in 0.2s ease-out',
      }
    },
  },
  plugins: [],
}