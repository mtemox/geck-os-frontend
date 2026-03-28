// src/core/context/storePayments.jsx
import { create } from "zustand";
import axios from "axios";

// Helper para obtener headers (Token JWT)
const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        }
    };
};

const storePayments = create((set) => ({
    
    modal: false,
    toggleModal: () => set((state) => ({ modal: !state.modal })),

    // Esta función llama a tu backend para crear la intención de pago
    createPaymentIntent: async (url, data) => {
        try {
            const respuesta = await axios.post(url, data, getAuthHeaders());
            // Retornamos el clientSecret que nos da el backend para usarlo en el Modal
            return respuesta.data; 
        } catch (error) {
            console.error(error);
            sileo.error({title: error.response?.data?.msg || "Error al iniciar el pago"});
            return null;
        }
    },

    // (Opcional) Si tuvieras una lógica para guardar historial después de Stripe
    registerStorageUpdate: async (amount) => {
        // Aquí podrías llamar a otro endpoint para actualizar los GB del usuario
        // si no lo haces automáticamente con Webhooks en el backend.
        sileo.success({title: `¡Pago exitoso! Se han añadido ${amount}GB a tu cuenta.`});
        set((state) => ({ modal: false })); // Cerramos modal
    }
}));

export default storePayments;