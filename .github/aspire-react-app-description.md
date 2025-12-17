# .NET Aspire 13 React Application - Detailed Description

## **Architecture Overview**

This is a **3-project .NET Aspire solution** consisting of:
1. **MyReactApp.AppHost** - The Aspire orchestrator
2. **MyReactApp.api** - ASP.NET Core Web API backend
3. **myreactapp.web** - React frontend (Vite-based)
4. **MyReactApp.ServiceDefaults** - Shared Aspire service configuration

---

## **1. AppHost Project (Orchestrator)**

**File:** `AppHost.cs`

**Purpose:** Configures and orchestrates the entire distributed application.

**Key Features:**
- Uses `DistributedApplication.CreateBuilder(args)` to create the Aspire app
- Adds a Docker Compose environment with `builder.AddDockerComposeEnvironment("env")`
- Defines **two services**:
  
  **API Service:**
  - Registered as `"apiservice"` using `AddProject<Projects.MyReactApp_api>`
  - Configured with HTTP health check at `/health` endpoint
  - Exposed with external HTTP endpoints via `WithExternalHttpEndpoints()`
  
  **Frontend Service:**
  - Registered as `"frontend"` using `AddViteApp` pointing to `../myreactapp.web`
  - Has a reference to the API service (for service discovery)
  - Uses `WaitFor(apiService)` to ensure API starts first
  - Exposed with external HTTP endpoints
  
- **Publishing Configuration:** `apiService.PublishWithContainerFiles(frontend, "./wwwroot")` - This publishes the built React app into the API's wwwroot folder for production deployment

**Dependencies:**
- `Aspire.Hosting.Docker` (v13.1.0-preview.1.25570.9)
- `Aspire.Hosting.JavaScript` (v13.1.0-preview.1.25557.15)
- Target Framework: `net10.0`

**Complete Code:**
```csharp
var builder = DistributedApplication.CreateBuilder(args);

// Add the following line to configure the Docker Compose environment
builder.AddDockerComposeEnvironment("env");

var apiService = builder.AddProject<Projects.MyReactApp_api>("apiservice")
                        .WithHttpHealthCheck("/health")
                        .WithExternalHttpEndpoints();

var frontend = builder.AddViteApp("frontend", "../myreactapp.web")
                        .WithReference(apiService)
                        .WaitFor(apiService)
                        .WithExternalHttpEndpoints();

apiService.PublishWithContainerFiles(frontend, "./wwwroot");

builder.Build().Run();
```

---

## **2. API Backend Project**

**File:** `Program.cs`

**Purpose:** Minimal ASP.NET Core Web API that serves weather data and static files.

**Key Features:**

**Services Configuration:**
- `builder.Services.AddOpenApi()` - Adds OpenAPI/Swagger support
- `builder.AddServiceDefaults()` - Adds Aspire service defaults (telemetry, health checks, service discovery)

**Endpoints:**
- `app.MapDefaultEndpoints()` - Maps `/health` and `/alive` endpoints (from ServiceDefaults)
- `app.MapOpenApi()` - Maps OpenAPI endpoint (development only)
- **Weather API:** `GET /api/weatherforecast`
  - Returns an array of 5 weather forecasts
  - Each forecast contains:
    - `Date` (DateOnly) - Today + 1-5 days
    - `TemperatureC` (int) - Random temperature between -20 and 55°C
    - `TemperatureF` (int) - Calculated from Celsius: `32 + (int)(TemperatureC / 0.5556)`
    - `Summary` (string) - Random selection from: "Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching"
  - Named route: `"GetWeatherForecast"`

**Additional Configuration:**
- `app.UseHttpsRedirection()` - Enforces HTTPS
- `app.UseFileServer()` - Serves static files (for hosting the React build)

**Dependencies:**
- `Microsoft.AspNetCore.OpenApi` (v10.0.0-rc.2.25502.107)
- References `MyReactApp.ServiceDefaults` project
- Target Framework: `net10.0`

**Complete Code:**
```csharp
var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();
builder.AddServiceDefaults();

var app = builder.Build();
app.MapDefaultEndpoints();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

var summaries = new[]
{
    "Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching"
};

var api = app.MapGroup("/api");
api.MapGet("/weatherforecast", () =>
{
    var forecast =  Enumerable.Range(1, 5).Select(index =>
        new WeatherForecast
        (
            DateOnly.FromDateTime(DateTime.Now.AddDays(index)),
            Random.Shared.Next(-20, 55),
            summaries[Random.Shared.Next(summaries.Length)]
        ))
        .ToArray();
    return forecast;
})
.WithName("GetWeatherForecast");

app.UseFileServer();

app.Run();

record WeatherForecast(DateOnly Date, int TemperatureC, string? Summary)
{
    public int TemperatureF => 32 + (int)(TemperatureC / 0.5556);
}
```

