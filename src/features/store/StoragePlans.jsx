// src/features/store/StoragePlans.jsx
import React, { useState } from 'react';
import { HardDrive, Check, Zap } from 'lucide-react'; // Iconos
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import storePayments from '../../core/context/storePayments';
import ModalPayment from './ModalPayment';

// Carga de Stripe con tu llave pública
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const StoragePlans = () => {
    
    const { modal, toggleModal } = storePayments();
    const [selectedPlan, setSelectedPlan] = useState(null);

    // Definimos los planes de almacenamiento (Lógica de negocio)
    const plans = [
        { id: 1, name: "Plan Estudiante", gb: 10, price: 5, features: ["10 GB Extra", "Soporte básico"] },
        { id: 2, name: "Plan Pro", gb: 50, price: 15, features: ["50 GB Extra", "IA Ilimitada", "Soporte 24/7"] },
        { id: 3, name: "Plan Máster", gb: 100, price: 25, features: ["100 GB Extra", "Todo ilimitado"] },
    ];

    const handleSelectPlan = (plan) => {
        setSelectedPlan(plan);
        toggleModal();
    };

    return (
        <div className="p-6 h-full overflow-y-auto">
            <h2 className="text-2xl text-white font-bold mb-6 flex items-center gap-2">
                <HardDrive className="text-purple-500" /> 
                Ampliar Almacenamiento
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {plans.map((plan) => (
                    <div key={plan.id} className="bg-gray-800 border border-gray-700 rounded-xl p-6 hover:border-purple-500 transition-all shadow-lg flex flex-col relative overflow-hidden group">
                        
                        {/* Decoración */}
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Zap size={60} />
                        </div>

                        <h3 className="text-xl text-white font-semibold">{plan.name}</h3>
                        <div className="my-4">
                            <span className="text-4xl font-bold text-white">${plan.price}</span>
                            <span className="text-gray-400"> / pago único</span>
                        </div>
                        
                        <div className="flex-1 space-y-3 mb-6">
                            {plan.features.map((feature) => (
                                <div key={feature} className="flex items-center gap-2 text-sm text-gray-300">
                                    <Check size={16} className="text-green-400" />
                                    {feature}
                                </div>
                            ))}
                        </div>

                        <button 
                            onClick={() => handleSelectPlan(plan)}
                            className="w-full py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold transition-colors shadow-lg shadow-purple-900/20"
                        >
                            Comprar {plan.gb} GB
                        </button>
                    </div>
                ))}
            </div>

            {/* Renderizado Condicional del Modal con Stripe Elements */}
            {modal && selectedPlan && (
                <Elements stripe={stripePromise}>
                    <ModalPayment plan={selectedPlan} />
                </Elements>
            )}
        </div>
    );
};

export default StoragePlans;