// src/components/apps/ProfileApp.jsx
import React, { useEffect, useState } from 'react';
import { useForm } from "react-hook-form";
import { useFetch } from '../../core/api/useFetch';
import { User, Lock, Save } from 'lucide-react';
import { sileo } from 'sileo';

const ProfileApp = () => {
  const [activeTab, setActiveTab] = useState('info'); // 'info' o 'security'
  const fetchDataBackend = useFetch();
  const [userData, setUserData] = useState(null);

  // Forms
  const { register: registerInfo, handleSubmit: submitInfo, setValue } = useForm();
  const { register: registerPass, handleSubmit: submitPass, reset: resetPass } = useForm();

  // Cargar datos al abrir
  useEffect(() => {
    const loadProfile = async () => {
      const token = localStorage.getItem('token');
      const backendUrl = import.meta.env.VITE_BACKEND_URL;
      
      const data = await fetchDataBackend(
        `${backendUrl}/estudiante/perfil`, 
        null, 
        "GET", 
        { Authorization: `Bearer ${token}` }
      );
      
      if (data) {
        setUserData(data);
        // Pre-llenar el formulario
        setValue('nombre', data.nombre);
        setValue('apellido', data.apellido);
        setValue('email', data.email);
        setValue('celular', data.celular);
        setValue('direccion', data.direccion);
      }
    };
    loadProfile();
  }, []);

  // Actualizar Información
  const onUpdateInfo = async (formData) => {
    const token = localStorage.getItem('token');
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    
    await fetchDataBackend(
      `${backendUrl}/estudiante/perfil/${userData._id}`,
      formData,
      "PUT",
      { Authorization: `Bearer ${token}` }
    );
    // Actualizamos el nombre en localStorage para el Menú Inicio
    const storedUser = JSON.parse(localStorage.getItem('user'));
    localStorage.setItem('user', JSON.stringify({ ...storedUser, nombre: formData.nombre }));
  };

  // Actualizar Contraseña
  const onUpdatePass = async (formData) => {
    if (formData.passwordnuevo !== formData.confirmPassword) {
      sileo.error({title: "Las contraseñas nuevas no coinciden"});
      return;
    }

    const token = localStorage.getItem('token');
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    const response = await fetchDataBackend(
      `${backendUrl}/actualizarPassword/${userData._id}`,
      {
        passwordactual: formData.passwordactual,
        passwordnuevo: formData.passwordnuevo
      },
      "PUT",
      { Authorization: `Bearer ${token}` }
    );

    if (response) resetPass();
  };

  if (!userData) return <div className="text-white p-4">Cargando perfil...</div>;

  return (
    <div className="h-full flex flex-col bg-gray-900 text-white font-sans">
      
      {/* Sidebar de Navegación */}
      <div className="flex border-b border-gray-700">
        <button 
          onClick={() => setActiveTab('info')}
          className={`flex-1 p-3 flex items-center justify-center gap-2 transition-colors ${activeTab === 'info' ? 'bg-purple-600' : 'hover:bg-gray-800'}`}
        >
          <User size={18} /> Mis Datos
        </button>
        <button 
          onClick={() => setActiveTab('security')}
          className={`flex-1 p-3 flex items-center justify-center gap-2 transition-colors ${activeTab === 'security' ? 'bg-purple-600' : 'hover:bg-gray-800'}`}
        >
          <Lock size={18} /> Seguridad
        </button>
      </div>

      {/* Contenido */}
      <div className="flex-1 p-6 overflow-y-auto">
        
        {/* --- FORMULARIO DE DATOS --- */}
        {activeTab === 'info' && (
          <form onSubmit={submitInfo(onUpdateInfo)} className="space-y-4 max-w-md mx-auto">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs text-gray-400 mb-1">Nombre</label>
                    <input {...registerInfo('nombre')} className="w-full bg-gray-800 border border-gray-700 rounded p-2 focus:border-purple-500 outline-none" />
                </div>
                <div>
                    <label className="block text-xs text-gray-400 mb-1">Apellido</label>
                    <input {...registerInfo('apellido')} className="w-full bg-gray-800 border border-gray-700 rounded p-2 focus:border-purple-500 outline-none" />
                </div>
            </div>
            <div>
                <label className="block text-xs text-gray-400 mb-1">Email (No editable)</label>
                <input {...registerInfo('email')} disabled className="w-full bg-gray-800/50 border border-gray-700 rounded p-2 text-gray-500 cursor-not-allowed" />
            </div>
            <div>
                <label className="block text-xs text-gray-400 mb-1">Celular</label>
                <input {...registerInfo('celular')} className="w-full bg-gray-800 border border-gray-700 rounded p-2 focus:border-purple-500 outline-none" />
            </div>
            <div>
                <label className="block text-xs text-gray-400 mb-1">Dirección</label>
                <input {...registerInfo('direccion')} className="w-full bg-gray-800 border border-gray-700 rounded p-2 focus:border-purple-500 outline-none" />
            </div>
            
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded flex items-center justify-center gap-2 mt-4">
                <Save size={18} /> Guardar Cambios
            </button>
          </form>
        )}

        {/* --- FORMULARIO DE CONTRASEÑA --- */}
        {activeTab === 'security' && (
          <form onSubmit={submitPass(onUpdatePass)} className="space-y-4 max-w-md mx-auto">
             <div className="p-3 bg-yellow-900/30 border border-yellow-700/50 rounded text-sm text-yellow-200 mb-4">
                Asegúrate de usar una contraseña segura.
             </div>

             <div>
                <label className="block text-xs text-gray-400 mb-1">Contraseña Actual</label>
                <input type="password" {...registerPass('passwordactual', {required: true})} className="w-full bg-gray-800 border border-gray-700 rounded p-2 focus:border-purple-500 outline-none" />
             </div>
             
             <hr className="border-gray-700 my-4"/>

             <div>
                <label className="block text-xs text-gray-400 mb-1">Nueva Contraseña</label>
                <input type="password" {...registerPass('passwordnuevo', {required: true, minLength: 6})} className="w-full bg-gray-800 border border-gray-700 rounded p-2 focus:border-purple-500 outline-none" />
             </div>
             <div>
                <label className="block text-xs text-gray-400 mb-1">Confirmar Nueva Contraseña</label>
                <input type="password" {...registerPass('confirmPassword', {required: true})} className="w-full bg-gray-800 border border-gray-700 rounded p-2 focus:border-purple-500 outline-none" />
             </div>

             <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded flex items-center justify-center gap-2 mt-4">
                <Lock size={18} /> Actualizar Contraseña
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ProfileApp;