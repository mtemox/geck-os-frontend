import React, { useState } from "react";
import storePayments from "../../core/context/storePayments";
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { CreditCard, Lock, X } from "lucide-react";

function ModalPayment({ plan }) {

    const { toggleModal, createPaymentIntent, registerStorageUpdate } = storePayments();
    const stripe = useStripe();
    const elements = useElements();
    
    const [loading, setLoading] = useState(false);

    const handlePayment = async (e) => {
        e.preventDefault();
        
        if (!stripe || !elements) return;

        setLoading(true);

        try {
            // 1. LLAMAR AL BACKEND para crear la intención de pago
            // Usamos el endpoint que definimos en tu backend: /payments/create-intent
            const url = `${import.meta.env.VITE_BACKEND_URL}/payments/create-intent`;
            const data = { amount: plan.price }; // Enviamos el monto

            const response = await createPaymentIntent(url, data);

            if (response && response.clientSecret) {
                
                // 2. CONFIRMAR EL PAGO CON STRIPE (Frontend -> Stripe)
                const cardElement = elements.getElement(CardElement);
                
                const { paymentIntent, error } = await stripe.confirmCardPayment(response.clientSecret, {
                    payment_method: {
                        card: cardElement,
                        billing_details: {
                            // Puedes rellenar esto con datos del usuario si quieres
                            name: "Estudiante VirtualDesk", 
                        },
                    },
                });

                if (error) {
                    console.error(error);
                    sileo.error({title: error.message});
                } else if (paymentIntent.status === "succeeded") {
                    // 3. PAGO EXITOSO
                    // Aquí llamamos a la función del store para cerrar modal y notificar
                    // O llamar a otro endpoint para sumar los GBs
                    registerStorageUpdate(plan.gb);
                }
            }

        } catch (error) {
            console.error("Error en proceso de pago:", error);
            sileo.error({title: "Error procesando el pago."});
        } finally {
            setLoading(false);
        }
    };

    // Estilos personalizados para el input de tarjeta de Stripe
    const cardStyle = {
        style: {
            base: {
                color: "#ffffff",
                fontFamily: '"Inter", sans-serif',
                fontSmoothing: "antialiased",
                fontSize: "16px",
                "::placeholder": {
                    color: "#aab7c4"
                }
            },
            invalid: {
                color: "#fa755a",
                iconColor: "#fa755a"
            }
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-gray-900 border border-gray-700 rounded-xl shadow-2xl w-full max-w-md overflow-hidden relative">
                
                {/* Header del Modal */}
                <div className="bg-gray-800 p-4 border-b border-gray-700 flex justify-between items-center">
                    <h3 className="text-white font-bold text-lg flex items-center gap-2">
                        <Lock size={18} className="text-green-500" />
                        Pago Seguro
                    </h3>
                    <button onClick={toggleModal} className="text-gray-400 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handlePayment} className="p-6 space-y-6">

                    {/* Resumen de Compra */}
                    <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-gray-300">Plan Seleccionado:</span>
                            <span className="text-white font-medium">{plan.name}</span>
                        </div>
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-gray-300">Almacenamiento:</span>
                            <span className="text-purple-400 font-bold">+{plan.gb} GB</span>
                        </div>
                        <div className="border-t border-gray-700 my-2 pt-2 flex justify-between items-center">
                            <span className="text-gray-200 font-semibold">Total a Pagar:</span>
                            <span className="text-2xl text-white font-bold">${plan.price.toFixed(2)}</span>
                        </div>
                    </div>

                    {/* Input de Tarjeta Stripe */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Datos de la Tarjeta
                        </label>
                        <div className="p-3 bg-gray-800 border border-gray-600 rounded-lg focus-within:ring-2 focus-within:ring-purple-500 transition-all">
                            <CardElement options={cardStyle} />
                        </div>
                        <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                            <Lock size={10} />
                            Transacción encriptada de extremo a extremo.
                        </p>
                    </div>

                    {/* Botones */}
                    <div className="flex gap-3 pt-2">
                        <button 
                            type="button" 
                            onClick={toggleModal}
                            className="flex-1 px-4 py-2 rounded-lg bg-gray-700 text-white hover:bg-gray-600 transition-colors font-medium"
                        >
                            Cancelar
                        </button>
                        <button 
                            type="submit" 
                            disabled={!stripe || loading}
                            className={`flex-1 px-4 py-2 rounded-lg text-white font-bold transition-all flex items-center justify-center gap-2 shadow-lg
                                ${loading ? 'bg-purple-800 cursor-wait' : 'bg-purple-600 hover:bg-purple-700 shadow-purple-900/20'}
                            `}
                        >
                            {loading ? (
                                <>Procesando...</>
                            ) : (
                                <>
                                    <CreditCard size={18} />
                                    Pagar ${plan.price}
                                </>
                            )}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}

export default ModalPayment;