**Project File:**
```xml
<Project Sdk="Microsoft.NET.Sdk.Web">

  <PropertyGroup>
    <TargetFramework>net10.0</TargetFramework>
    <Nullable>enable</Nullable>
    <ImplicitUsings>enable</ImplicitUsings>
  </PropertyGroup>

  <ItemGroup>
    <PackageReference Include="Microsoft.AspNetCore.OpenApi" Version="10.0.0-rc.2.25502.107" />
  </ItemGroup>

  <ItemGroup>
    <ProjectReference Include="..\MyReactApp.ServiceDefaults\MyReactApp.ServiceDefaults.csproj" />
  </ItemGroup>

</Project>
```

---

## **3. ServiceDefaults Project**

**File:** `Extensions.cs`

**Purpose:** Shared library providing common Aspire services to all projects.

**Key Features:**

**`AddServiceDefaults()` Extension:**
- Configures OpenTelemetry (metrics, traces, logs)
- Adds default health checks (liveness check at `/alive`, readiness at `/health`)
- Configures service discovery
- Configures HTTP client defaults with:
  - Standard resilience handler (retry policies, circuit breakers)
  - Service discovery support

**OpenTelemetry Configuration:**
- **Logging:** Includes formatted messages and scopes
- **Metrics:** ASP.NET Core, HTTP client, and runtime instrumentation
- **Tracing:** Filters out health check endpoints, tracks HTTP requests
- **Exporters:** OTLP exporter (configured via environment variable)

**Health Checks:**
- `/health` - All health checks must pass (readiness)
- `/alive` - Only "live" tagged checks must pass (liveness)
- Only mapped in Development environment

**Dependencies:**
- `Microsoft.Extensions.Http.Resilience` (v9.10.0)
- `Microsoft.Extensions.ServiceDiscovery` (v9.5.2)
- OpenTelemetry packages (v1.13.x)
- Target Framework: `net10.0`

**Project File:**
```xml
<Project Sdk="Microsoft.NET.Sdk">

  <PropertyGroup>
    <TargetFramework>net10.0</TargetFramework>
    <ImplicitUsings>enable</ImplicitUsings>
    <Nullable>enable</Nullable>
    <IsAspireSharedProject>true</IsAspireSharedProject>
  </PropertyGroup>

  <ItemGroup>
    <FrameworkReference Include="Microsoft.AspNetCore.App" />

    <PackageReference Include="Microsoft.Extensions.Http.Resilience" Version="9.10.0" />
    <PackageReference Include="Microsoft.Extensions.ServiceDiscovery" Version="9.5.2" />
    <PackageReference Include="OpenTelemetry.Exporter.OpenTelemetryProtocol" Version="1.13.1" />
    <PackageReference Include="OpenTelemetry.Extensions.Hosting" Version="1.13.1" />
    <PackageReference Include="OpenTelemetry.Instrumentation.AspNetCore" Version="1.13.0" />
    <PackageReference Include="OpenTelemetry.Instrumentation.Http" Version="1.13.0" />
    <PackageReference Include="OpenTelemetry.Instrumentation.Runtime" Version="1.13.0" />
  </ItemGroup>

</Project>
```

---

## **4. React Frontend Project**

**Structure:**
- Built with **Vite** as the build tool
- Uses **React 19.1.1** with React DOM
- Entry point: `index.html` → `main.jsx` → `App.jsx`

### **Vite Configuration (`vite.config.js`)**

**Key Features:**
- Uses `@vitejs/plugin-react` for React support
- **Proxy Configuration:** Proxies `/api` requests to the backend API service
  - Target: `process.env.APISERVICE_HTTPS || process.env.APISERVICE_HTTP` (provided by Aspire)
  - `changeOrigin: true` - Changes host header to match target
  - `secure: false` - Allows self-signed certificates in development
- **Build Configuration:**
  - Output directory: `dist`
  - Entry point: `./index.html`

**Complete Code:**
```javascript
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {

  return {
    plugins: [react()],
    server:{
      proxy: {
        '/api': {
          target: process.env.APISERVICE_HTTPS || process.env.APISERVICE_HTTP,
          changeOrigin: true,
          secure: false
        }
      }
    },
    build:{
      outDir: 'dist',
      rollupOptions: {
        input: './index.html'
      }
    }
  }
})
```

### **Main Component (`App.jsx`)**

**Functionality:**

1. **State Management:**
   - `weatherData` - Stores fetched weather forecast array
   - `count` - Counter state (unused, leftover from template)

2. **Data Fetching:**
   - `getWeather()` function fetches from `/api/weatherforecast`
   - Uses native `fetch()` API
   - Parses JSON response and updates state
   - Error handling with console logging
   - `useEffect()` hook calls `getWeather()` on component mount

