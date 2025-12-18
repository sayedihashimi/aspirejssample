<script>
  import { onMount } from 'svelte';

  let forecasts = [];
  let loading = true;

  onMount(async () => {
    try {
      const response = await fetch('/api/weatherforecast');
      forecasts = await response.json();
    } catch (error) {
      console.error('Error fetching weather data:', error);
    } finally {
      loading = false;
    }
  });
</script>

<main>
  <h1>Weather forecast</h1>
  <p>This component demonstrates fetching data from the server.</p>

  {#if loading}
    <p><em>Loading... Please refresh once the ASP.NET backend has started. See <a href="https://aka.ms/jspsintegrationsvelte">https://aka.ms/jspsintegrationsvelte</a> for more details.</em></p>
  {:else}
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
        {#each forecasts as forecast}
          <tr>
            <td>{new Date(forecast.date).toLocaleDateString()}</td>
            <td>{forecast.temperatureC}</td>
            <td>{forecast.temperatureF}</td>
            <td>{forecast.summary}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  {/if}
</main>

<style>
  main {
    margin: 0 auto;
    text-align: center;
    font-size: 1rem;
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  }

  #weatherTable {
    border-collapse: collapse;
    margin: 0 auto;
  }

  #weatherTable tbody tr {
    border-bottom: 1px solid rgb(68, 68, 68);
  }

  #weatherTable th, #weatherTable td {
    padding: 0.3rem 2rem;
  }

  #weatherTable thead {
    font-size: 1.2rem;
  }
</style>
