import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthLayout from '../components/Auth'; 
import { useFetch } from '../../../core/api/useFetch';
import { useForm } from "react-hook-form";

function Forgot() {
  const [loading, setLoading] = useState(false);
  const fetchDataBackend = useFetch();
  
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL;
      
      // Consumimos el endpoint que ya tienes en tu backend
      // router.post('/recuperarPassword', recuperarPassword)
      await fetchDataBackend(
        `${backendUrl}/recuperarPassword`,
        data, // data contiene { email }
        "POST"
      );
      
      // El hook useFetch ya muestra el Toast de éxito o error.
      // No necesitamos redirigir inmediatamente, el usuario debe revisar su correo.

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Recuperar Acceso">
      
      <div className="text-sm text-gray-300 text-center mb-4">
        Ingresa tu correo institucional y te enviaremos las instrucciones para restablecer tu contraseña.
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        
        {/* --- CAMPO EMAIL --- */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-300">
            Correo Electrónico
          </label>
          <input
            id="email"
            type="email"
            {...register('email', { 
              required: 'El email es requerido',
              pattern: {
                value: /\S+@\S+\.\S+/,
                message: 'Formato de email inválido'
              }
            })}
            // ESTILO ROJO/OSCURO
            className="w-full px-3 py-2 mt-1 text-white bg-gray-900 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent placeholder-gray-500"
            placeholder="tu-correo@esfot.com"
          />
          {errors.email && <p className="mt-1 text-xs text-red-500 font-bold">{errors.email.message}</p>}
        </div>
        
        {/* --- BOTÓN ENVIAR --- */}
        <div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 font-bold text-white bg-red-700 rounded-md hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-black transition-all shadow-[0_0_10px_rgba(185,28,28,0.5)]"
          >
            {loading ? 'Enviando...' : 'Enviar Instrucciones'}
          </button>
        </div>
      </form>

      <p className="text-sm text-center text-gray-400">
        ¿Ya la recordaste?{' '}
        <Link to="/login" className="font-medium text-red-500 hover:text-red-400 underline">
          Inicia sesión
        </Link>
      </p>
    </AuthLayout>
  );
}

export default Forgot;