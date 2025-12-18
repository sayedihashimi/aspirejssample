YOU ARE COPILOT WORKING INSIDE THIS REPO WORKSPACE.

GOAL
Create a new Qwik sample (Vite-based) that is functionally equivalent to the existing Aspire 13 React sample under `react/` in this repo:
- Repo: https://github.com/sayedihashimi/aspirejssample
- React sample folder: `react/`
- Create a Qwik sample folder: `qwik/`
- The Qwik sample must implement the same Aspire architecture and runtime behavior as the React one:
  - AppHost orchestrator
  - ASP.NET Core Web API backend
  - Qwik dev server (Vite) with proxy to `/api`
  - Production publish packs the built frontend into the API's `wwwroot` and serves it via `UseFileServer()`
  - Health checks + ServiceDefaults
  - No hardcoded URLs; use Aspire-provided env vars for service URLs

IMPORTANT: UNIQUE SERVICE NAMES (NO CONFLICTS)
- Service names MUST be unique across samples to avoid env var collisions.
- For THIS Qwik sample:
  - API service name MUST be: `apiserviceqwik`
  - Frontend service name MUST be: `frontendqwik`
- Therefore, the Qwik dev server MUST proxy `/api/*` to:
  - `process.env.APISERVICEQWIK_HTTPS || process.env.APISERVICEQWIK_HTTP`
  (Aspire derives env var names from the service name; verify exact casing/format by running the app or inspecting Aspire docs, and align the code accordingly.)

IMPORTANT RESOURCES (MUST CONSULT WHEN NEEDED)
When you need any Aspire-specific step, consult these sources in priority order:
1) Official Aspire 13 docs: https://aspire.dev/
2) Code in THIS workspace (especially `react/` sample)
3) Reference repo: https://github.com/sayedihashimi/todojsaspire
4) The commit history in this repo (commands are in commit messages). Use:
   git --no-pager log

PROCESS REQUIREMENTS (THINKING MODE)
- Use "thinking mode": plan privately first, then execute with small, verifiable steps.
- Don't ask me questions unless truly blocked; make reasonable choices matching the React sample patterns and document them.
- Keep diffs minimal, predictable, and consistent with the `react/` sample.
- Commit messages should include the commands you ran (like the existing repo).

WHAT "EQUIVALENT" MEANS (ACCEPTANCE CRITERIA)
Your final result is correct when all of the following are true:

A) Folder + solution layout
- A new folder `qwik/` exists at repo root (sibling to `react/`).
- Inside `qwik/` there is an Aspire solution equivalent to React's:
  - *.AppHost (Aspire orchestrator)
  - *.api (ASP.NET Core Web API backend)
  - *.ServiceDefaults (Aspire ServiceDefaults shared project)
  - Qwik frontend project (Vite-based Qwik app)
- Solution file exists and includes all projects (and the frontend project representation consistent with how `react/` does it; follow the workspace pattern).

B) Dev mode behavior
- Running AppHost starts:
  - the API project
  - the Qwik (Vite) dev server
- The Qwik dev server proxies `/api/*` to the API service using Aspire-injected env vars:
  - `APISERVICEQWIK_HTTPS` and/or `APISERVICEQWIK_HTTP`
- Qwik UI fetches `/api/weatherforecast` and displays a table with columns:
  - Date, Temp (C), Temp (F), Summary
- No hardcoded API base URL in Qwik source; always relative `/api/...`

C) Production/container behavior
- The API publishes with the Qwik build output copied into API `wwwroot` (same idea as React's `PublishWithContainerFiles(frontend, "./wwwroot")`).
- The API serves:
  - static frontend files via `UseFileServer()`
  - the weather endpoint at `/api/weatherforecast`
- Don't break existing CI behavior in `.github/workflows/build.yml`.

D) Quality gates
- `dotnet build` for the Qwik solution succeeds.
- `npm run build` for the Qwik app succeeds.
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
  - register API project as `"apiserviceqwik"` with health check + external endpoints
  - register frontend as `"frontendqwik"` as a Vite app pointing to the Qwik app directory
    - Prefer the same Aspire JS hosting method as React uses (likely `AddViteApp`) and adjust only what's needed for Qwik.
  - `.WithReference(apiService)` and `.WaitFor(apiService)` and `.WithExternalHttpEndpoints()`
  - Production publish:
    - `apiService.PublishWithContainerFiles(frontend, "./wwwroot");`
    - Ensure the Qwik build output directory is `dist/`.

