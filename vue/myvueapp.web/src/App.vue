<script setup>
import { ref, onMounted } from 'vue'

const weatherData = ref([])
const loading = ref(true)

const getWeather = async () => {
  try {
    const response = await fetch('/api/weatherforecast')
    const json = await response.json()
    weatherData.value = json
    loading.value = false
  } catch (error) {
    console.error('Error fetching weather data:', error)
    loading.value = false
  }
}

onMounted(() => {
  getWeather()
})
</script>

<template>
  <div id="app">
    <h1>Weather forecast</h1>
    <p>This component demonstrates fetching data from the server.</p>
    
    <p v-if="loading">
      <em>Loading... Please refresh once the ASP.NET backend has started. See 
        <a href="https://aka.ms/jspsintegrationvue">https://aka.ms/jspsintegrationvue</a> 
        for more details.
      </em>
    </p>
    
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

<style scoped>
#app {
  margin: 0 auto;
  text-align: center;
  font-size: 1rem;
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
}

#weatherTable {
  border-collapse: collapse;
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
