# Next.js with Aspire Sample

This sample demonstrates how to integrate a Next.js frontend with an Aspire backend.

## Structure

- **MyNextJsApp.AppHost**: Aspire orchestrator that manages both the API and frontend
- **MyNextJsApp.api**: ASP.NET Core Web API backend that provides weather forecast data
- **MyNextJsApp.ServiceDefaults**: Shared Aspire service defaults for health checks and telemetry
- **mynextjsapp.web**: Next.js frontend application

## Running Locally

### Development Mode

1. From the repository root, run the AppHost using the Aspire CLI:
   ```bash
   aspire run --project nextjs/MyNextJsApp.AppHost/MyNextJsApp.AppHost.csproj
   ```

   > **Note:** The `--project` parameter is required because this repository contains multiple Aspire apps.

2. The Aspire dashboard will open, showing both the API and frontend services
3. Click on the frontend URL to open the Next.js application

### How Dev Proxy Works

During development:
- Next.js dev server runs on a port assigned by Aspire (via the `PORT` environment variable)
- Aspire injects environment variables: `APISERVICENEXTJS_HTTPS` and `APISERVICENEXTJS_HTTP`
- The Next.js config (`next.config.ts`) uses these variables to proxy `/api/*` requests to the backend
- No hardcoded URLs - everything is configured dynamically by Aspire

## Production Build

### How Publish Serves Frontend from API wwwroot

For production deployment:
1. Next.js is built with `output: 'export'` to generate static files in the `out/` directory
2. The Aspire publish process copies these static files into the API's `wwwroot` folder
3. The API serves:
   - Static frontend files (HTML, CSS, JS) via `UseFileServer()`
   - The weather API endpoint at `/api/weatherforecast`
4. In containerized environments, nginx can also be used to serve the frontend with API proxying

### Building

```bash
# Build the .NET solution
dotnet build MyNextJsApp.sln -c Release

# Build the Next.js frontend
cd mynextjsapp.web
npm run build
```

## Key Features

- **Service Discovery**: Aspire handles service-to-service communication
- **Health Checks**: API includes health endpoints monitored by Aspire
- **Unique Service Names**: 
  - API service: `apiservicenextjs`
  - Frontend service: `frontendnextjs`
  - These unique names prevent environment variable collisions in the monorepo
- **No Hardcoded URLs**: All service URLs are injected by Aspire at runtime
- **Production Ready**: Static export for efficient hosting alongside the API

## Environment Variables

The Next.js application reads these environment variables injected by Aspire:
- `APISERVICENEXTJS_HTTPS`: HTTPS URL of the API service
- `APISERVICENEXTJS_HTTP`: HTTP URL of the API service
- `PORT`: Port for the Next.js dev server to listen on

These are automatically set by Aspire based on the service names in `AppHost.cs`.
