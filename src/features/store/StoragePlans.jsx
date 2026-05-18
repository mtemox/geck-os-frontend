// src/features/store/StoragePlans.jsx
import React, { useState, useEffect, lazy, Suspense } from 'react';
import { HardDrive, Check, Zap, Loader } from 'lucide-react';
import storePayments from '../../core/context/storePayments';

/*
  PROBLEMA ORIGINAL:
  - loadStripe() y <Elements> se inicializaban al montar el componente,
    aunque el usuario nunca hiciera clic en "Comprar".
  - Stripe cargaba ~247KB de JS bloqueando el hilo principal 256ms.

  SOLUCIÓN:
  - loadStripe() se llama SOLO cuando el usuario hace clic en un plan.
  - El componente <ModalPayment> se importa de forma lazy.
  - <Elements> se monta lazy también, dentro de un Suspense.
  - El resto del componente (tarjetas de planes) no cambia en absoluto.
*/

// Importación lazy del modal (no bloquea el bundle inicial)
const ModalPayment = lazy(() => import('./ModalPayment'));

// stripePromise se inicializa SOLO cuando se llama a getStripePromise()
let stripePromise = null;
const getStripePromise = () => {
  if (!stripePromise) {
    // loadStripe se importa dinámicamente para no incluirlo en el bundle inicial
    import('@stripe/stripe-js').then(({ loadStripe }) => {
      stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);
    });
  }
  return stripePromise;
};

// Elements también se importa lazy
let ElementsComponent = null;
const getElements = async () => {
  if (!ElementsComponent) {
    const { Elements } = await import('@stripe/react-stripe-js');
    ElementsComponent = Elements;
  }
  return ElementsComponent;
};

const StoragePlans = () => {
  const { modal, toggleModal } = storePayments();
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [stripeLoaded, setStripeLoaded] = useState(false);
  const [Elements, setElements] = useState(null);

  const plans = [
    { id: 1, name: "Plan Estudiante", gb: 10,  price: 5,  features: ["10 GB Extra", "Soporte básico"] },
    { id: 2, name: "Plan Pro",        gb: 50,  price: 15, features: ["50 GB Extra", "IA Ilimitada", "Soporte 24/7"] },
    { id: 3, name: "Plan Máster",     gb: 100, price: 25, features: ["100 GB Extra", "Todo ilimitado"] },
  ];

  const handleSelectPlan = async (plan) => {
    setSelectedPlan(plan);

    // Cargar Stripe y Elements solo en este momento
    if (!stripeLoaded) {
      getStripePromise();
      const El = await getElements();
      setElements(() => El);
      setStripeLoaded(true);
    }

    toggleModal();
  };

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
          const isHighlighted = index === 1;

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
              {isHighlighted && (
                <div className="absolute top-3 right-3 px-2 py-0.5 bg-brand-500 text-white text-[10px] font-bold rounded-full uppercase tracking-wide">
                  Popular
                </div>
              )}

              <div className="absolute top-0 right-0 p-4 text-brand-500 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                <Zap size={64} />
              </div>

              <h3 className="text-base font-semibold text-foreground">{plan.name}</h3>

              <div className="my-4 flex items-end gap-1">
                <span className="text-4xl font-bold text-foreground">${plan.price}</span>
                <span className="text-sm text-muted-foreground mb-1">/ pago único</span>
              </div>

              <ul className="flex-1 space-y-2.5 mb-6">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check size={15} className="text-brand-500 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

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

      {/* Modal de pago — solo se monta cuando Stripe está listo y el modal está abierto */}
      {modal && selectedPlan && Elements && (
        <Suspense fallback={
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
            <Loader size={32} className="animate-spin text-white" />
          </div>
        }>
          <Elements stripe={stripePromise}>
            <ModalPayment plan={selectedPlan} />
          </Elements>
        </Suspense>
      )}
    </div>
  );
};

export default StoragePlans;