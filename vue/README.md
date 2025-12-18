# Vue Aspire Sample

This sample demonstrates a Vue 3 frontend with an ASP.NET Core API backend, orchestrated using .NET Aspire.

## Project Structure

- **MyVueApp.AppHost** - Aspire orchestrator that manages the API and frontend
- **MyVueApp.api** - ASP.NET Core Web API with weather forecast endpoint
- **MyVueApp.ServiceDefaults** - Shared Aspire service defaults (health checks, OpenTelemetry, resilience)
- **myvueapp.web** - Vue 3 frontend (Vite-based)

## Running in Development

1. Navigate to the `vue` folder
2. Run the AppHost:
   ```bash
   dotnet run --project MyVueApp.AppHost
   ```
3. The Aspire dashboard will open, showing both the API and frontend services
4. Click on the frontend endpoint to view the Vue app

## How the Proxy Works

In development, the Vue dev server proxies `/api/*` requests to the backend API service using environment variables provided by Aspire:

- `APISERVICEVUE_HTTPS` - HTTPS endpoint of the API service
- `APISERVICEVUE_HTTP` - HTTP endpoint of the API service

The proxy configuration in `vite.config.js`:
```javascript
proxy: {
  '/api': {
    target: process.env.APISERVICEVUE_HTTPS || process.env.APISERVICEVUE_HTTP,
    changeOrigin: true,
    secure: false
  }
}
```

## Production Build

In production/container mode:
1. The Vue app is built to the `dist/` folder
2. The API publishes with the Vue build output copied into `wwwroot`
3. The API serves both:
   - Static frontend files via `UseFileServer()`
   - The weather API at `/api/weatherforecast`

## Building

```bash
# Build the .NET solution
dotnet build MyVueApp.sln -c Release

# Build the Vue frontend
cd myvueapp.web
npm install
npm run build
```

## Docker/Container Build

The frontend container uses a multi-stage build:
1. Node.js stage builds the Vue app
2. Nginx stage serves the static files with proxy configuration for the API

## Technologies

- .NET 10.0 with Aspire 13
- Vue 3 with Composition API
- Vite 7
- ASP.NET Core Web API with OpenAPI
