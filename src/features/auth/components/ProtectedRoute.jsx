// src/layouts/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children }) {
  // Tarea SB-F-002: Revisa si el token está almacenado
  const token = localStorage.getItem('token'); 

  if (!token) {
    // Si no hay token, redirige al login
    return <Navigate to="/login" replace />;
  }

  // Si hay token, muestra el contenido (AppLayout)
  return children;
}

export default ProtectedRoute;