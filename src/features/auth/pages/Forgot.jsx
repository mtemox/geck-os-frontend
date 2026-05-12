// src/features/auth/pages/Forgot.jsx
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
        `${backendUrl}/auth/forgot-password`,
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
    <AuthLayout title="Recuperar acceso">

      <p className="text-xs text-white/50 text-center -mt-2 mb-2">
        Te enviaremos instrucciones a tu correo para restablecer tu contraseña.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

        <div>
          <label className="block text-xs font-medium text-white/60 mb-1.5 ml-1">Correo electrónico</label>
          <input
            type="email"
            {...register('email', {
              required: 'El email es requerido',
              pattern: { value: /\S+@\S+\.\S+/, message: 'Formato inválido' }
            })}
            className="w-full bg-white/10 text-white placeholder-white/30 border border-white/15 
                     focus:border-sky-400/50 focus:bg-white/15 rounded-xl px-4 py-2.5 text-sm 
                     outline-none transition-all backdrop-blur-sm"
            placeholder="tu@correo.com"
          />
          {errors.email && <p className="mt-1 text-xs text-amber-400/90 ml-1">{errors.email.message}</p>}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 bg-sky-500/80 hover:bg-sky-400/90 text-white font-medium rounded-xl 
                   transition-all shadow-lg shadow-sky-500/20 text-sm
                   disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Enviando…' : 'Enviar instrucciones'}
        </button>
      </form>

      <p className="text-xs text-center text-white/40">
        ¿Ya la recordaste?{' '}
        <Link to="/login" className="text-sky-400/80 hover:text-sky-300 transition-colors">
          Inicia sesión
        </Link>
      </p>
    </AuthLayout>
  );
}

export default Forgot;