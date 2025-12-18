'use client';

import { useEffect, useState } from 'react';

interface WeatherForecast {
  date: string;
  temperatureC: number;
  temperatureF: number;
  summary: string;
}

export default function Home() {
  const [weatherData, setWeatherData] = useState<WeatherForecast[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getWeather = async () => {
      try {
        const response = await fetch('/api/weatherforecast');
        const json = await response.json();
        setWeatherData(json);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching weather data:', error);
        setLoading(false);
      }
    };

    getWeather();
  }, []);

  const contents = loading ? (
    <p className="text-gray-600">
      <em>
        Loading... Please refresh once the ASP.NET backend has started. See{' '}
        <a href="https://aka.ms/jspsintegrationreact" className="text-blue-600 hover:underline">
          https://aka.ms/jspsintegrationreact
        </a>{' '}
        for more details.
      </em>
    </p>
  ) : (
    <table id="weatherTable" className="min-w-full border-collapse border border-gray-300">
      <thead>
        <tr className="bg-gray-100">
          <th className="border border-gray-300 px-4 py-2">Date</th>
          <th className="border border-gray-300 px-4 py-2" aria-label="Temperature in Celsius">
            Temp. (C)
          </th>
          <th className="border border-gray-300 px-4 py-2" aria-label="Temperature in Fahrenheit">
            Temp. (F)
          </th>
          <th className="border border-gray-300 px-4 py-2" aria-label="Weather forecast summary">
            Summary
          </th>
        </tr>
      </thead>
      <tbody>
        {weatherData.map((forecast) => (
          <tr key={forecast.date}>
            <td className="border border-gray-300 px-4 py-2">
              {new Date(forecast.date).toLocaleDateString()}
            </td>
            <td className="border border-gray-300 px-4 py-2">{forecast.temperatureC}</td>
            <td className="border border-gray-300 px-4 py-2">{forecast.temperatureF}</td>
            <td className="border border-gray-300 px-4 py-2">{forecast.summary}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <div className="min-h-screen bg-white p-8">
      <h1 className="text-3xl font-bold mb-4">Weather forecast</h1>
      <p className="mb-6">This component demonstrates fetching data from the server.</p>
      {contents}
    </div>
  );
}
