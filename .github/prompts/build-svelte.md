YOU ARE COPILOT WORKING INSIDE THIS REPO WORKSPACE.

GOAL
Create a new Svelte sample (Vite-based) that is functionally equivalent to the existing Aspire 13 React sample under `react/` in this repo:
- Repo: https://github.com/sayedihashimi/aspirejssample
- React sample folder: `react/`
- Create a Svelte sample folder: `svelte/`
- The Svelte sample must implement the same Aspire architecture and runtime behavior as the React one:
  - AppHost orchestrator
  - ASP.NET Core Web API backend
  - Svelte dev server (Vite) with proxy to `/api`
  - Production publish packs the built frontend into the API’s `wwwroot` and serves it via `UseFileServer()`
  - Health checks + ServiceDefaults
  - No hardcoded URLs; use Aspire-provided env vars for service URLs

IMPORTANT: UNIQUE SERVICE NAMES (NO CONFLICTS)
- Service names MUST be unique across samples to avoid env var collisions.
- For THIS Svelte sample:
  - API service name MUST be: `apiservicesvelte`
  - Frontend service name MUST be: `frontendsvelte`
- Therefore, the Svelte dev server MUST proxy `/api/*` to:
  - `process.env.APISERVICESVELTE_HTTPS || process.env.APISERVICESVELTE_HTTP`
  (Aspire derives env var names from the service name; verify exact casing/format by running the app or inspecting Aspire docs, and align the code accordingly.)

IMPORTANT RESOURCES (MUST CONSULT WHEN NEEDED)
When you need any Aspire-specific step, consult these sources in priority order:
1) Official Aspire 13 docs: https://aspire.dev/
2) Code in THIS workspace (especially `react/` sample)
3) Reference repo: https://github.com/sayedihashimi/todojsaspire
4) The commit history in this repo (commands are in commit messages). Use:
   git --no-pager log

PROCESS REQUIREMENTS (THINKING MODE)
- Use “thinking mode”: plan privately first, then execute with small, verifiable steps.
- Don’t ask me questions unless truly blocked; make reasonable choices matching the React sample patterns and document them.
- Keep diffs minimal, predictable, and consistent with the `react/` sample.
- Commit messages should include the commands you ran (like the existing repo).

WHAT “EQUIVALENT” MEANS (ACCEPTANCE CRITERIA)
Your final result is correct when all of the following are true:

A) Folder + solution layout
- A new folder `svelte/` exists at repo root (sibling to `react/`).
- Inside `svelte/` there is an Aspire solution equivalent to React’s:
  - *.AppHost (Aspire orchestrator)
  - *.api (ASP.NET Core Web API backend)
  - *.ServiceDefaults (Aspire ServiceDefaults shared project)
  - Svelte frontend project (Vite-based Svelte app)
- Solution file exists and includes all projects (and the frontend project representation consistent with how `react/` does it; follow the workspace pattern).

B) Dev mode behavior
- Running AppHost starts:
  - the API project
  - the Svelte (Vite) dev server
- The Svelte dev server proxies `/api/*` to the API service using Aspire-injected env vars:
  - `APISERVICESVELTE_HTTPS` and/or `APISERVICESVELTE_HTTP`
- Svelte UI fetches `/api/weatherforecast` and displays a table with columns:
  - Date, Temp (C), Temp (F), Summary
- No hardcoded API base URL in Svelte source; always relative `/api/...`

C) Production/container behavior
- The API publishes with the Svelte build output copied into API `wwwroot` (same idea as React’s `PublishWithContainerFiles(frontend, "./wwwroot")`).
- The API serves:
  - static frontend files via `UseFileServer()`
  - the weather endpoint at `/api/weatherforecast`
- Don’t break existing CI behavior in `.github/workflows/build.yml`.

D) Quality gates
- `dotnet build` for the Svelte solution succeeds.
- `npm run build` for the Svelte app succeeds.
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
- Reuse the same ServiceDefaults approach and code from `react/` (don’t reinvent).

3) AppHost project (UNIQUE SERVICE NAMES)
- Mirror React’s AppHost behavior, but with unique names:
  - `DistributedApplication.CreateBuilder(args)`
  - docker compose env line if present in React sample: `builder.AddDockerComposeEnvironment("env")`
  - register API project as `"apiservicesvelte"` with health check + external endpoints
  - register frontend as `"frontendsvelte"` as a Vite app pointing to the Svelte app directory
    - Prefer the same Aspire JS hosting method as React uses (likely `AddViteApp`) and adjust only what’s needed for Svelte.
  - `.WithReference(apiService)` and `.WaitFor(apiService)` and `.WithExternalHttpEndpoints()`
  - Production publish:
    - `apiService.PublishWithContainerFiles(frontend, "./wwwroot");`
    - Ensure the Svelte build output directory is `dist/`.

