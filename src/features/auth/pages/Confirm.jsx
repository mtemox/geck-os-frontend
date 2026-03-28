// src/features/auth/pages/Confirm.jsx
import React, { useEffect } from 'react';
import logoMidesk from '../../../assets/logos/midesk.jpg'; // Asumo que esta imagen se mantiene
import { Link, useParams } from 'react-router-dom';
import { useFetch } from '../../../core/api/useFetch';
// No necesitas ToastContainer aquí, ya está en main.jsx

export const Confirm = () => {

    const fetchDataBackend = useFetch();
    const { token } = useParams();
    
    // --- LÓGICA (Esta parte se mantiene igual) ---
    // Se ejecuta al cargar la página para validar el token
    useEffect(() => {
        
        const verifyToken = async () => {
            const url = `${import.meta.env.VITE_BACKEND_URL}/auth/confirm/${token}`;
            
            // El hook se encarga de mostrar los toasts
            // de carga, éxito o error.
            await fetchDataBackend(url, null, 'GET');
        }

        if (token) {
            verifyToken();
        }

    }, [token, fetchDataBackend]); // Dependencias del hook

    // --- INTERFAZ CON ESTILO (ROJO, BLANCO, NEGRO) ---
    return (
        // Fondo negro
        <div className="flex flex-col items-center justify-center h-screen bg-black">

            {/* Imagen con borde rojo */}
            <img 
                className="object-cover h-80 w-80 rounded-full border-4 border-solid border-red-600" // <-- CAMBIADO
                src={logoMidesk} 
                alt="Logo de Confirmación"
            />

            <div className="flex flex-col items-center justify-center text-center max-w-md px-4">
                
                {/* Textos blancos */}
                <p className="text-3xl md:text-4xl lg:text-5xl text-white mt-12">
                    ¡Muchas Gracias!
                </p>
                <p className="md:text-lg lg:text-xl text-gray-300 mt-8"> {/* <-- CAMBIADO (Gris claro) */}
                    Estamos procesando tu confirmación.
                </p>
                <p className="md:text-lg lg:text-xl text-gray-300 mt-2"> {/* <-- CAMBIADO (Gris claro) */}
                    Si el token es válido, podrás iniciar sesión.
                </p>
                
                {/* Botón rojo */}
                <Link 
                    to="/login" 
                    // --- Clases del botón cambiadas a rojo ---
                    className="w-full py-2 px-4 mt-8 font-semibold text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-black"
                >
                    Ir a Iniciar Sesión
                </Link>
            </div>
        </div>
    );
}

export default Confirm;