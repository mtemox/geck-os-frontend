// src/features/auth/pages/Register.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
// import axios from 'axios'; // (Descomentar para la API real)
import AuthLayout from '../components/Auth'; // La plantilla de estilo
import { useForm } from "react-hook-form";
import { useFetch } from '../../../core/api/useFetch';

const BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000/api';

function Register() {

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const fetchDataBackend = useFetch();

  // --- CONFIGURACIÓN DE REACT-HOOK-FORM ---
  const { register, handleSubmit, formState: { errors }, watch } = useForm();

  // Usamos watch para poder comparar la contraseña de confirmación
  const password = watch('password');

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL;
      const { nombre, email, password } = data; // 'data' viene de react-hook-form
      
      const response = await fetchDataBackend(
        `${backendUrl}/auth/register`,
        { nombre, email, password },
        "POST"
      );

      if (response) {
        // El hook useFetch ya muestra el toast de éxito con el 'msg' del backend
        setTimeout(() => {
          navigate('/login');
        }, 2000); // Esperamos 2 seg antes de redirigir
      }
    } catch (error) {
      console.error('Error en registro:', error);
      // El hook useFetch ya muestra el toast de error
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    window.location.href = `${backendUrl}/auth/google`;
  };

const inputClass = "w-full px-3 py-2 mt-1 text-white bg-gray-900 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent placeholder-gray-500";

  return (
    <AuthLayout title="Crear Cuenta">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        
        {/* NOMBRE */}
        <div>
          <label htmlFor="nombre" className="block text-sm font-medium text-gray-300">Nombre Completo</label>
          <input
            id="nombre"
            type="text"
            {...register('nombre', { required: 'El nombre es requerido' })}
            className={inputClass}
            placeholder="Ingresa tu nombre completo"
          />
          {errors.nombre && <p className="mt-1 text-xs text-red-500 font-bold">{errors.nombre.message}</p>}
        </div>

        {/* EMAIL */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-300">Correo Electrónico</label>
          <input
            id="email"
            type="email"
            {...register('email', { 
              required: 'El email es requerido',
              pattern: { value: /\S+@\S+\.\S+/, message: 'Formato inválido' }
            })}
            className={inputClass}
            placeholder="tu-correo@esfot.com"
          />
          {errors.email && <p className="mt-1 text-xs text-red-500 font-bold">{errors.email.message}</p>}
        </div>

        {/* PASSWORD */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-300">Contraseña</label>
          <input
            id="password"
            type="password"
            {...register('password', { 
              required: 'Requerido',
              minLength: { value: 6, message: 'Mínimo 6 caracteres' }
            })}
            className={inputClass}
            placeholder="Mínimo 6 caracteres"
          />
          {errors.password && <p className="mt-1 text-xs text-red-500 font-bold">{errors.password.message}</p>}
        </div>

        {/* CONFIRM PASSWORD */}
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300">Confirmar Contraseña</label>
          <input
            id="confirmPassword"
            type="password"
            {...register('confirmPassword', { 
              required: 'Confirma la contraseña',
              validate: value => value === password || 'Las contraseñas no coinciden'
            })}
            className={inputClass}
            placeholder="Repite tu contraseña"
          />
          {errors.confirmPassword && <p className="mt-1 text-xs text-red-500 font-bold">{errors.confirmPassword.message}</p>}
        </div>

        {/* BOTÓN */}
        <div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 font-bold text-white bg-red-700 rounded-md hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-black transition-all shadow-[0_0_10px_rgba(185,28,28,0.5)]"
          >
            {loading ? 'Registrando...' : 'Registrarse'}
          </button>
        </div>

        <div className="mt-4">
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full py-2 px-4 font-bold text-white bg-gray-800 border border-gray-600 rounded-md hover:bg-gray-700 transition-all flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 16.25 5 12c0-4.1 3.2-7.27 7.16-7.27c3.2 0 5.22 1.83 5.71 2.3l1.87-1.87C17.91 3.4 15.01 2.22 12.16 2.22C6.71 2.22 2.22 6.71 2.22 12.16c0 5.45 4.49 9.94 9.94 9.94c5.75 0 9.22-3.83 9.22-9.06c0-.62-.05-1.13-.13-1.94z"
              />
            </svg>
            Registrarse con Google
          </button>
        </div>

      </form>

      <p className="text-sm text-center text-gray-400">
        ¿Ya tienes una cuenta? {' '}
        <Link to="/login" className="font-medium text-red-500 hover:text-red-400 underline">
          Inicia sesión
        </Link>
      </p>
    </AuthLayout>
  );
}

export default Register;