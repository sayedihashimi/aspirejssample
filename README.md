# Aspire JavaScript Samples

[![CI](https://github.com/sayedihashimi/aspirejssample/actions/workflows/build.yml/badge.svg)](https://github.com/sayedihashimi/aspirejssample/actions/workflows/build.yml)

This repository contains sample projects demonstrating how to use [Aspire](https://learn.microsoft.com/dotnet/aspire/) to orchestrate JavaScript/Node.js frontend applications with ASP.NET Core Web API backends.

Each sample follows the same pattern:
- An **ASP.NET Core Web API** backend serving weather forecast data
- A **JavaScript frontend** (React, Vue, Angular, etc.) that fetches and displays the data
- An **Aspire AppHost** that orchestrates both services with proper service discovery

## Sample Projects

| Framework | Folder | AppHost Project |
|-----------|--------|-----------------|
| Angular | `angular/` | `angular/MyAngularApp.AppHost/MyAngularApp.AppHost.csproj` |
| Astro | `astro/` | `astro/MyAstroApp.AppHost/MyAstroApp.AppHost.csproj` |
| Next.js | `nextjs/` | `nextjs/MyNextJsApp.AppHost/MyNextJsApp.AppHost.csproj` |
| Nuxt.js | `nuxtjs/` | `nuxtjs/MyNuxtApp.AppHost/MyNuxtApp.AppHost.csproj` |
| React | `react/` | `react/MyReactApp.AppHost/MyReactApp.AppHost.csproj` |
| Solid | `solid/` | `solid/MySolidApp.AppHost/MySolidApp.AppHost.csproj` |
| Svelte | `svelte/` | `svelte/MySvelteApp.AppHost/MySvelteApp.AppHost.csproj` |
| Vue | `vue/` | `vue/MyVueApp.AppHost/MyVueApp.AppHost.csproj` |

## Prerequisites

- [.NET 10.0 SDK](https://dotnet.microsoft.com/download/dotnet/10.0) or later
- [Node.js](https://nodejs.org/) (version 20 or later recommended)
- [Aspire CLI](https://learn.microsoft.com/dotnet/aspire/fundamentals/aspire-cli) (`aspire` command)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (for running container images)

### Install Aspire CLI

```bash
# Install the Aspire CLI
curl -sSL https://aspire.dev/install.sh | bash

# Or on Windows PowerShell
iex "& { $(irm https://aspire.dev/install.ps1) }"
```

## Running a Sample Locally

Use `aspire run` with the `--project` flag to start any sample:

```bash
# Run the Vue sample
aspire run --project vue/MyVueApp.AppHost/MyVueApp.AppHost.csproj

# Run the React sample
aspire run --project react/MyReactApp.AppHost/MyReactApp.AppHost.csproj

# Run the Angular sample
aspire run --project angular/MyAngularApp.AppHost/MyAngularApp.AppHost.csproj

# Run the Svelte sample
aspire run --project svelte/MySvelteApp.AppHost/MySvelteApp.AppHost.csproj

# Run the Solid sample
aspire run --project solid/MySolidApp.AppHost/MySolidApp.AppHost.csproj

# Run the Astro sample
aspire run --project astro/MyAstroApp.AppHost/MyAstroApp.AppHost.csproj

# Run the Next.js sample
aspire run --project nextjs/MyNextJsApp.AppHost/MyNextJsApp.AppHost.csproj

# Run the Nuxt.js sample
aspire run --project nuxtjs/MyNuxtApp.AppHost/MyNuxtApp.AppHost.csproj
```

This will:
1. Start the ASP.NET Core Web API backend
2. Start the JavaScript frontend dev server
3. Open the Aspire dashboard in your browser where you can see logs, traces, and endpoints

> **Note:** The first run may take a moment to install npm dependencies for the frontend.

## Try Pre-built Container Images

Pre-built container images are available on GitHub Container Registry (GHCR). Each **apiservice** image contains both the API backend and the frontend bundled together, so you only need to pull one image to try a sample.

📦 **Browse all packages:** [github.com/sayedihashimi/aspirejssample/packages](https://github.com/sayedihashimi/aspirejssample/packages)

### Pull and Run an Image

```bash
# Pull the Vue sample image
docker pull ghcr.io/sayedihashimi/vue-apiservicevue:latest

# Run it (use any available port on your machine, e.g., 8080)
docker run -d --name vue-apiservice -p 8080:8080 ghcr.io/sayedihashimi/vue-apiservicevue:latest

# Open in browser
# http://localhost:8080
```

Then open [http://localhost:8080](http://localhost:8080) (or whatever port you chose) in your browser to see the weather forecast app.

### Available Images

Each sample has an apiservice image that includes the frontend:

| Sample | Image |
|--------|-------|
| Vue | `ghcr.io/sayedihashimi/vue-apiservicevue:latest` |
| React | `ghcr.io/sayedihashimi/react-apiservice:latest` |
| Angular | `ghcr.io/sayedihashimi/angular-apiserviceangular:latest` |
| Svelte | `ghcr.io/sayedihashimi/svelte-apiservicesvelte:latest` |
| Solid | `ghcr.io/sayedihashimi/solid-apiservicesolid:latest` |
| Astro | `ghcr.io/sayedihashimi/astro-apiserviceastro:latest` |
| Next.js | `ghcr.io/sayedihashimi/nextjs-apiservicenextjs:latest` |
| Nuxt.js | `ghcr.io/sayedihashimi/nuxtjs-apiservicenuxtjs:latest` |

### Stop and Remove Container

```bash
docker stop vue-apiservice
docker rm vue-apiservice
```

## How It Works

### Development Mode

When running with `aspire run`:
- The **AppHost** orchestrates both the API and frontend services
- The frontend runs via its dev server (`vite dev`, `ng serve`, `next dev`, etc.)
- Aspire injects environment variables for service discovery (e.g., `APISERVICEVUE_HTTPS`)
- The frontend's proxy configuration routes `/api/*` requests to the backend

### Production/Publish Mode

When building for production with `aspire do build`:
1. The frontend is built to static assets
2. `PublishWithContainerFiles` copies the frontend build output into the API's `wwwroot/` folder
3. The API serves both REST endpoints (`/api/*`) and static frontend files
4. A single container image is produced containing the complete application

## API Endpoints

Each sample exposes the same API:

- `GET /api/weatherforecast` - Returns weather forecast data
- `GET /health` - Health check endpoint

## Project Structure

Each sample follows this structure:

```
<framework>/
├── My<Framework>App.sln              # Solution file
├── My<Framework>App.AppHost/         # Aspire orchestrator
│   ├── AppHost.cs                    # Service definitions
│   └── *.csproj
├── My<Framework>App.api/             # ASP.NET Core Web API
│   ├── Program.cs
│   └── *.csproj
├── My<Framework>App.ServiceDefaults/ # Shared Aspire defaults
│   └── Extensions.cs
└── my<framework>app.web/             # JavaScript frontend
    ├── package.json
    ├── Dockerfile
    └── src/
```

## Related Documentation

- [Aspire Documentation](https://learn.microsoft.com/dotnet/aspire/)
- [Aspire CLI Reference](https://learn.microsoft.com/dotnet/aspire/fundamentals/aspire-cli)
- [Orchestrate Node.js apps in Aspire](https://learn.microsoft.com/dotnet/aspire/get-started/build-aspire-apps-with-nodejs)

## License

[MIT License](LICENSE) - Copyright (c) 2025 Sayed Ibrahim Hashimi
