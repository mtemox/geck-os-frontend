// src/main.jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom' // <-- IMPORTAR
import { Toaster } from 'sileo'
import { ThemeProvider } from './core/context/ThemeContext';
import './index.css'
import App from './App.jsx'

import { SocketProvider } from './core/context/SocketContext.jsx';

createRoot(document.getElementById('root')).render(
  <ThemeProvider>
    <StrictMode>
      <SocketProvider> {/* <--- ENVOLVEMOS AQUÍ (Fuera o dentro del Router, pero fuera de App) */}
        <BrowserRouter>
          <Toaster position="top-right" />
          <App />
        </BrowserRouter>
      </SocketProvider>
    </StrictMode>
  </ThemeProvider>
);