4) Qwik frontend project (Vite + Qwik)
- Create a Qwik app using Vite under `qwik/<frontend-folder>`.
- Implement a single main component that:
  - fetches `/api/weatherforecast` on mount
  - displays the same table as React sample with identical CSS styling
  - shows a "Loading..." message until data is available
- Dev proxy (Vite):
  - Configure `vite.config.(js|ts)` proxy for `/api` using:
    - `process.env.APISERVICEQWIK_HTTPS || process.env.APISERVICEQWIK_HTTP`
  - `secure: false`, `changeOrigin: true`
- Build:
  - `npm run build` outputs to `dist/`

CSS STYLING REQUIREMENTS (MUST MATCH OTHER APPS)
The Qwik app MUST use the exact same CSS styling as the other apps to maintain consistency. This includes:

1) Global styles (matching React's index.css):
```css
:root {
  font-family: system-ui, Avenir, Helvetica, Arial, sans-serif;
  line-height: 1.5;
  font-weight: 400;

  color-scheme: light dark;
  color: rgba(255, 255, 255, 0.87);
  background-color: #242424;

  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

a {
  font-weight: 500;
  color: #646cff;
  text-decoration: inherit;
}
a:hover {
  color: #535bf2;
}

body {
  margin: 0;
  display: flex;
  place-items: center;
  min-width: 320px;
  min-height: 100vh;
}

h1 {
  font-size: 3.2em;
  line-height: 1.1;
}

@media (prefers-color-scheme: light) {
  :root {
    color: #213547;
    background-color: #ffffff;
  }
  a:hover {
    color: #747bff;
  }
}
```

2) Component/App styles (matching React's App.css):
```css
/* Main container */
.app-container {
  margin: 0 auto;
  text-align: center;
  font-size: 1rem;
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
}

/* Weather table styling */
#weatherTable {
  border-collapse: collapse;
}

#weatherTable tbody tr {
  border-bottom: 1px solid rgb(68, 68, 68);
}

#weatherTable th, #weatherTable td {
  padding: 0.3rem 2rem;
}

#weatherTable thead {
  font-size: 1.2rem;
}
```

SUGGESTED NAMING / CONSISTENCY
- Prefer to follow the naming style of the React sample, but under `qwik/`.
- Suggested (adjust to existing conventions in the repo if needed):
  - Solution name: `MyQwikApp.sln`
  - Projects: `MyQwikApp.AppHost`, `MyQwikApp.api`, `MyQwikApp.ServiceDefaults`
  - Frontend folder: `myqwikapp.web`
- Service names in AppHost MUST remain:
  - `"apiserviceqwik"`
  - `"frontendqwik"`

RECOMMENDED QWIK IMPLEMENTATION DETAILS (KEEP IT SIMPLE)
- Use Qwik + Vite (the official `qwik` Vite template or `npm create qwik@latest`).
- Keep it minimal:
  - Main component fetches and renders table.
  - Use `useSignal` and `useTask$` or `useVisibleTask$` for data fetching.
  - Date rendering: `new Date(forecast.date).toLocaleDateString()` like React sample.
- Use TypeScript (default template) unless the repo strongly prefers JS.

Example outline for the main component (you may adapt):
- types: `interface WeatherForecast { date: string; temperatureC: number; temperatureF: number; summary?: string | null; }`
- state: `const forecasts = useSignal<WeatherForecast[]>([]);`
- state: `const loading = useSignal(true);`
- Use `useVisibleTask$` or `useTask$` to fetch data on component mount
- render:
  - `<h1>Weather forecast</h1>`
  - `<p>This component demonstrates fetching data from the server.</p>`
  - loading text: `<p><em>Loading... Please refresh once the ASP.NET backend has started. See <a href="https://aka.ms/jspsintegrationqwik">https://aka.ms/jspsintegrationqwik</a> for more details.</em></p>`
  - table with id="weatherTable" containing the weather data

STEP-BY-STEP EXECUTION PLAN (DO THIS)
1) Inspect current React sample
- Read:
  - `react/...AppHost...` (AppHost file)
  - `react/...api/Program.cs`
  - `react/...ServiceDefaults/...`
  - `react/myreactapp.web/vite.config.js` (proxy + build)
  - `react/myreactapp.web/src/App.css` (component styling)
  - `react/myreactapp.web/src/index.css` (global styling)
