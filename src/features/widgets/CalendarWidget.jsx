// src/features/widgets/CalendarWidget.jsx
import React, { useState, useRef } from 'react';
import { Calendar } from '../../core/ui/shadcn/calendar'; 
import Draggable from 'react-draggable';
import { GripHorizontal } from 'lucide-react';

function CalendarWidget() {
  const [date, setDate] = useState(new Date());
  const nodeRef = useRef(null);

  return (
    <Draggable nodeRef={nodeRef} handle=".drag-handle" bounds="parent">
      {/* 1. CONTENEDOR EXTERIOR (El que se mueve) */}
      <div ref={nodeRef} className="absolute top-8 right-8 z-10 pointer-events-auto w-max">
        
        {/* 2. CONTENEDOR INTERIOR (El del diseño) */}
        <div className="animate-fade-in-down bg-white/80 dark:bg-[#1e1e2e]/90 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl p-2 shadow-xl transition-colors duration-300">
          
          {/* --- ZONA DE ARRASTRE  --- */}
          <div 
            className="drag-handle w-full flex justify-center py-1 mb-1 cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            title="Arrastrar widget"
          >
            <GripHorizontal size={18} />
          </div>

          {/* --- EL CALENDARIO --- */}
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-xl text-slate-800 dark:text-gray-200"
          />
        </div>

      </div>
    </Draggable>
  );
}

export default CalendarWidget;