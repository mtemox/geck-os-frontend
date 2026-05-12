import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/Auth';
import { useForm } from "react-hook-form";
import { useFetch } from '../../../core/api/useFetch';
import { Eye, EyeOff } from 'lucide-react'; // <-- IMPORTAR ÍCONOS

function Register() {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // <-- ESTADO VISIBILIDAD
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // <-- ESTADO VISIBILIDAD

  const navigate = useNavigate();
  const fetchDataBackend = useFetch();

  const { register, handleSubmit, formState: { errors }, watch } = useForm();
  const password = watch('password');

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL;
      const { nombre, email, password } = data;

      const response = await fetchDataBackend(
        `${backendUrl}/auth/register`,
        { nombre, email, password },
        "POST"
      );

      if (response) {
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } catch (error) {
      console.error('Error en registro:', error);
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
    <AuthLayout title="Crear cuenta">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">

        {/* Nombre */}
        <div>
          <label className="block text-xs font-medium text-white/70 mb-1.5 ml-1">Nombre completo</label>
          <input
            type="text"
            {...register('nombre', {
              required: 'Requerido',
              pattern: { value: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, message: 'Solo letras' }
            })}
            className="w-full bg-white/10 text-white placeholder-white/30 border border-white/15 
                     focus:border-sky-400/50 focus:bg-white/15 rounded-xl px-4 py-2.5 text-sm 
                     outline-none transition-all backdrop-blur-sm"
            placeholder="Tu nombre completo"
          />
          {errors.nombre && <p className="mt-1 text-xs text-amber-400/90 ml-1">{errors.nombre.message}</p>}
        </div>

        {/* Email */}
        <div>
          <label className="block text-xs font-medium text-white/70 mb-1.5 ml-1">Correo electrónico</label>
          <input
            type="email"
            {...register('email', {
              required: 'Requerido',
              pattern: { value: /\S+@\S+\.\S+/, message: 'Formato inválido' }
            })}
            className="w-full bg-white/10 text-white placeholder-white/30 border border-white/15 
                     focus:border-sky-400/50 focus:bg-white/15 rounded-xl px-4 py-2.5 text-sm 
                     outline-none transition-all backdrop-blur-sm"
            placeholder="tu@correo.com"
          />
          {errors.email && <p className="mt-1 text-xs text-amber-400/90 ml-1">{errors.email.message}</p>}
        </div>

        {/* Password */}
        <div>
          <label className="block text-xs font-medium text-white/70 mb-1.5 ml-1">Contraseña</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              {...register('password', { required: 'Requerido', minLength: { value: 6, message: 'Mínimo 6 caracteres' } })}
              className="w-full bg-white/10 text-white placeholder-white/30 border border-white/15 
                       focus:border-sky-400/50 focus:bg-white/15 rounded-xl px-4 pr-11 py-2.5 text-sm 
                       outline-none transition-all backdrop-blur-sm"
              placeholder="Mínimo 6 caracteres"
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors">
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          {errors.password && <p className="mt-1 text-xs text-amber-400/90 ml-1">{errors.password.message}</p>}
        </div>

        {/* Confirm Password */}
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
              placeholder="Repite tu contraseña"
            />
            <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors">
              {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          {errors.confirmPassword && <p className="mt-1 text-xs text-amber-400/90 ml-1">{errors.confirmPassword.message}</p>}
        </div>

        {/* Botón registrar */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 bg-sky-500/60 hover:bg-sky-400/60 text-white font-medium rounded-xl 
                   transition-all shadow-lg shadow-sky-500/10 hover:shadow-sky-400/10 text-sm mt-1
                   disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Creando cuenta…' : 'Registrarse'}
        </button>

        {/* Google */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          className="w-full py-2.5 bg-white/8 hover:bg-white/12 border border-white/15 text-white/70 
                   hover:text-white rounded-xl flex items-center justify-center gap-2.5 transition-all text-sm"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="currentColor" d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 16.25 5 12c0-4.1 3.2-7.27 7.16-7.27c3.2 0 5.22 1.83 5.71 2.3l1.87-1.87C17.91 3.4 15.01 2.22 12.16 2.22C6.71 2.22 2.22 6.71 2.22 12.16c0 5.45 4.49 9.94 9.94 9.94c5.75 0 9.22-3.83 9.22-9.06c0-.62-.05-1.13-.13-1.94z" />
          </svg>
          Registrarse con Google
        </button>
      </form>

      <p className="text-xs text-center text-white/40">
        ¿Ya tienes cuenta?{' '}
        <Link to="/login" className="text-orange-400/80 hover:text-orange-300 transition-colors">
          Inicia sesión
        </Link>
      </p>
    </AuthLayout>
  );
}

export default Register;