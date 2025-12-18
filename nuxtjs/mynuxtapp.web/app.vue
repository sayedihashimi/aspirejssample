<template>
  <div class="weather-container">
    <h1>Weather forecast</h1>
    <p>This component demonstrates fetching data from the server.</p>
    
    <div v-if="loading">
      <p><em>Loading... Please refresh once the ASP.NET backend has started.</em></p>
    </div>
    
    <table v-else id="weatherTable">
      <thead>
        <tr>
          <th>Date</th>
          <th aria-label="Temperature in Celsius">Temp. (C)</th>
          <th aria-label="Temperature in Fahrenheit">Temp. (F)</th>
          <th aria-label="Weather forecast summary">Summary</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="forecast in weatherData" :key="forecast.date">
          <td>{{ new Date(forecast.date).toLocaleDateString() }}</td>
          <td>{{ forecast.temperatureC }}</td>
          <td>{{ forecast.temperatureF }}</td>
          <td>{{ forecast.summary }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

// Define the weather forecast data structure
const weatherData = ref([])
const loading = ref(true)

// Fetch weather data on component mount
onMounted(async () => {
  try {
    const response = await fetch('/api/weatherforecast')
    weatherData.value = await response.json()
  } catch (error) {
    console.error('Error fetching weather data:', error)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.weather-container {
  margin: 0 auto;
  text-align: center;
  font-size: 1rem;
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  width: 100%;
}

#weatherTable {
  border-collapse: collapse;
  margin-left: auto;
  margin-right: auto;
  display: table;
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
