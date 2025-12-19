# Nuxt.js Sample with Aspire

This sample demonstrates a Nuxt.js 3 frontend integrated with Aspire orchestration, featuring an ASP.NET Core Web API backend.

## Architecture

The solution consists of:

- **MyNuxtApp.AppHost**: Aspire orchestrator that manages the entire application
- **MyNuxtApp.api**: ASP.NET Core Web API backend providing weather forecast data
- **MyNuxtApp.ServiceDefaults**: Shared Aspire service defaults (health checks, telemetry, service discovery)
- **mynuxtapp.web**: Nuxt.js 3 frontend application (Vite-based)

## Running in Development

From the repository root, run the AppHost using the Aspire CLI:

```bash
aspire run --project nuxtjs/MyNuxtApp.AppHost/MyNuxtApp.AppHost.csproj
```

> **Note:** The `--project` parameter is required because this repository contains multiple Aspire apps.

This will:
1. Start the Aspire dashboard
2. Launch the ASP.NET Core API
3. Start the Nuxt.js dev server with hot reload

The Aspire dashboard will show URLs for both services.

## How It Works

### Development Mode

In development, the Nuxt.js dev server:
- Listens on the port specified by Aspire via the `PORT` environment variable
- Proxies API requests (`/api/*`) to the backend using environment variables:
  - `APISERVICENUXTJS_HTTPS` or `APISERVICENUXTJS_HTTP`
- These environment variables are automatically injected by Aspire based on service names

### Production/Container Mode

For production builds:
1. The Nuxt.js app is built as a static site (`npm run generate`)
2. The static output (`.output/public/`) is copied into the API's `wwwroot` folder
3. The API serves both:
   - Static frontend files via `UseFileServer()`
   - Weather API endpoint at `/api/weatherforecast`
4. The frontend is packaged as a Docker container using nginx for serving

## Service Names

This sample uses unique service names to avoid conflicts with other samples in the monorepo:
- API service: `apiservicenuxtjs`
- Frontend service: `frontendnuxtjs`

These names generate environment variables like `APISERVICENUXTJS_HTTP(S)` and `FRONTENDNUXTJS_HTTP(S)`.

## Key Files

- `MyNuxtApp.AppHost/AppHost.cs`: Aspire orchestration configuration
- `MyNuxtApp.api/Program.cs`: API endpoints and file server configuration
- `mynuxtapp.web/nuxt.config.ts`: Nuxt configuration with dev proxy
- `mynuxtapp.web/app.vue`: Weather forecast UI component
- `mynuxtapp.web/Dockerfile`: Container build configuration
- `mynuxtapp.web/default.conf.template`: Nginx configuration for production

## Building

Build the entire solution:

```bash
dotnet build MyNuxtApp.sln
```

Build the Nuxt.js frontend:

```bash
cd mynuxtapp.web
npm run build
# or for static generation:
npm run generate
```

## Technology Stack

- .NET 10.0
- Aspire 13
- Nuxt.js 3 (Vue 3 with Vite)
- ASP.NET Core Web API
- OpenTelemetry for observability