3. **UI Rendering:**
   - Displays "Weather forecast" heading
   - Shows loading message if data is undefined
   - Renders a **table** with weather data:
     - **Columns:** Date, Temp (°C), Temp (°F), Summary
     - **Rows:** Maps over `weatherData` array
     - Date formatted using `toLocaleDateString()`
     - Accessibility: `aria-label` attributes on temperature headers

**Complete Code:**
```jsx
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
```

### **Entry Point (`main.jsx`)**

```jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

### **HTML Entry (`index.html`)**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>myreactapp.web</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

### **Package Configuration (`package.json`)**

```json
{
  "name": "myreactapp.web",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint .",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^19.1.1",
    "react-dom": "^19.1.1"
  },
  "devDependencies": {
    "@eslint/js": "^9.36.0",
    "@types/react": "^19.1.16",
    "@types/react-dom": "^19.1.9",
    "@vitejs/plugin-react": "^5.0.4",
    "eslint": "^9.36.0",
    "eslint-plugin-react-hooks": "^5.2.0",
    "eslint-plugin-react-refresh": "^0.4.22",
    "globals": "^16.4.0",
    "vite": "^7.1.7"
  }
}
```

---

## **How It Works Together**

### **Development Mode:**
1. AppHost starts both API and React dev server
2. Aspire injects `APISERVICE_HTTPS`/`APISERVICE_HTTP` environment variables into Vite
3. Vite proxy forwards `/api/*` requests to the backend
4. React app fetches weather data and displays it in a table

### **Production/Container Mode:**
1. Vite builds React app to `dist` folder
2. AppHost's `PublishWithContainerFiles` copies React build into API's `wwwroot`
3. API serves both:
   - The React SPA (via `UseFileServer()`)
   - The `/api/weatherforecast` endpoint
4. Single container deployment

### **Service Discovery:**
- Frontend has a reference to the API service
- Aspire automatically resolves service URLs
- No hardcoded URLs needed

### **Observability:**
- Both services use ServiceDefaults for OpenTelemetry
- Distributed tracing across frontend and backend
- Health checks for orchestration

---

## **Key Points for Angular Version**

To create an Angular equivalent, you'll need:

1. **Replace Vite with Angular CLI** configuration
2. **Use `AddNpmApp` instead of `AddViteApp`** in AppHost (or similar Angular-specific method if available)
3. **Replicate the proxy configuration** in `angular.json` or `proxy.conf.json`:
   ```json
   {
     "/api": {
       "target": "http://localhost:5000",
       "secure": false,
       "changeOrigin": true
     }
   }
   ```
4. **Create an Angular component** that:
   - Uses `HttpClient` to fetch from `/api/weatherforecast`
   - Displays data in a table (similar structure)
   - Uses `ngOnInit()` for initial data fetch
5. **Keep the same backend** (MyReactApp.api) - it's framework-agnostic
6. **Keep the same ServiceDefaults** project
7. **Update AppHost** to reference Angular project instead of React
8. **Match the weather data interface** in TypeScript:
   ```typescript
   interface WeatherForecast {
     date: string;
     temperatureC: number;
     temperatureF: number;
     summary: string;
   }
   ```

### **Angular Component Example:**

```typescript
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

interface WeatherForecast {
  date: string;
  temperatureC: number;
  temperatureF: number;
  summary: string;
}

@Component({
  selector: 'app-weather',
  template: `
    <h1>Weather forecast</h1>
    <p>This component demonstrates fetching data from the server.</p>
    
    <p *ngIf="!weatherData"><em>Loading... Please refresh once the ASP.NET backend has started.</em></p>
    
    <table *ngIf="weatherData" id="weatherTable">
      <thead>
        <tr>
          <th>Date</th>
          <th aria-label="Temperature in Celsius">Temp. (C)</th>
          <th aria-label="Temperature in Fahrenheit">Temp. (F)</th>
          <th aria-label="Weather forecast summary">Summary</th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let forecast of weatherData">
          <td>{{ forecast.date | date }}</td>
          <td>{{ forecast.temperatureC }}</td>
          <td>{{ forecast.temperatureF }}</td>
          <td>{{ forecast.summary }}</td>
        </tr>
      </tbody>
    </table>
  `
})
export class WeatherComponent implements OnInit {
  weatherData: WeatherForecast[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.getWeather();
  }

  getWeather(): void {
    this.http.get<WeatherForecast[]>('/api/weatherforecast')
      .subscribe({
        next: (data) => this.weatherData = data,
        error: (error) => console.error('Error fetching weather data:', error)
      });
  }
}
```

The core architecture, API contract, and Aspire orchestration remain identical—only the frontend framework changes.
