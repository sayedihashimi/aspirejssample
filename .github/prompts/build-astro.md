YOU ARE COPILOT WORKING INSIDE THIS REPO WORKSPACE.

GOAL
Create a new Astro sample (Vite-based) that is functionally equivalent to the existing Aspire 13 React sample under `react/` in this repo:
- Repo: https://github.com/sayedihashimi/aspirejssample
- React sample folder: `react/`
- Create an Astro sample folder: `astro/`
- The Astro sample must implement the same Aspire architecture and runtime behavior as the React one:
  - AppHost orchestrator
  - ASP.NET Core Web API backend
  - Astro dev server (Vite-based) with proxy to `/api`
  - Production publish packs the built frontend into the API's `wwwroot` and serves it via `UseFileServer()`
  - Health checks + ServiceDefaults
  - No hardcoded URLs; use Aspire-provided env vars for service URLs

Follow the instructions in ./memorizer.md.

IMPORTANT: UNIQUE SERVICE NAMES (NO CONFLICTS)
- Service names MUST be unique across samples to avoid env var collisions.
- For THIS Astro sample:
  - API service name MUST be: `apiserviceastro`
  - Frontend service name MUST be: `frontendastro`
- Therefore, the Astro dev server MUST proxy `/api/*` to:
  - `process.env.APISERVICEASTRO_HTTPS || process.env.APISERVICEASTRO_HTTP`
  (Aspire derives env var names from the service name; verify exact casing/format by running the app or inspecting Aspire docs, and align the code accordingly.)

IMPORTANT RESOURCES (MUST CONSULT WHEN NEEDED)
When you need any Aspire-specific step, consult these sources in priority order:
1) Official Aspire 13 docs: https://aspire.dev/
2) Aspire samples at https://github.com/dotnet/aspire-samples/tree/main/samples/aspire-with-javascript
3) Code in THIS workspace (especially `react/` sample)
4) Reference repo: https://github.com/sayedihashimi/todojsaspire
5) The commit history in this repo (commands are in commit messages). Use:
   `git --no-pager log`
   Also open and inspect files at the commits if helpful.

PROCESS REQUIREMENTS (THINKING MODE)
- Use "thinking mode": plan privately first, then execute with small, verifiable steps.
- If you have any questions, ask them.
- Prefer changes that mirror the `react/` solution structure and naming conventions unless there's a strong reason to diverge.
- Keep diffs minimal and predictable. Use clear commits.
- This will be iterative. Plan, Update, Verify. For verify do things like running a build to ensure no errors and make sure that the app runs successfully. If not, iterate until it's working.
- You will create a full TODO list
- When executing complete all TODO list items, no temporary code.

WHAT "EQUIVALENT" MEANS (ACCEPTANCE CRITERIA)
Your final result is correct when all of the following are true:

A) Folder + solution layout
- A new folder `astro/` exists at repo root (sibling to `react/`).
- Inside `astro/` there is an Aspire solution equivalent to React's:
  - *.AppHost (Aspire orchestrator)
  - *.api (ASP.NET Core Web API backend)
  - *.ServiceDefaults (Aspire ServiceDefaults shared project)
  - Astro frontend project (Vite-based Astro app)
- Solution file exists and includes all projects (and the frontend project representation consistent with how `react/` does it; follow the workspace pattern).

B) Dev mode behavior
- Running AppHost starts:
  - the API project
  - the Astro dev server
- The Astro dev server proxies `/api/*` to the API service using Aspire-injected env vars:
  - `APISERVICEASTRO_HTTPS` and/or `APISERVICEASTRO_HTTP`
- Astro UI fetches `/api/weatherforecast` and displays a table with columns:
  - Date, Temp (C), Temp (F), Summary
- No hardcoded API base URL in Astro source; always relative `/api/...`

C) Production/container behavior
- The API publishes with the Astro build output copied into API `wwwroot` (same idea as React's `PublishWithContainerFiles(frontend, "./wwwroot")`).
- The API serves:
  - static frontend files via `UseFileServer()`
  - the weather endpoint at `/api/weatherforecast`
- Don't break existing CI behavior in `.github/workflows/build.yml`.

D) Quality gates
- `dotnet build` for the Astro solution succeeds.
- `npm run build` for the Astro app succeeds.
- Existing samples remain unaffected.

WHAT TO IMPLEMENT (MIRROR THE REACT SAMPLE)
1) Backend API project
- Copy the API backend pattern from `react/`:
  - `builder.Services.AddOpenApi();`
  - `builder.AddServiceDefaults();`
  - `app.MapDefaultEndpoints();`
  - `app.UseHttpsRedirection();`
  - weather endpoint under `/api/weatherforecast` (match routing in React sample)
  - `app.UseFileServer();`
- Keep response shape: date, temperatureC, temperatureF, summary

2) ServiceDefaults project
- Reuse the same ServiceDefaults approach and code from `react/` (don't reinvent).

3) AppHost project (UNIQUE SERVICE NAMES)
- Mirror React's AppHost behavior, but with unique names:
  - `DistributedApplication.CreateBuilder(args)`
  - docker compose env line if present in React sample: `builder.AddDockerComposeEnvironment("env")`
  - register API `"apiserviceastro"` with health check + external endpoints
  - register frontend `"frontendastro"` as a Vite app pointing to the Astro app directory
    - Prefer the same Aspire JS hosting method as React uses (likely `AddViteApp` since Astro uses Vite)
  - `.WithReference(apiService)` and `.WaitFor(apiService)` and `.WithExternalHttpEndpoints()`
  - Production publish:
    - `apiService.PublishWithContainerFiles(frontend, "./wwwroot");`
    - Ensure the Astro build output directory is `dist/` (default for Astro static builds).

