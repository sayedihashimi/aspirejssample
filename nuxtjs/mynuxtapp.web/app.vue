<template>
  <div>
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
h1 {
  margin-bottom: 1rem;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
}

th, td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

th {
  background-color: #f5f5f5;
  font-weight: bold;
}

tr:hover {
  background-color: #f9f9f9;
}
</style>
