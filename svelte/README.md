# Svelte Aspire Sample

This sample demonstrates a Svelte frontend with an ASP.NET Core API backend, orchestrated using .NET Aspire.

## Project Structure

- **MySvelteApp.AppHost** - Aspire orchestrator that manages the API and frontend
- **MySvelteApp.api** - ASP.NET Core Web API with weather forecast endpoint
- **MySvelteApp.ServiceDefaults** - Shared Aspire service defaults (health checks, OpenTelemetry, resilience)
- **mysvelteapp.web** - Svelte frontend (Vite-based)

## Running in Development

1. Navigate to the `svelte` folder
2. Run the AppHost:
   ```bash
   dotnet run --project MySvelteApp.AppHost
   ```
3. The Aspire dashboard will open, showing both the API and frontend services
4. Click on the frontend endpoint to view the Svelte app

## How the Proxy Works

In development, the Svelte dev server proxies `/api/*` requests to the backend API service using environment variables provided by Aspire:

- `APISERVICESVELTE_HTTPS` - HTTPS endpoint of the API service
- `APISERVICESVELTE_HTTP` - HTTP endpoint of the API service

The proxy configuration in `vite.config.js`:
```javascript
proxy: {
  '/api': {
    target: process.env.APISERVICESVELTE_HTTPS || process.env.APISERVICESVELTE_HTTP,
    changeOrigin: true,
    secure: false
  }
}
```

## Production Build

In production/container mode:
1. The Svelte app is built to the `dist/` folder
2. The API publishes with the Svelte build output copied into `wwwroot`
3. The API serves both:
   - Static frontend files via `UseFileServer()`
   - The weather API at `/api/weatherforecast`

## Building

```bash
# Build the .NET solution
dotnet build MySvelteApp.sln -c Release

# Build the Svelte frontend
cd mysvelteapp.web
npm install
npm run build
```

## Docker/Container Build

The frontend container uses a multi-stage build:
1. Node.js stage builds the Svelte app
2. Nginx stage serves the static files with proxy configuration for the API

## Technologies

- .NET 10.0 with Aspire 13
- Svelte 5
- Vite 6
- ASP.NET Core Web API with OpenAPI