4) Svelte frontend project (Vite + Svelte)
- Create a Svelte app using Vite under `svelte/<frontend-folder>`.
- Implement a single main page/component that:
  - fetches `/api/weatherforecast` on mount
  - displays the same table as React sample
  - shows a “Loading...” message until data is available
- Dev proxy (Vite):
  - Configure `vite.config.(js|ts)` proxy for `/api` using:
    - `process.env.APISERVICESVELTE_HTTPS || process.env.APISERVICESVELTE_HTTP`
  - `secure: false`, `changeOrigin: true`
- Build:
  - `npm run build` outputs to `dist/`

SUGGESTED NAMING / CONSISTENCY
- Prefer to follow the naming style of the React sample, but under `svelte/`.
- Suggested (adjust to existing conventions in the repo if needed):
  - Solution name: `MySvelteApp.sln`
  - Projects: `MySvelteApp.AppHost`, `MySvelteApp.api`, `MySvelteApp.ServiceDefaults`
  - Frontend folder: `mysvelteapp.web`
- Service names in AppHost MUST remain:
  - `"apiservicesvelte"`
  - `"frontendsvelte"`

RECOMMENDED SVELTE IMPLEMENTATION DETAILS (KEEP IT SIMPLE)
- Use Svelte + Vite (NOT SvelteKit) unless the existing repo conventions demand otherwise.
- Keep it minimal:
  - `src/App.svelte` fetches and renders table.
  - Use `onMount` to fetch.
  - Date rendering: `new Date(forecast.date).toLocaleDateString()` like React sample.

Example outline for `src/App.svelte` (you may adapt):
- state: `let forecasts = []; let loading = true;`
- `onMount(async () => { fetch('/api/weatherforecast')... })`
- render:
  - `<h1>Weather forecast</h1>`
  - `<p>This component demonstrates fetching data from the server.</p>`
  - loading text or table.

STEP-BY-STEP EXECUTION PLAN (DO THIS)
1) Inspect current React sample
- Read:
  - `react/...AppHost...` (AppHost file)
  - `react/...api/Program.cs`
  - `react/...ServiceDefaults/...`
  - `react/myreactapp.web/vite.config.js` (proxy + build)
- Run:
  - `git --no-pager log`
  - Use commit messages to mirror the same setup steps for Svelte.

2) Create `svelte/` folder and scaffold the .NET projects
- Use the same templates + aspire version approach used in `react/` commits:
  - `dotnet new aspire-apphost ... -f net10.0 --aspire-version 13.0`
  - `dotnet new aspire-servicedefaults ...`
  - `dotnet new webapi ...`
- Add references like React sample:
  - AppHost -> api
  - api -> ServiceDefaults
- Create solution and add projects like React sample (sln + add commands).

3) Add Aspire JavaScript hosting support
- Mirror React’s `aspire add javascript` equivalent in the `svelte/` folder (verify the correct command and resulting packages using aspire.dev docs and workspace patterns).
- Ensure package versions align with the repo’s existing Aspire packages (don’t introduce random versions).

4) Scaffold Svelte (Vite) app
- Create Svelte Vite app under `svelte/<frontend-folder>`.
- Implement:
  - Vite proxy configuration using `process.env.APISERVICESVELTE_HTTPS || process.env.APISERVICESVELTE_HTTP`
  - `build.outDir = 'dist'`
- Ensure `npm scripts` include `dev`, `build`, `preview` (default Vite scripts are fine).

5) Wire up Aspire orchestration in AppHost
- Register API with name `"apiservicesvelte"`.
- Register frontend with name `"frontendsvelte"` using the same Aspire method used in React sample (prefer `AddViteApp` if that’s what React uses).
- Add reference + wait + external endpoints.
- Ensure publish copies Svelte `dist` into API `wwwroot`.

6) Verify
- `dotnet build svelte/<solution>.sln -c Release`
- `npm run build` in the Svelte frontend folder
- (Optional) run AppHost and confirm the browser shows the table populated.

DELIVERABLES
- New `svelte/` folder with a working Aspire + Svelte (Vite) sample.
- A short `svelte/README.md` describing:
  - how to run
  - how proxy works (env vars from Aspire; include the exact env var names)
  - how publish serves frontend from API wwwroot
- Commit messages include the commands used.

DO NOT
- Do not change `react/` unless required to keep CI green.
- Do not hardcode API URLs/ports in Svelte.
- Do not introduce SvelteKit unless necessary.
- Do not use “Swagger” wording; refer to OpenAPI.

START NOW
Inspect the `react/` sample + git history, then implement the Svelte sample under `svelte/` following the steps above.
