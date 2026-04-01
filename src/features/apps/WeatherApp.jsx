// src/features/widgets/WeatherApp.jsx
import React, { useState, useEffect } from 'react';
import { Loader, AlertCircle, Droplets, MapPin } from 'lucide-react';

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;

function WeatherApp() {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
        setWeatherData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchWeather();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full gap-2 text-muted-foreground">
        <Loader size={18} className="animate-spin text-brand-500" />
        <span className="text-sm">Cargando clima...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full gap-2 text-destructive">
        <AlertCircle size={18} />
        <span className="text-sm">{error}</span>
      </div>
    );
  }

  if (!weatherData) return null;

  const { name } = weatherData;
  const { icon, description } = weatherData.weather[0];
  const { temp, temp_min, temp_max, humidity, feels_like } = weatherData.main;
  const { speed: windSpeed } = weatherData.wind;
  const iconUrl = `https://openweathermap.org/img/wn/${icon}@2x.png`;

  return (
    <div className="flex flex-col h-full bg-card text-foreground overflow-hidden">

      {/* Ciudad */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted shrink-0">
        <MapPin size={14} className="text-brand-500" />
        <h2 className="text-sm font-semibold text-foreground">{name}</h2>
      </div>

      {/* Temperatura principal */}
      <div className="flex flex-col items-center justify-center flex-1 gap-1 py-4">
        <img src={iconUrl} alt={description} className="w-20 h-20 -mb-2 drop-shadow-md" />
        <p className="text-5xl font-thin text-foreground tracking-tight">
          {Math.round(temp)}<span className="text-3xl text-muted-foreground">°C</span>
        </p>
        <p className="capitalize text-sm text-muted-foreground mt-1">{description}</p>
        <p className="text-xs text-muted-foreground/70">
          Sensación {Math.round(feels_like)}°C
        </p>
      </div>

      {/* Detalles */}
      <div className="grid grid-cols-3 divide-x divide-border border-t border-border shrink-0">
        {[
          { label: 'Mín / Máx', value: `${Math.round(temp_min)}° / ${Math.round(temp_max)}°` },
          { label: 'Humedad',   value: `${humidity}%`,        icon: <Droplets size={12} className="text-brand-500" /> },
          { label: 'Viento',    value: `${Math.round(windSpeed)} m/s` },
        ].map(({ label, value, icon }) => (
          <div key={label} className="flex flex-col items-center py-3 gap-1 bg-muted/50 hover:bg-muted transition-colors">
            <div className="flex items-center gap-1 text-muted-foreground">
              {icon}
              <span className="text-[10px] uppercase tracking-wide font-semibold">{label}</span>
            </div>
            <span className="text-sm font-medium text-foreground">{value}</span>
          </div>
        ))}
      </div>

    </div>
  );
}

export default WeatherApp;