4) Astro frontend project (Vite + Astro)
- Create an Astro app using Vite under `astro/<frontend-folder>`.
- Implement a single main page that:
  - fetches `/api/weatherforecast` on page load
  - displays the same table as React sample
  - shows a "Loading..." message until data is available
- Dev proxy (Vite):
  - Configure `astro.config.mjs` with Vite proxy for `/api` using:
    - `process.env.APISERVICEASTRO_HTTPS || process.env.APISERVICEASTRO_HTTP`
  - In Astro, you configure Vite settings via `vite` property in the config
  - `secure: false`, `changeOrigin: true`
- Build:
  - Astro by default outputs to `dist/` for static builds
  - `npm run build` outputs static HTML/JS/CSS files
  - Ensure output is suitable for copying into API `wwwroot`

NAMING / CONSISTENCY
- Prefer to follow the same naming style as the React sample, but under `astro/`.
- Keep Aspire service names unique to avoid conflicts with other samples in the monorepo:
  - API service name MUST be `"apiserviceastro"`
  - Frontend service name MUST be `"frontendastro"`
  This ensures env var names like `APISERVICEASTRO_HTTP(S)` are unique to the Astro sample.

RECOMMENDED ASTRO IMPLEMENTATION DETAILS (KEEP IT SIMPLE)
- Use Astro (latest stable version) with Vite.
- Keep it minimal:
  - Main page (`src/pages/index.astro`) fetches and renders table.
  - Use client-side JavaScript for data fetching (since Astro is primarily for static sites)
  - Alternatively, use a client component (React, Vue, or Svelte island) if preferred
  - Date rendering: `new Date(forecast.date).toLocaleDateString()` like React sample.
- Astro is designed for static site generation, which is perfect for this use case
- Build output goes to `dist/` by default

Example outline for `src/pages/index.astro` (you may adapt):
```astro
---
// Server-side code (runs at build time)
---

<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width" />
    <title>Weather Forecast</title>
  </head>
  <body>
    <h1>Weather forecast</h1>
    <p>This component demonstrates fetching data from the server.</p>
    <div id="content">Loading... Please refresh once the ASP.NET backend has started.</div>
    
    <script>
      // Client-side code
      // WeatherForecast type: { date: string, temperatureC: number, temperatureF: number, summary?: string | null }

      async function loadWeather() {
        try {
          const response = await fetch('/api/weatherforecast');
          const forecasts = await response.json();
          
          const content = document.getElementById('content');
          if (content) {
            content.innerHTML = `
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Temp. (C)</th>
                    <th>Temp. (F)</th>
                    <th>Summary</th>
                  </tr>
                </thead>
                <tbody>
                  ${forecasts.map(f => `
                    <tr>
                      <td>${new Date(f.date).toLocaleDateString()}</td>
                      <td>${f.temperatureC}</td>
                      <td>${f.temperatureF}</td>
                      <td>${f.summary || ''}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            `;
          }
        } catch (error) {
          console.error('Failed to load weather data:', error);
        }
      }

      loadWeather();
    </script>
  </body>
</html>
```

STEP-BY-STEP EXECUTION PLAN (DO THIS)
1) Inspect current React sample
- Read:
  - `react/...AppHost...` (AppHost file)
  - `react/...api/Program.cs`
  - `react/...ServiceDefaults/...`
  - `react/myreactapp.web/vite.config.js` (proxy + build)
- Run:
  - `git --no-pager log`
  - Use commit messages to mirror the same setup steps for Astro.

2) Create `astro/` folder and scaffold the .NET projects
- Use the same templates + aspire version approach used in `react/` commits:
  - `dotnet new aspire-apphost ... -f net10.0 --aspire-version 13.0`
  - `dotnet new aspire-servicedefaults ...`
  - `dotnet new webapi ...`
- Add references like React sample:
  - AppHost -> api
  - api -> ServiceDefaults
- Create solution and add projects like React sample (sln + add commands).

3) Add Aspire JavaScript hosting support
- Mirror React's `aspire add javascript` equivalent in the `astro/` folder (verify the correct command and resulting packages using aspire.dev docs and workspace patterns).

4) Scaffold Astro app
- Use `npm create astro@latest` to create the app under `astro/<frontend-folder>`.
- Select minimal template (empty/basics).
- Implement:
  - `astro.config.mjs` with Vite proxy configuration:
    ```js
    import { defineConfig } from 'astro/config';
    
    const apiUrl = process.env.APISERVICEASTRO_HTTPS || process.env.APISERVICEASTRO_HTTP;
    
    export default defineConfig({
      vite: {
        server: {
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
  - `output = 'static'` (default for Astro, ensures static build to `dist/`)

5) Wire up Aspire orchestration in AppHost
- Register API with name `"apiserviceastro"`.
- Register frontend with name `"frontendastro"` using the same Aspire method used in React sample (prefer `AddViteApp` since Astro uses Vite).
- Add reference + wait + external endpoints.
- Ensure publish copies Astro `dist` into API `wwwroot`.

6) Verify
- `dotnet build astro/<solution>.sln -c Release`
- `npm run build` in the Astro frontend folder
- (Optional) run AppHost and confirm the browser shows the table populated.

DELIVERABLES
- New `astro/` folder with a working Aspire + Astro sample.
- A short `astro/README.md` describing:
  - how to run
  - how proxy works (env vars from Aspire; include the exact env var names)
  - how publish serves frontend from API wwwroot
- Commit messages include the commands used.

DO NOT
- Do not change other samples unless required to keep CI green.
- Do not hardcode API URLs/ports in Astro.
- Do not introduce unrelated frameworks or complexity.
- Do not use "Swagger" wording; refer to OpenAPI.

START NOW
Inspect the `react/` sample + git history, then implement the Astro sample under `astro/` following the steps above.
