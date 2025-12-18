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
    <p>
      <em>
        Loading... Please refresh once the ASP.NET backend has started. See{' '}
        <a href="https://aka.ms/jspsintegrationreact">
          https://aka.ms/jspsintegrationreact
        </a>{' '}
        for more details.
      </em>
    </p>
  ) : (
    <table id="weatherTable">
      <thead>
        <tr>
          <th>Date</th>
          <th aria-label="Temperature in Celsius">Temp. (C)</th>
          <th aria-label="Temperature in Fahrenheit">Temp. (F)</th>
          <th aria-label="Weather forecast summary">Summary</th>
        </tr>
      </thead>
      <tbody>
        {weatherData.map((forecast) => (
          <tr key={forecast.date}>
            <td>{new Date(forecast.date).toLocaleDateString()}</td>
            <td>{forecast.temperatureC}</td>
            <td>{forecast.temperatureF}</td>
            <td>{forecast.summary}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <div id="root">
      <h1>Weather forecast</h1>
      <p>This component demonstrates fetching data from the server.</p>
      {contents}
    </div>
  );
}
