import React, { useState, useEffect } from 'react';

// Accedemos a la clave desde las variables de entorno
const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;

function WeatherWidget() {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWeather = async () => {
      // Usamos Quito como ciudad por defecto. ¡Saludos a la EPN!
      // units=metric (Celsius), lang=es (español)
      const url = `https://api.openweathermap.org/data/2.5/weather?q=Quito&appid=${API_KEY}&units=metric&lang=es`;

      try {
        setLoading(true);
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('No se pudo cargar el clima');
        }
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
  }, []); // El array vacío [] hace que se ejecute 1 vez al montarse

  // Estado de Carga
  if (loading) {
    return <div className="text-white">Cargando clima...</div>;
  }

  // Estado de Error
  if (error) {
    return <div className="text-red-400">Error: {error}</div>;
  }

  // Estado de Éxito
  if (!weatherData) {
    return null; // No mostrar nada si no hay datos
  }

  // Extraemos los datos que usaremos
  const { name } = weatherData;
  const { icon, description } = weatherData.weather[0];
  const { temp, humidity } = weatherData.main;
  const iconUrl = `https://openweathermap.org/img/wn/${icon}@2x.png`;

  return (
    <div className="text-white p-4 rounded-lg flex flex-col items-center">
      <h3 className="text-2xl font-bold">{name}</h3>
      <img src={iconUrl} alt={description} className="w-24 h-24 -my-4" />
      <p className="text-4xl font-thin">{Math.round(temp)}°C</p>
      <p className="capitalize text-gray-300">{description}</p>
      <p className="text-sm text-gray-400 mt-2">Humedad: {humidity}%</p>
    </div>
  );
}

export default WeatherWidget;