// src/features/widgets/WeatherWidget.jsx
import React, { useState, useEffect, useRef } from 'react';
import Draggable from 'react-draggable';
import { Loader, AlertCircle, MapPin, GripHorizontal, Droplets, Wind } from 'lucide-react';

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;

function WeatherWidget() {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const nodeRef = useRef(null);

  // Reajustar posición si se sale de los bounds al cambiar resolución
  useEffect(() => {
    const clampPosition = () => {
      const el = nodeRef.current;
      if (!el) return;
      const parent = el.parentElement;
      if (!parent) return;

      const elRect = el.getBoundingClientRect();
      const parentRect = parent.getBoundingClientRect();

      const maxX = parentRect.width - elRect.width;
      const maxY = parentRect.height - elRect.height;

      setPosition(prev => ({
        x: Math.min(Math.max(prev.x, 0), maxX),
        y: Math.min(Math.max(prev.y, 0), maxY),
      }));
    };

    window.addEventListener('resize', clampPosition);
    return () => window.removeEventListener('resize', clampPosition);
  }, []);

  useEffect(() => {
    const fetchWeather = async () => {
      const url = `https://api.openweathermap.org/data/2.5/weather?q=Quito&appid=${API_KEY}&units=metric&lang=es`;
      try {
        setLoading(true);
        const response = await fetch(url);
        if (!response.ok) throw new Error('No se pudo cargar el clima');
        const data = await response.json();
        setWeatherData(data);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchWeather();
  }, []);

  return (
    <Draggable
      nodeRef={nodeRef}
      handle=".drag-handle"
      bounds="parent"
      position={position}
      onStop={(_, data) => setPosition({ x: data.x, y: data.y })}
    >
      {/* Contenedor exterior — posición inicial arriba a la izquierda */}
      <div ref={nodeRef} className="absolute top-8 right-64 z-10 pointer-events-auto w-44">

        {/* Contenedor interior — sigue el tema del sistema */}
        <div className="animate-fade-in-down bg-card/80 backdrop-blur-xl border border-border rounded-2xl p-3 shadow-xl transition-colors duration-300 flex flex-col items-center">

          {/* Zona de arrastre */}
          <div
            className="drag-handle w-full flex justify-center pb-2 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors"
            title="Arrastrar widget"
          >
            <GripHorizontal size={16} />
          </div>

          {loading ? (
            <div className="py-4 flex flex-col items-center gap-2 text-muted-foreground">
              <Loader size={18} className="animate-spin text-brand-500" />
              <span className="text-xs">Cargando...</span>
            </div>
          ) : error ? (
            <div className="py-4 flex flex-col items-center gap-2 text-destructive">
              <AlertCircle size={18} />
              <span className="text-[10px] text-center">{error}</span>
            </div>
          ) : weatherData ? (
            <div className="flex flex-col items-center w-full">

              {/* Ciudad */}
              <div className="flex items-center gap-1 text-xs font-semibold text-foreground mb-1">
                <MapPin size={12} className="text-brand-500" />
                {weatherData.name}
              </div>

              {/* Temperatura e Icono */}
              <div className="flex items-center justify-center gap-1 my-1">
                <img
                  src={`https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png`}
                  alt={weatherData.weather[0].description}
                  className="w-12 h-12 drop-shadow-md -my-2"
                />
                <div className="text-4xl font-light text-foreground tracking-tighter">
                  {Math.round(weatherData.main.temp)}°
                </div>
              </div>

              {/* Descripción */}
              <p className="capitalize text-[10px] text-muted-foreground mb-3 text-center leading-tight">
                {weatherData.weather[0].description}
              </p>

              {/* Detalles extra */}
              <div className="flex justify-between w-full pt-2 border-t border-border px-2">
                <div className="flex flex-col items-center gap-0.5">
                  <Droplets size={10} className="text-brand-500" />
                  <span className="text-[10px] text-foreground font-medium">{weatherData.main.humidity}%</span>
                </div>
                <div className="flex flex-col items-center gap-0.5">
                  <Wind size={10} className="text-muted-foreground" />
                  <span className="text-[10px] text-foreground font-medium">{Math.round(weatherData.wind.speed)}m/s</span>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </Draggable>
  );
}

export default WeatherWidget;