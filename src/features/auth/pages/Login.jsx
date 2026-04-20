// src/features/auth/pages/Login.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
// import axios from 'axios'; // (Descomentar para la API real)
import AuthLayout from '../components/Auth'; // Reutilizamos el layout
import { useFetch } from '../../../core/api/useFetch';
import { useForm } from "react-hook-form";
import dragonBg from '../../../assets/wallpapers/deg3.jpg';
import logoMidesk from '../../../assets/logos/midesk.jpg';
import { useSocket } from '../../../core/context/SocketContext';

// Iconos para darle el toque de SO (Sistema Operativo)
import { Power, RefreshCcw, Wifi } from 'lucide-react';

function Login() {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Bloqueo, 2: Login
  const navigate = useNavigate();
  const fetchDataBackend = useFetch();
  const { connectSocket } = useSocket();
  
  const { register, handleSubmit, formState: { errors } } = useForm();

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  // Función para redirigir a Google
  const handleGoogleLogin = () => {
    // Redirige al navegador completo hacia tu backend
    window.location.href = `${backendUrl}/auth/google`;
  };
  
  // Función de login
  const onSubmit = async (data) => {
    setLoading(true);

    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL;
      
      // 'data' ya contiene { email, password }
      const response = await fetchDataBackend(
        `${backendUrl}/auth/login`, // Apuntamos a la nueva ruta
        data,
        "POST"
      );
       
      // 2. Verificamos si llegó el token
        if (response?.token) {
            // Guardamos el token
            localStorage.setItem('token', response.token);
            
            const userData = {
                nombre: response.nombre,
                rol: response.rol,
                id: response._id
            };
            localStorage.setItem('user', JSON.stringify(userData));

            connectSocket();

            // 3. Redirigimos al DASHBOARD en lugar del Desktop
            navigate('/dashboard'); // 👈 CAMBIO AQUÍ (Antes era '/desktop')
        }
        
      // Si hay un error (ej: 401, 404), el hook useFetch
      // capturará el 'msg' del backend y lo mostrará como un toast de error.

    } catch (error) {
      // El error ya es manejado y mostrado por el hook useFetch
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // --- PANTALLA DE BLOQUEO (Lock Screen) ---
  // Si step es 1, mostramos solo la hora y fecha
  if (step === 1) {
    const time = new Date();
    return (
      <div 
        onClick={() => setStep(2)} // Clic en cualquier lado para entrar
        className="h-screen w-full flex flex-col items-center justify-start pt-32 cursor-pointer select-none text-white relative overflow-hidden"
      >
        {/* Fondo */}
        <div 
          className="absolute inset-0 -z-10 bg-cover bg-center transition-transform duration-700 hover:scale-105"
          style={{ backgroundImage: `url(${dragonBg})` }}
        />
        <div className="absolute inset-0 -z-10 bg-black/20" /> {/* Filtro oscuro leve */}

        {/* Hora y Fecha Gigante */}
        <h1 className="text-9xl font-thin drop-shadow-lg">
          {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </h1>
        <p className="text-2xl mt-4 font-medium drop-shadow-md">
          {time.toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
        
        <p className="absolute bottom-10 animate-bounce text-sm text-gray-300">
          Haz clic o presiona una tecla para desbloquear
        </p>
      </div>
    );
  }

  

  // --- PANTALLA DE LOGIN (Formulario estilo Windows) ---
  return (
    <div className="h-screen w-full flex items-center justify-center relative overflow-hidden">
        
      {/* Fondo borroso (Efecto Windows al entrar) */}
      <div 
        className="absolute inset-0 -z-10 bg-cover bg-center blur-sm scale-110"
        style={{ backgroundImage: `url(${dragonBg})` }}
      />
      <div className="absolute inset-0 -z-10 bg-black/40" />

      {/* Contenedor Central */}
      <div className="flex flex-col items-center w-full max-w-sm p-6 animate-fade-in-up">
        
        {/* Avatar Circular */}
        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white/20 shadow-2xl mb-6">
            <img src={logoMidesk} alt="User Avatar" className="w-full h-full object-cover" />
        </div>

        {/* Nombre de "Usuario" (Visual) */}
        <h2 className="text-2xl text-white font-semibold mb-6 drop-shadow-md">
          Estudiante
        </h2>

        {/* Formulario */}
        <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-4">
          
          {/* Input Email (Simula seleccionar usuario) */}
          <div className="relative">
             <input
                type="email"
                {...register('email', { required: true })}
                placeholder="Correo Institucional"
                // Estilo "Input transparente" de Windows
                className="w-full bg-black/50 text-white placeholder-gray-400 border border-transparent focus:border-white/50 focus:bg-black/70 rounded-sm px-3 py-2 outline-none transition-all text-center"
             />
             {errors.email && <span className="text-red-400 text-xs block text-center mt-1">Ingresa tu correo</span>}
          </div>

          {/* Input Password */}
          <div className="relative flex items-center">
             <input
                type="password"
                {...register('password', { required: true })}
                placeholder="Contraseña"
                className="w-full bg-black/50 text-white placeholder-gray-400 border border-transparent focus:border-white/50 focus:bg-black/70 rounded-sm px-3 py-2 outline-none transition-all text-center"
             />
             {/* Botón Flecha (Submit) estilo Windows */}
             <button 
                type="submit" 
                disabled={loading}
                className="absolute right-1 p-1 bg-white/20 hover:bg-white/40 rounded-sm text-white transition-colors"
             >
                {loading ? '...' : '➜'}
             </button>
          </div>
        </form>

        <div className="w-full mt-4">
          <button
            type="button" // Importante: type="button" para que no envíe el formulario vacío
            onClick={handleGoogleLogin}
            className="w-full bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium py-2 px-4 rounded-sm flex items-center justify-center gap-2 transition-all shadow-lg"
          >
            {/* Puedes usar un SVG de Google o un icono simple */}
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 16.25 5 12c0-4.1 3.2-7.27 7.16-7.27c3.2 0 5.22 1.83 5.71 2.3l1.87-1.87C17.91 3.4 15.01 2.22 12.16 2.22C6.71 2.22 2.22 6.71 2.22 12.16c0 5.45 4.49 9.94 9.94 9.94c5.75 0 9.22-3.83 9.22-9.06c0-.62-.05-1.13-.13-1.94z"
              />
            </svg>
            Iniciar con Google
          </button>
        </div>

        {/* Links de ayuda */}
        <div className="mt-6 flex flex-col items-center space-y-2 text-sm">
            <Link to="/forgot" className="text-gray-300 hover:text-white transition-colors">
                ¿Olvidaste tu contraseña?
            </Link>
            <Link to="/register" className="text-gray-300 hover:text-white transition-colors font-medium">
                Crear una cuenta nueva
            </Link>
        </div>

      </div>

      {/* Barra de herramientas inferior derecha (Red, Apagar, Accesibilidad) */}
      <div className="absolute bottom-8 right-8 flex space-x-6 text-white/80">
        <Wifi className="w-6 h-6 hover:text-white cursor-pointer" />
        <RefreshCcw className="w-6 h-6 hover:text-white cursor-pointer" title="Reiniciar sistema (F5)" onClick={() => window.location.reload()} />
        <Power className="w-6 h-6 hover:text-white cursor-pointer" title="Apagar" onClick={() => setStep(1)} />
      </div>

    </div>
  );
}

export default Login;