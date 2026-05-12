// src/features/auth/pages/Reset.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AuthLayout from '../components/Auth';
import { useFetch } from '../../../core/api/useFetch';
import { useForm } from "react-hook-form";
import { sileo } from 'sileo';
import { Eye, EyeOff } from 'lucide-react';

function Reset() {
  const { token } = useParams();
  const navigate = useNavigate();
  const fetchDataBackend = useFetch();
  const [tokenValido, setTokenValido] = useState(false);
  const [loading, setLoading] = useState(true);

  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const password = watch('password');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
          sileo.error({ title: "El token no es válido o ha expirado." });
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
    <AuthLayout title="Nueva contraseña">

      <p className="text-xs text-white/50 text-center -mt-2 mb-2">
        Establece una contraseña segura para tu escritorio virtual.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

        <div>
          <label className="block text-xs font-medium text-white/60 mb-1.5 ml-1">Nueva contraseña</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              {...register('password', {
                required: 'Requerido',
                minLength: { value: 6, message: 'Mínimo 6 caracteres' }
              })}
              className="w-full bg-white/10 text-white placeholder-white/30 border border-white/15 
                       focus:border-sky-400/50 focus:bg-white/15 rounded-xl px-4 pr-11 py-2.5 text-sm 
                       outline-none transition-all backdrop-blur-sm"
              placeholder="Nueva contraseña"
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors">
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          {errors.password && <p className="mt-1 text-xs text-amber-400/90 ml-1">{errors.password.message}</p>}
        </div>

        <div>
          <label className="block text-xs font-medium text-white/60 mb-1.5 ml-1">Confirmar contraseña</label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              {...register('confirmPassword', {
                required: 'Requerido',
                validate: value => value === password || 'No coinciden'
              })}
              className="w-full bg-white/10 text-white placeholder-white/30 border border-white/15 
                       focus:border-sky-400/50 focus:bg-white/15 rounded-xl px-4 pr-11 py-2.5 text-sm 
                       outline-none transition-all backdrop-blur-sm"
              placeholder="Repite la contraseña"
            />
            <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors">
              {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          {errors.confirmPassword && <p className="mt-1 text-xs text-amber-400/90 ml-1">{errors.confirmPassword.message}</p>}
        </div>

        <button
          type="submit"
          className="w-full py-2.5 bg-sky-500/80 hover:bg-sky-400/90 text-white font-medium rounded-xl 
                   transition-all shadow-lg shadow-sky-500/20 text-sm"
        >
          Guardar contraseña
        </button>
      </form>
    </AuthLayout>
  );
}

export default Reset;