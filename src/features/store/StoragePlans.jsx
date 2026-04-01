// src/features/store/StoragePlans.jsx
import React, { useState } from 'react';
import { HardDrive, Check, Zap } from 'lucide-react';
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import storePayments from '../../core/context/storePayments';
import ModalPayment from './ModalPayment';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const StoragePlans = () => {
  const { modal, toggleModal } = storePayments();
  const [selectedPlan, setSelectedPlan] = useState(null);

  const plans = [
    { id: 1, name: "Plan Estudiante", gb: 10,  price: 5,  features: ["10 GB Extra", "Soporte básico"] },
    { id: 2, name: "Plan Pro",        gb: 50,  price: 15, features: ["50 GB Extra", "IA Ilimitada", "Soporte 24/7"] },
    { id: 3, name: "Plan Máster",     gb: 100, price: 25, features: ["100 GB Extra", "Todo ilimitado"] },
  ];

  const handleSelectPlan = (plan) => { setSelectedPlan(plan); toggleModal(); };

  return (
    <div className="p-6 h-full overflow-y-auto custom-scrollbar bg-background">

      {/* Título */}
      <h2 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
        <HardDrive size={24} className="text-brand-500" />
        Ampliar Almacenamiento
      </h2>
      <p className="text-sm text-muted-foreground mb-8">
        Elige el plan que mejor se adapte a tus necesidades
      </p>

      {/* Grid de planes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan, index) => {
          const isHighlighted = index === 1; // Plan Pro destacado

          return (
            <div
              key={plan.id}
              className={`
                relative flex flex-col rounded-xl p-6 overflow-hidden
                border transition-all duration-300 shadow-md group
                hover:shadow-xl hover:border-brand-500/60 hover:-translate-y-0.5
                ${isHighlighted
                  ? 'bg-brand-500/10 border-brand-500/40'
                  : 'bg-card border-border'}
              `}
            >
              {/* Badge "Popular" en el plan del medio */}
              {isHighlighted && (
                <div className="absolute top-3 right-3 px-2 py-0.5 bg-brand-500 text-white text-[10px] font-bold rounded-full uppercase tracking-wide">
                  Popular
                </div>
              )}

              {/* Decoración de fondo */}
              <div className="absolute top-0 right-0 p-4 text-brand-500 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                <Zap size={64} />
              </div>

              {/* Nombre del plan */}
              <h3 className="text-base font-semibold text-foreground">{plan.name}</h3>

              {/* Precio */}
              <div className="my-4 flex items-end gap-1">
                <span className="text-4xl font-bold text-foreground">${plan.price}</span>
                <span className="text-sm text-muted-foreground mb-1">/ pago único</span>
              </div>

              {/* Features */}
              <ul className="flex-1 space-y-2.5 mb-6">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check size={15} className="text-brand-500 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <button
                onClick={() => handleSelectPlan(plan)}
                className={`
                  w-full py-2.5 rounded-lg font-semibold text-sm transition-all shadow-sm
                  ${isHighlighted
                    ? 'bg-brand-500 hover:bg-brand-600 text-white shadow-brand-500/30 hover:shadow-brand-500/40 hover:shadow-md'
                    : 'bg-muted hover:bg-brand-500/10 text-foreground hover:text-brand-500 border border-border hover:border-brand-500/40'}
                `}
              >
                Comprar {plan.gb} GB
              </button>
            </div>
          );
        })}
      </div>

      {/* Modal de pago */}
      {modal && selectedPlan && (
        <Elements stripe={stripePromise}>
          <ModalPayment plan={selectedPlan} />
        </Elements>
      )}
    </div>
  );
};

export default StoragePlans;