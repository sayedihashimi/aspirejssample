# Angular Aspire Sample

This is an Angular sample that demonstrates .NET Aspire orchestration with an Angular frontend and ASP.NET Core Web API backend.

## Project Structure

- **MyAngularApp.sln** - Solution file containing all projects
- **MyAngularApp.AppHost/** - Aspire orchestrator project
- **MyAngularApp.api/** - ASP.NET Core Web API backend
- **MyAngularApp.ServiceDefaults/** - Shared Aspire service defaults
- **myangularapp.web/** - Angular frontend application

## Prerequisites

- [.NET 10.0 SDK](https://dotnet.microsoft.com/download/dotnet/10.0)
- [Node.js](https://nodejs.org/) (version 20 or later recommended)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (for container deployment)

## Getting Started

### Install Dependencies

1. Install npm packages for the Angular frontend:
   ```bash
   cd myangularapp.web
   npm install
   ```

### Run Locally

From the `angular/` folder, run the AppHost:

```bash
dotnet run --project MyAngularApp.AppHost
```

This will:
1. Start the ASP.NET Core Web API on a dynamic port
2. Start the Angular dev server on a dynamic port
3. Open the Aspire dashboard in your browser

The Angular app will automatically proxy `/api/*` requests to the API service.

## How It Works

### Development Mode

- The **AppHost** orchestrates both the API and frontend services
- Angular runs via `ng serve` with a proxy configuration (`proxy.conf.js`)
- The proxy reads `APISERVICEANGULAR_HTTPS` or `APISERVICEANGULAR_HTTP` environment variables (injected by Aspire) to route `/api/*` requests to the backend
- No hardcoded localhost URLs are used

### Production/Publish Mode

When publishing for production:
1. Angular is built via `npm run build` producing static assets in `dist/myangularapp.web/browser/`
2. The AppHost uses `PublishWithContainerFiles` to copy Angular build output into the API's `wwwroot/` folder
3. The API serves both the API endpoints (`/api/*`) and static frontend files via `UseFileServer()`

## API Endpoints

- `GET /api/weatherforecast` - Returns weather forecast data (Date, TemperatureC, TemperatureF, Summary)
- `GET /health` - Health check endpoint

## Key Configuration Files

### proxy.conf.js (Dev Proxy)

```javascript
const target = process.env.APISERVICEANGULAR_HTTPS || process.env.APISERVICEANGULAR_HTTP;

const PROXY_CONFIG = [
  {
    context: ['/api'],
    target: target,
    secure: false,
    changeOrigin: true
  }
];

module.exports = PROXY_CONFIG;
```

### AppHost.cs

```csharp
var apiService = builder.AddProject<Projects.MyAngularApp_api>("apiserviceangular")
                        .WithHttpHealthCheck("/health")
                        .WithExternalHttpEndpoints();

var frontend = builder.AddJavaScriptApp("frontendangular", "../myangularapp.web", "start")
                        .WithReference(apiService)
                        .WaitFor(apiService)
                        .WithExternalHttpEndpoints();

apiService.PublishWithContainerFiles(frontend, "./wwwroot");
```

## Build Commands

Build the .NET solution:
```bash
dotnet build MyAngularApp.sln
```

Build the Angular app:
```bash
cd myangularapp.web
npm run build
```

## Related Documentation

- [.NET Aspire Documentation](https://learn.microsoft.com/en-us/dotnet/aspire/)
- [Orchestrate Node.js apps in Aspire](https://learn.microsoft.com/en-us/dotnet/aspire/get-started/build-aspire-apps-with-nodejs)
- [Angular Documentation](https://angular.dev/)