- Run:
  - `git --no-pager log`
  - Use commit messages to mirror the same setup steps for Qwik.

2) Create `qwik/` folder and scaffold the .NET projects
- Use the same templates + aspire version approach used in `react/` commits:
  - `dotnet new aspire-apphost ... -f net10.0 --aspire-version 13.0`
  - `dotnet new aspire-servicedefaults ...`
  - `dotnet new webapi ...`
- Add references like React sample:
  - AppHost -> api
  - api -> ServiceDefaults
- Create solution and add projects like React sample (sln + add commands).

3) Add Aspire JavaScript hosting support
- Mirror React's `aspire add javascript` equivalent in the `qwik/` folder (verify the correct command and resulting packages using aspire.dev docs and workspace patterns).
- Ensure package versions align with the repo's existing Aspire packages (don't introduce random versions).

4) Scaffold Qwik (Vite) app
- Create Qwik Vite app under `qwik/<frontend-folder>`.
- Use `npm create qwik@latest` or the appropriate Qwik CLI command.
- Choose the basic starter template.
- Implement:
  - Vite proxy configuration using `process.env.APISERVICEQWIK_HTTPS || process.env.APISERVICEQWIK_HTTP`
  - Ensure `build.outDir = 'dist'` in vite.config
- Ensure `npm scripts` include `dev`, `build`, `preview` (default Vite/Qwik scripts are fine).

5) Implement the weather component with correct styling
- Create the main component that fetches and displays weather data.
- Apply the CSS styling as specified above to match React/Angular/Svelte apps:
  - Global styles in the appropriate global CSS file (e.g., `global.css` or similar)
  - Component/table styles matching the exact styling from other apps
- Ensure the table structure matches other apps:
  - Same column headers with aria-labels
  - Same table id="weatherTable"
  - Same date formatting using `toLocaleDateString()`

6) Wire up Aspire orchestration in AppHost
- Register API with name `"apiserviceqwik"`.
- Register frontend with name `"frontendqwik"` using the same Aspire method used in React sample (prefer `AddViteApp` if that's what React uses).
- Add reference + wait + external endpoints.
- Ensure publish copies Qwik `dist` into API `wwwroot`.

7) Verify
- `dotnet build qwik/<solution>.sln -c Release`
- `npm run build` in the Qwik frontend folder
- (Optional) run AppHost and confirm the browser shows the table populated with matching styling.

DELIVERABLES
- New `qwik/` folder with a working Aspire + Qwik (Vite) sample.
- A short `qwik/README.md` describing:
  - how to run
  - how proxy works (env vars from Aspire; include the exact env var names)
  - how publish serves frontend from API wwwroot
- Commit messages include the commands used.
- CSS styling MUST match the other apps exactly (React, Angular, Svelte).

DO NOT
- Do not change `react/` or other samples unless required to keep CI green.
- Do not hardcode API URLs/ports in Qwik.
- Do not introduce additional frameworks or complexity.
- Do not use "Swagger" wording; refer to OpenAPI.
- Do not deviate from the established CSS styling pattern used in other apps.

START NOW
Inspect the `react/` sample + git history, then implement the Qwik sample under `qwik/` following the steps above.
