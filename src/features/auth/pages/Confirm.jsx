// src/features/auth/pages/Confirm.jsx
import React, { useEffect } from 'react';
import logoMidesk from '../../../assets/logos/midesk.jpg'; // Asumo que esta imagen se mantiene
import { Link, useParams } from 'react-router-dom';
import { useFetch } from '../../../core/api/useFetch';
import dragonBg from '../../../assets/auth/fondo4.jpg';
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
        <div className="flex flex-col items-center justify-center h-screen relative overflow-hidden">

            {/* Fondo */}
            <div
                className="absolute inset-0 -z-10 bg-cover bg-center"
                style={{ backgroundImage: `url(${dragonBg})` }}
            />
            <div className="absolute inset-0 -z-10 bg-gradient-to-b from-sky-950/30 to-slate-950/70" />

            {/* Card */}
            <div className="flex flex-col items-center text-center max-w-sm px-10 py-12 
                    bg-white/10 backdrop-blur-2xl rounded-2xl border border-white/20 shadow-2xl
                    animate-scale-in">

                {/* Logo */}
                <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-white/20 shadow-xl mb-6 ring-4 ring-orange-400/20">
                    <img src={logoMidesk} alt="MiDesk" className="w-full h-full object-cover" />
                </div>

                {/* Icono de check animado */}
                <div className="w-12 h-12 rounded-full bg-orange-500/20 border border-orange-400/30 flex items-center justify-center mb-5">
                    <svg className="w-6 h-6 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                </div>

                <h2 className="text-2xl font-light text-white mb-2">¡Muchas gracias!</h2>
                <p className="text-sm text-white/50 leading-relaxed mb-1">
                    Estamos verificando tu cuenta.
                </p>
                <p className="text-sm text-white/50 leading-relaxed mb-8">
                    Si el enlace es válido, ya puedes iniciar sesión.
                </p>

                <Link
                    to="/login"
                    className="w-full py-2.5 bg-sky-500/70 hover:bg-sky-400/80 text-white font-medium rounded-xl 
                   transition-all shadow-lg shadow-sky-500/10 text-sm text-center block"
                >
                    Ir a iniciar sesión
                </Link>
            </div>
        </div>
    );
}

export default Confirm;