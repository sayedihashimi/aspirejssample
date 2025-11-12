import { useEffect, useState } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)
  const [weatherData, setWeatherData] = useState([]);

  const getWeather = async () =>{
    fetch("/api/weatherforecast")
    .then(response => response.json()
    .then(json => setWeatherData(json)))
    .catch(error => console.error("Error fetching weather data:", error));
  }

  useEffect(() => {
    getWeather();
  }, []);

  const contents = weatherData === undefined
    ? <p><em>Loading... Please refresh once the ASP.NET backend has started. See <a href="https://aka.ms/jspsintegrationreact">https://aka.ms/jspsintegrationreact</a> for more details.</em></p>
    : <table id="weatherTable">
        <thead>
          <tr><th>Date</th>
          <th aria-label="Temperature in Celsius">Temp. (C)</th>
          <th aria-label="Temperature in Fahrenheit">Temp. (F)</th>
          <th aria-label="Weather forecast summary">Summary</th></tr>
        </thead>
        <tbody>
          {weatherData.map(forecast =>
            <tr key={forecast.date}>
              <td>{new Date(forecast.date).toLocaleDateString()}</td>
              <td>{forecast.temperatureC}</td>
              <td>{forecast.temperatureF}</td>
              <td>{forecast.summary}</td>
            </tr>
          )}
        </tbody>
      </table>;

  return (
    <>
    <h1>Weather forecast</h1>

    <p>This component demonstrates fetching data from the server.</p>
    {contents}
    </>
  )
}

export default App