import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useFetch } from '../../../core/api/useFetch';
import { Loader } from 'lucide-react';

const GoogleSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const fetchDataBackend = useFetch();

  useEffect(() => {
    const processGoogleLogin = async () => {
      // 1. Capturamos el token de la URL
      const token = searchParams.get("token");

      if (!token) {
        console.error("No se recibió token de Google");
        navigate("/login");
        return;
      }

      // 2. Guardamos el token temporalmente
      localStorage.setItem("token", token);

      try {
        // 3. Pedimos los datos del usuario al Backend
        // (Porque la URL solo traía el token, nos faltan el nombre y ID para el localStorage)
        const backendUrl = import.meta.env.VITE_BACKEND_URL;
        
        const userData = await fetchDataBackend(
          `${backendUrl}/estudiante/perfil`,
          null,
          "GET",
          { Authorization: `Bearer ${token}` }
        );

        if (userData) {
          // 4. Guardamos los datos del usuario igual que en el Login normal
          const userStorage = {
            nombre: userData.nombre,
            rol: userData.rol || 'estudiante',
            id: userData._id,
            email: userData.email
          };
          localStorage.setItem("user", JSON.stringify(userStorage));

          // 5. ¡Éxito! Vamos al Dashboard
          navigate("/dashboard");
        } else {
          // Si falló obtener el perfil
          navigate("/login");
        }

      } catch (error) {
        console.error("Error al obtener perfil post-google:", error);
        navigate("/login");
      }
    };

    processGoogleLogin();
  }, [searchParams, navigate, fetchDataBackend]);

  // Pantalla de carga mientras procesamos
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-black text-white">
      <Loader size={48} className="animate-spin text-purple-500 mb-4" />
      <h2 className="text-xl font-light">Autenticando con Google...</h2>
      <p className="text-sm text-gray-400 mt-2">Estamos preparando tu escritorio virtual</p>
    </div>
  );
};

export default GoogleSuccess;