import { createSignal, onMount, For } from 'solid-js'
import './App.css'

type WeatherForecast = {
  date: string;
  temperatureC: number;
  temperatureF: number;
  summary?: string | null;
}

function App() {
  const [forecasts, setForecasts] = createSignal<WeatherForecast[]>([]);
  const [loading, setLoading] = createSignal(true);

  onMount(async () => {
    try {
      const response = await fetch('/api/weatherforecast');
      const data = await response.json();
      setForecasts(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching weather data:", error);
      setLoading(false);
    }
  });

  const contents = () => loading() 
    ? <p><em>Loading... Please refresh once the ASP.NET backend has started.</em></p>
    : <table id="weatherTable">
        <thead>
          <tr>
            <th>Date</th>
            <th aria-label="Temperature in Celsius">Temp. (C)</th>
            <th aria-label="Temperature in Fahrenheit">Temp. (F)</th>
            <th aria-label="Weather forecast summary">Summary</th>
          </tr>
        </thead>
        <tbody>
          <For each={forecasts()}>
            {(forecast) => (
              <tr>
                <td>{new Date(forecast.date).toLocaleDateString()}</td>
                <td>{forecast.temperatureC}</td>
                <td>{forecast.temperatureF}</td>
                <td>{forecast.summary}</td>
              </tr>
            )}
          </For>
        </tbody>
      </table>;

  return (
    <>
      <h1>Weather forecast</h1>
      <p>This component demonstrates fetching data from the server.</p>
      {contents()}
    </>
  )
}

export default App
