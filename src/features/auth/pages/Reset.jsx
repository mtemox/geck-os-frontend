// src/features/auth/pages/Reset.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AuthLayout from '../components/Auth';
import { useFetch } from '../../../core/api/useFetch';
import { useForm } from "react-hook-form";
import { sileo } from 'sileo';

function Reset() {
  const { token } = useParams();
  const navigate = useNavigate();
  const fetchDataBackend = useFetch();
  const [tokenValido, setTokenValido] = useState(false);
  const [loading, setLoading] = useState(true); 

  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const password = watch('password'); 

  // 1. VALIDAR EL TOKEN
  useEffect(() => {
    const verificarToken = async () => {
      try {
        const backendUrl = import.meta.env.VITE_BACKEND_URL;
        const response = await fetchDataBackend(
          `${backendUrl}/auth/forgot-password/${token}`, 
          null, 
          "GET"
        );

        if (response?.msg === "Token confirmado, ya puedes crear tu nuevo password") {
          setTokenValido(true);
        } else {
            setTokenValido(false);
            sileo.error({title: "El token no es válido o ha expirado."});
            setTimeout(() => navigate('/login'), 3000);
        }
      } catch (error) {
        setTokenValido(false);
      } finally {
        setLoading(false);
      }
    };

    verificarToken();
  }, [token]); 

  // 2. ENVIAR LA NUEVA CONTRASEÑA
  const onSubmit = async (data) => {
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL;
      
      const response = await fetchDataBackend(
        `${backendUrl}/auth/reset-password/${token}`,
        { 
          password: data.password, 
          confirmpassword: data.confirmPassword 
        },
        "POST"
      );
      
      if (response) {
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }

    } catch (error) {
      console.error(error);
    }
  };

  // --- CLASE COMÚN INPUTS ---
  const inputClass = "w-full px-3 py-2 mt-1 text-white bg-gray-900 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent placeholder-gray-500";

  // --- RENDERIZADO DE CARGA ---
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="animate-pulse text-red-600 font-bold text-xl">Verificando enlace de seguridad...</div>
    </div>
  );

  // --- RENDERIZADO DE ERROR ---
  if (!tokenValido) return (
    <AuthLayout title="Error de Seguridad">
      <div className="text-center">
        <p className="text-red-500 font-bold mb-4">El enlace no es válido o ha expirado.</p>
        <button 
          onClick={() => navigate('/login')}
          className="text-gray-300 hover:text-white underline decoration-red-600"
        >
          Volver al inicio de sesión
        </button>
      </div>
    </AuthLayout>
  );

  return (
    <AuthLayout title="Restablecer Contraseña">
      <p className="text-sm text-gray-300 text-center mb-4">
        Establece una nueva contraseña segura para tu escritorio virtual.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        
        {/* NUEVO PASSWORD */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-300">
            Nueva Contraseña
          </label>
          <input
            id="password"
            type="password"
            {...register('password', { 
              required: 'La contraseña es requerida',
              minLength: { value: 6, message: 'Mínimo 6 caracteres' }
            })}
            className={inputClass}
            placeholder="Nueva contraseña"
          />
          {errors.password && <p className="mt-1 text-xs text-red-500 font-bold">{errors.password.message}</p>}
        </div>

        {/* CONFIRMAR PASSWORD */}
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300">
            Confirmar Contraseña
          </label>
          <input
            id="confirmPassword"
            type="password"
            {...register('confirmPassword', { 
              required: 'Confirma tu contraseña',
              validate: value => value === password || 'Las contraseñas no coinciden'
            })}
            className={inputClass}
            placeholder="Repite la contraseña"
          />
          {errors.confirmPassword && <p className="mt-1 text-xs text-red-500 font-bold">{errors.confirmPassword.message}</p>}
        </div>

        {/* BOTÓN */}
        <div>
          <button
            type="submit"
            className="w-full py-2 px-4 font-bold text-white bg-red-700 rounded-md hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-black transition-all shadow-[0_0_10px_rgba(185,28,28,0.5)]"
          >
            Guardar Nueva Contraseña
          </button>
        </div>
      </form>
    </AuthLayout>
  );
}

export default Reset;