# Astro with Aspire Sample

This sample demonstrates how to use [Astro](https://astro.build/) with [Aspire](https://learn.microsoft.com/dotnet/aspire/) for local development and production deployment.

## Architecture

This solution consists of:
- **MyAstroApp.AppHost** - Aspire orchestrator that manages the development experience
- **MyAstroApp.api** - ASP.NET Core Web API backend that serves the weather forecast data
- **MyAstroApp.ServiceDefaults** - Shared Aspire service defaults (health checks, OpenTelemetry)
- **myastroapp.web** - Astro frontend application

## Aspire Service Names (Important!)

This sample uses unique service names to avoid environment variable collisions in the monorepo:
- API service: `apiserviceastro`
- Frontend service: `frontendastro`

These names generate environment variables that Aspire automatically provides:
- `APISERVICEASTRO_HTTPS` - HTTPS endpoint for the API service
- `APISERVICEASTRO_HTTP` - HTTP endpoint for the API service

## How It Works

### Development Mode

When you run the AppHost project, Aspire will:
1. Start the ASP.NET Core API backend
2. Start the Astro dev server (Vite-based)
3. Open the Aspire dashboard showing both services

The Astro app is configured to proxy API requests to the backend using the Aspire-provided environment variables:

```javascript
// astro.config.mjs
const apiUrl = process.env.APISERVICEASTRO_HTTPS || process.env.APISERVICEASTRO_HTTP;

export default defineConfig({
  vite: {
    server: {
      port: parseInt(process.env.PORT) || 4321,
      proxy: apiUrl ? {
        '/api': {
          target: apiUrl,
          changeOrigin: true,
          secure: false,
        }
      } : undefined
    }
  }
});
```

### Production/Container Mode

For production deployment:
1. The Astro app is built to static files (`npm run build` outputs to `dist/`)
2. The static files are copied into the API's `wwwroot` folder
3. The API serves both the static frontend and the `/api/weatherforecast` endpoint
4. The API uses `app.UseFileServer()` to serve the static files

This is configured in the AppHost:

```csharp
apiService.PublishWithContainerFiles(frontend, "./wwwroot");
```

## Running the Sample

### Prerequisites
- [.NET 10 SDK](https://dotnet.microsoft.com/download/dotnet/10.0)
- [Node.js 20+](https://nodejs.org/)
- [Docker](https://www.docker.com/) (optional, for container builds)

### Run Locally

1. Install frontend dependencies:
   ```bash
   cd myastroapp.web
   npm install
   cd ..
   ```

2. From the repository root, run the AppHost using the Aspire CLI:
   ```bash
   aspire run --project astro/MyAstroApp.AppHost/MyAstroApp.AppHost.csproj
   ```

   > **Note:** The `--project` parameter is required because this repository contains multiple Aspire apps.

3. Open the Aspire dashboard (URL shown in console) and click on the frontend endpoint to view the application.

## Project Structure

```
astro/
├── MyAstroApp.AppHost/       # Aspire orchestrator
│   └── AppHost.cs            # Configures services
├── MyAstroApp.api/           # ASP.NET Core API
│   └── Program.cs            # API endpoints
├── MyAstroApp.ServiceDefaults/ # Shared Aspire defaults
│   └── Extensions.cs
├── myastroapp.web/           # Astro frontend
│   ├── src/
│   │   └── pages/
│   │       └── index.astro   # Main page with weather table
│   ├── astro.config.mjs      # Astro config with Vite proxy
│   ├── Dockerfile            # Container image definition
│   └── default.conf.template # Nginx config for production
└── MyAstroApp.sln            # Solution file
```

## Key Features

- **Service Discovery**: Frontend automatically discovers API endpoint via Aspire environment variables
- **Health Checks**: API includes health check endpoint at `/health`
- **OpenTelemetry**: Built-in telemetry for distributed tracing
- **Hot Reload**: Both frontend and backend support hot reload during development
- **Single Deployment**: Production mode serves frontend from API's `wwwroot`

## API Endpoints

- `GET /api/weatherforecast` - Returns 5-day weather forecast
- `GET /health` - Health check endpoint (dev only)
- `GET /alive` - Liveness check endpoint (dev only)

## Environment Variables

The following environment variables are automatically set by Aspire:

- `APISERVICEASTRO_HTTPS` - HTTPS URL of the API service
- `APISERVICEASTRO_HTTP` - HTTP URL of the API service
- `PORT` - Port for the Astro dev server to listen on

## Learn More

- [Astro Documentation](https://docs.astro.build/)
- [Aspire Documentation](https://learn.microsoft.com/dotnet/aspire/)
- [Aspire with JavaScript Samples](https://github.com/dotnet/aspire-samples/tree/main/samples/aspire-with-javascript)
