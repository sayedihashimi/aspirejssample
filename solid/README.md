# SolidJS Aspire Sample

This sample demonstrates a SolidJS frontend application integrated with .NET Aspire.

## Structure

- **MySolidApp.AppHost** - .NET Aspire orchestrator
- **MySolidApp.api** - ASP.NET Core Web API backend
- **MySolidApp.ServiceDefaults** - Aspire ServiceDefaults shared project
- **mysolidapp.web** - SolidJS frontend (Vite-based)

## Running Locally

1. Make sure you have .NET 10 SDK installed
2. Make sure you have Node.js 20+ installed
3. Navigate to the `solid` directory
4. Run the AppHost:
   ```bash
   dotnet run --project MySolidApp.AppHost
   ```
5. Open the Aspire Dashboard URL shown in the console
6. Access the frontend through the dashboard

## How It Works

### Development Mode

When running the AppHost, Aspire:
1. Starts the API service on a dynamic port
2. Starts the SolidJS dev server (Vite) on a dynamic port
3. Injects environment variables for service discovery:
   - `APISERVICESOLID_HTTPS` - HTTPS URL of the API service
   - `APISERVICESOLID_HTTP` - HTTP URL of the API service
   - `PORT` - Port for the frontend dev server

The Vite dev server (configured in `vite.config.ts`) proxies `/api/*` requests to the API service using these environment variables.

### Production/Container Mode

In production:
1. The SolidJS app is built (`npm run build`) producing static files in `dist/`
2. The API publishes with the frontend build output copied into `wwwroot`
3. The API serves:
   - Static frontend files via `UseFileServer()` at the root
   - API endpoints under `/api/weatherforecast`
4. Both services are containerized:
   - API uses .NET container support
   - Frontend uses Docker with nginx (see `Dockerfile` and `default.conf.template`)

## Service Names

This sample uses unique service names to avoid conflicts in monorepo setups:
- API service: `apiservicesolid`
- Frontend service: `frontendsolid`

These names determine the environment variable names that Aspire injects (e.g., `APISERVICESOLID_HTTPS`).

## Building

Build the solution:
```bash
dotnet build MySolidApp.sln -c Release
```

Build the frontend:
```bash
cd mysolidapp.web
npm run build
```

Build container images (requires Docker):
```bash
# API container
dotnet publish MySolidApp.api/MySolidApp.api.csproj -c Release /t:PublishContainer

# Frontend container
docker build -t frontendsolid mysolidapp.web
```
