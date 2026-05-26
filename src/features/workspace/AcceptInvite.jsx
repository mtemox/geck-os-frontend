// src/features/workspace/AcceptInvite.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFetch } from '../../core/api/useFetch';
import { Loader, CheckCircle, XCircle } from 'lucide-react';

const AcceptInvite = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const fetchDataBackend = useFetch();
    const [status, setStatus] = useState('loading');
    const [message, setMessage] = useState('');

    useEffect(() => {
        const accept = async () => {
            const backendUrl = import.meta.env.VITE_BACKEND_URL;

            try {
                // 👇 Sin verificar sesión, llamada directa como confirmación de email
                const res = await fetchDataBackend(
                    `${backendUrl}/workspaces/accept-invite/${token}`,
                    null,
                    "GET"
                    // Sin header de Authorization
                );

                if (res?.ok) {
                    setStatus('success');
                    setMessage(res.msg);
                    
                    // Si ya tiene sesión, redirigir al workspace
                    const authToken = localStorage.getItem('token');
                    setTimeout(() => {
                        if (authToken) {
                            navigate(`/desktop?workspace=${res.workspace._id}`);
                        } else {
                            navigate('/login');
                        }
                    }, 2000);
                } else {
                    setStatus('error');
                    setMessage(res?.msg || 'Error al aceptar la invitación');
                }
            } catch (e) {
                setStatus('error');
                setMessage('El enlace no es válido o ha expirado.');
            }
        };

        accept();
    }, [token]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-black text-white">
            <div className="bg-gray-900 border border-gray-700 rounded-2xl p-10 max-w-md w-full text-center shadow-2xl">
                {status === 'loading' && (
                    <>
                        <Loader size={48} className="animate-spin mx-auto mb-4 text-indigo-500" />
                        <h2 className="text-xl font-semibold">Procesando invitación...</h2>
                    </>
                )}
                {status === 'success' && (
                    <>
                        <CheckCircle size={48} className="mx-auto mb-4 text-green-500" />
                        <h2 className="text-xl font-bold text-green-400 mb-2">¡Invitación aceptada!</h2>
                        <p className="text-gray-300">{message}</p>
                        <p className="text-gray-500 text-sm mt-4">
                            {localStorage.getItem('token') 
                                ? 'Redirigiendo al workspace...' 
                                : 'Redirigiendo al login...'}
                        </p>
                    </>
                )}
                {status === 'error' && (
                    <>
                        <XCircle size={48} className="mx-auto mb-4 text-red-500" />
                        <h2 className="text-xl font-bold text-red-400 mb-2">Error</h2>
                        <p className="text-gray-300">{message}</p>
                        <button
                            onClick={() => navigate('/login')}
                            className="mt-6 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors font-medium"
                        >
                            Ir al Login
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default AcceptInvite;