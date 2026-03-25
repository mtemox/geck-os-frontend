// src/App.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './features/auth/pages/Login';
import Register from './features/auth/pages/Register';
import AppLayout from './features/desktop/pages/AppLayout';
import ProtectedRoute from './features/auth/components/ProtectedRoute';
import LandingPage from './features/landing/pages/LandingPage';
import { Confirm } from './features/auth/pages/Confirm';
import Forgot from './features/auth/pages/Forgot';
import Reset from './features/auth/pages/Reset';
import Dashboard from './features/desktop/pages/Dashboard';
import GoogleSuccess from './features/auth/pages/GoogleSuccess';

function App() {

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} /> 
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/google-success" element={<GoogleSuccess />} />
      <Route path="/confirmar/:token" element={<Confirm />} />
      <Route path="/forgot" element={<Forgot />} />
      <Route path="/reset/:token" element={<Reset />} />
      
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/desktop" 
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        } 
      />
      
      <Route path="*" element={<Navigate to="/" />} /> 
    </Routes>
  );
}

export default App;