// src/features/apps/ProfileApp.jsx
import React, { useEffect, useState } from 'react';
import { useForm } from "react-hook-form";
import { useFetch } from '../../core/api/useFetch';
import { User, Lock, Save, AlertTriangle } from 'lucide-react';
import { sileo } from 'sileo';

const ProfileApp = () => {
  const [activeTab, setActiveTab] = useState('info');
  const fetchDataBackend = useFetch();
  const [userData, setUserData] = useState(null);

  // --- NUEVOS ESTADOS PARA ELIMINAR CUENTA ---
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteInput, setDeleteInput] = useState("");

  const { register: registerInfo, handleSubmit: submitInfo, setValue } = useForm();
  const { register: registerPass, handleSubmit: submitPass, reset: resetPass } = useForm();

  useEffect(() => {
    const loadProfile = async () => {
      const token = localStorage.getItem('token');
      const backendUrl = import.meta.env.VITE_BACKEND_URL;
      const data = await fetchDataBackend(
        `${backendUrl}/users/profile`, null, "GET",
        { Authorization: `Bearer ${token}` }
      );
      if (data) {
        setUserData(data);
        setValue('nombre', data.nombre);
        setValue('apellido', data.apellido);
        setValue('email', data.email);
        setValue('celular', data.celular);
        setValue('direccion', data.direccion);
      }
    };
    loadProfile();
  }, []);

  const onUpdateInfo = async (formData) => {
    const token = localStorage.getItem('token');
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    await fetchDataBackend(
      `${backendUrl}/users/profile/${userData._id}`, formData, "PUT",
      { Authorization: `Bearer ${token}` }
    );
    const storedUser = JSON.parse(localStorage.getItem('user'));
    localStorage.setItem('user', JSON.stringify({ ...storedUser, nombre: formData.nombre }));
  };

  const onUpdatePass = async (formData) => {
    if (formData.passwordnuevo !== formData.confirmPassword) {
      sileo.error({ title: "Las contraseñas nuevas no coinciden" });
      return;
    }
    const token = localStorage.getItem('token');
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const response = await fetchDataBackend(
      `${backendUrl}/api/users/update-password`,
      { passwordactual: formData.passwordactual, passwordnuevo: formData.passwordnuevo },
      "PUT",
      { Authorization: `Bearer ${token}` }
    );
    if (response) resetPass();
  };

  if (!userData) return (
    <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
      Cargando perfil...
    </div>
  );

  // --- NUEVA FUNCIÓN: ELIMINAR CUENTA ---
  const expectedText = userData ? `delete_${userData.nombre.replace(/\s+/g, "")}` : "";

  const handleDeleteAccount = async () => {
    if (deleteInput !== expectedText) {
      sileo.error({ title: "El texto de confirmación no coincide." });
      return;
    }

    const token = localStorage.getItem('token');
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    try {
      const response = await fetchDataBackend(
        `${backendUrl}/users/delete-account`,
        { confirmationText: deleteInput },
        "DELETE",
        { Authorization: `Bearer ${token}` }
      );

      if (response && response.ok) {
        sileo.success({ title: "Tu cuenta y tus datos han sido eliminados." });

        // Limpiamos credenciales y forzamos recarga para desconectar sockets y desmontar el SO
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setTimeout(() => {
          window.location.href = '/login';
        }, 1500);
      }
    } catch (error) {
      console.error("Error al eliminar la cuenta:", error);
    }
  };

  if (!userData) return (
    <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
      Cargando perfil...
    </div>
  );

  // Clases reutilizables para inputs
  const inputClass = "w-full bg-background border border-border rounded p-2 text-foreground placeholder:text-muted-foreground focus:border-brand-500 outline-none transition-colors";
  const inputDisabledClass = "w-full bg-muted border border-border rounded p-2 text-muted-foreground cursor-not-allowed";
  const labelClass = "block text-xs text-muted-foreground mb-1";

  return (
    <div className="h-full flex flex-col bg-card text-foreground font-sans">

      {/* Tabs de Navegación */}
      <div className="flex border-b border-border shrink-0">
        <button
          onClick={() => setActiveTab('info')}
          className={`flex-1 p-3 flex items-center justify-center gap-2 text-sm transition-colors
            ${activeTab === 'info'
              ? 'bg-brand-500 text-white'
              : 'text-muted-foreground hover:bg-muted'}`}
        >
          <User size={16} /> Mis Datos
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={`flex-1 p-3 flex items-center justify-center gap-2 text-sm transition-colors
            ${activeTab === 'security'
              ? 'bg-brand-500 text-white'
              : 'text-muted-foreground hover:bg-muted'}`}
        >
          <Lock size={16} /> Seguridad
        </button>
      </div>

      {/* Contenido */}
      <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">

        {/* --- FORMULARIO DE DATOS --- */}
        {activeTab === 'info' && (
          <form onSubmit={submitInfo(onUpdateInfo)} className="space-y-4 max-w-md mx-auto">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Nombre</label>
                <input {...registerInfo('nombre')} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Apellido</label>
                <input {...registerInfo('apellido')} className={inputClass} />
              </div>
            </div>
            <div>
              <label className={labelClass}>Email (No editable)</label>
              <input {...registerInfo('email')} disabled className={inputDisabledClass} />
            </div>
            <div>
              <label className={labelClass}>Celular</label>
              <input {...registerInfo('celular')} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Dirección</label>
              <input {...registerInfo('direccion')} className={inputClass} />
            </div>

            <button
              type="submit"
              className="w-full bg-brand-500 hover:bg-brand-600 text-white py-2 rounded flex items-center justify-center gap-2 mt-4 transition-colors"
            >
              <Save size={16} /> Guardar Cambios
            </button>
          </form>
        )}

        {/* --- FORMULARIO DE CONTRASEÑA E IRREVERSIBILIDAD --- */}
        {activeTab === 'security' && (
          <div className="max-w-md mx-auto">
            <form onSubmit={submitPass(onUpdatePass)} className="space-y-4">
              <div className="p-3 bg-brand-500/10 border border-brand-500/30 rounded text-sm text-brand-600 dark:text-brand-400 mb-4">
                Asegúrate de usar una contraseña segura.
              </div>

              <div>
                <label className={labelClass}>Contraseña Actual</label>
                <input type="password" {...registerPass('passwordactual', { required: true })} className={inputClass} />
              </div>

              <hr className="border-border my-4" />

              <div>
                <label className={labelClass}>Nueva Contraseña</label>
                <input type="password" {...registerPass('passwordnuevo', { required: true, minLength: 6 })} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Confirmar Nueva Contraseña</label>
                <input type="password" {...registerPass('confirmPassword', { required: true })} className={inputClass} />
              </div>

              <button
                type="submit"
                className="w-full bg-destructive hover:opacity-90 text-white py-2 rounded flex items-center justify-center gap-2 mt-4 transition-opacity"
              >
                <Lock size={16} /> Actualizar Contraseña
              </button>
            </form>

            {/* --- ZONA DE PELIGRO --- */}
            <div className="mt-10 pt-6 border-t border-destructive/30">
              <h4 className="text-sm font-bold text-destructive flex items-center gap-2 mb-2">
                <AlertTriangle size={16} /> Zona de Peligro
              </h4>
              <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                Una vez que elimines tu cuenta, no hay vuelta atrás. Se borrarán todos tus archivos, notas, enlaces y espacios de trabajo permanentemente.
              </p>

              {!showDeleteConfirm ? (
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="w-full bg-destructive hover:opacity-90 text-white py-2 rounded flex items-center justify-center gap-2 mt-4 transition-opacity"

                >
                  Eliminar mi cuenta
                </button>
              ) : (
                <div className="bg-destructive/10 border border-destructive/30 rounded p-4 space-y-3 animate-fade-in">
                  <p className="text-xs text-destructive font-medium">
                    Para confirmar, escribe: <span className="font-mono bg-black/20 dark:bg-black/40 px-1.5 py-0.5 rounded select-all">{expectedText}</span>
                  </p>
                  <input
                    type="text"
                    value={deleteInput}
                    onChange={(e) => setDeleteInput(e.target.value)}
                    className="w-full bg-background border border-destructive/50 rounded p-2 text-foreground focus:border-destructive outline-none transition-colors text-sm"
                    placeholder={expectedText}
                  />
                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setShowDeleteConfirm(false);
                        setDeleteInput("");
                      }}
                      className="flex-1 bg-muted hover:bg-muted/80 text-foreground py-2 rounded text-sm transition-colors font-medium"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={handleDeleteAccount}
                      disabled={deleteInput !== expectedText}
                      className="flex-1 bg-destructive hover:bg-destructive/90 text-white py-2 rounded text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    >
                      Confirmar
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileApp;

