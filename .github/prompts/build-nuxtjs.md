YOU ARE COPILOT WORKING INSIDE THIS REPO WORKSPACE.

GOAL
Create a new Nuxt.js sample (Vite-based) that is functionally equivalent to the existing Aspire 13 React sample under `react/` in this repo:
- Repo: https://github.com/sayedihashimi/aspirejssample
- React sample folder: `react/`
- Create a Nuxt.js sample folder: `nuxtjs/`
- The Nuxt.js sample must implement the same Aspire architecture and runtime behavior as the React one:
  - AppHost orchestrator
  - ASP.NET Core Web API backend
  - Nuxt.js dev server (Vite-based) with proxy to `/api`
  - Production publish packs the built frontend into the API's `wwwroot` and serves it via `UseFileServer()`
  - Health checks + ServiceDefaults
  - No hardcoded URLs; use Aspire-provided env vars for service URLs

Follow the instructions in ./memorizer.md.

IMPORTANT: UNIQUE SERVICE NAMES (NO CONFLICTS)
- Service names MUST be unique across samples to avoid env var collisions.
- For THIS Nuxt.js sample:
  - API service name MUST be: `apiservicenuxtjs`
  - Frontend service name MUST be: `frontendnuxtjs`
- Therefore, the Nuxt.js dev server MUST proxy `/api/*` to:
  - `process.env.APISERVICENUXTJS_HTTPS || process.env.APISERVICENUXTJS_HTTP`
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
- A new folder `nuxtjs/` exists at repo root (sibling to `react/`).
- Inside `nuxtjs/` there is an Aspire solution equivalent to React's:
  - *.AppHost (Aspire orchestrator)
  - *.api (ASP.NET Core Web API backend)
  - *.ServiceDefaults (Aspire ServiceDefaults shared project)
  - Nuxt.js frontend project (Vite-based Nuxt 3 app)
- Solution file exists and includes all projects (and the frontend project representation consistent with how `react/` does it; follow the workspace pattern).

B) Dev mode behavior
- Running AppHost starts:
  - the API project
  - the Nuxt.js dev server
- Nuxt.js dev server proxies `/api/*` to the API service using Aspire-injected env vars:
  - APISERVICENUXTJS_HTTPS and/or APISERVICENUXTJS_HTTP
- Nuxt.js UI fetches `/api/weatherforecast` and displays a table with columns:
  - Date, Temp (C), Temp (F), Summary
- No hardcoded API base URL in Nuxt.js source; always relative `/api/...`

C) Production/container behavior
- The API publishes with the Nuxt.js build output copied into API `wwwroot` (same idea as React's `PublishWithContainerFiles(frontend, "./wwwroot")`).
- The API serves:
  - static frontend files via `UseFileServer()`
  - the weather endpoint at `/api/weatherforecast`
- Don't break existing CI behavior in `.github/workflows/build.yml`.

D) Quality gates
- `dotnet build` for the Nuxt.js solution succeeds.
- `npm run build` for the Nuxt.js app succeeds.
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
  - register API `"apiservicenuxtjs"` with health check + external endpoints
  - register frontend `"frontendnuxtjs"` as a Vite app pointing to the Nuxt.js app directory
    - Since Nuxt 3 uses Vite as its dev server, you can use `AddViteApp` like the React sample (VERIFY in Aspire docs)
    - Alternatively, use `AddNpmApp` with appropriate dev command (`npm run dev`)
  - `.WithReference(apiService)` and `.WaitFor(apiService)` and `.WithExternalHttpEndpoints()`
  - Production publish:
    - `apiService.PublishWithContainerFiles(frontend, "./wwwroot");`
    - Ensure the Nuxt.js build output directory is configured for static generation (`.output/public/` for SSG or `dist/` depending on configuration).

4) Nuxt.js frontend project (Vite + Nuxt 3)
- Create a Nuxt 3 app under `nuxtjs/<frontend-folder>`.
- Implement a single page/component that:
  - fetches `/api/weatherforecast` on mount
  - displays the same table as React sample
  - shows a "Loading..." message until data is available
- Dev proxy:
  - Configure Nuxt's Vite proxy (via `nuxt.config.ts`) for `/api` using:
    - `process.env.APISERVICENUXTJS_HTTPS || process.env.APISERVICENUXTJS_HTTP`
  - In `nuxt.config.ts`, use the `vite.server.proxy` option or Nuxt's `nitro.devProxy` (Nuxt 3 recommended approach)
  - `secure: false`, `changeOrigin: true`
- Build:
  - Configure Nuxt for static site generation (SSG) to simplify deployment:
    - Use `nuxt generate` or `ssr: false` in config to produce static output
  - Output typically goes to `.output/public/` or `dist/` depending on configuration
  - Ensure build output is suitable for copying into API `wwwroot`

NAMING / CONSISTENCY
- Prefer to follow the same naming style as the React sample, but under `nuxtjs/`.
- Keep Aspire service names unique to avoid conflicts with other samples in the monorepo:
  - API service name MUST be `"apiservicenuxtjs"`
  - Frontend service name MUST be `"frontendnuxtjs"`
  This ensures env var names like `APISERVICENUXTJS_HTTP(S)` are unique to the Nuxt.js sample.

RECOMMENDED NUXT.JS IMPLEMENTATION DETAILS (KEEP IT SIMPLE)
- Use Nuxt 3 (latest stable version) with Vite.
- Keep it minimal:
  - Main page (`pages/index.vue` or `app.vue`) fetches and renders table.
  - Use Vue 3 Composition API (`<script setup>`) for cleaner code.
  - Date rendering: `new Date(forecast.date).toLocaleDateString()` like React sample.
- Configure for static generation:
  - In `nuxt.config.ts`, consider setting `ssr: false` for SPA mode or use `nuxt generate` for SSG
  - Ensure output is static HTML/JS/CSS files suitable for serving from `wwwroot`

Example outline for page component (you may adapt):
- types: `interface WeatherForecast { date: string; temperatureC: number; temperatureF: number; summary?: string | null }`
- state: `const forecasts = ref<WeatherForecast[]>([]); const loading = ref(true);`
- `onMounted(async () => { const data = await $fetch('/api/weatherforecast'); forecasts.value = data; loading.value = false; })`
- render:
  - `<h1>Weather forecast</h1>`
  - `<p>This component demonstrates fetching data from the server.</p>`
  - loading text or table

STEP-BY-STEP EXECUTION PLAN (DO THIS)
1) Inspect current React sample
- Read:
  - `react/...AppHost...` (AppHost file)
  - `react/...api/Program.cs`
  - `react/...ServiceDefaults/...`
  - `react/myreactapp.web/vite.config.js` (proxy + build)
- Run:
  - `git --no-pager log`
  - Use commit messages to mirror the same setup steps for Nuxt.js.

2) Create `nuxtjs/` folder and scaffold the .NET projects
- Use the same templates + aspire version approach used in `react/` commits:
  - `dotnet new aspire-apphost ... -f net10.0 --aspire-version 13.0`
  - `dotnet new aspire-servicedefaults ...`
  - `dotnet new webapi ...`
- Add references like React sample:
  - AppHost -> api
  - api -> ServiceDefaults
- Create solution and add projects like React sample (sln + add commands).

3) Add Aspire JavaScript hosting support
- Mirror React's `aspire add javascript` equivalent in the `nuxtjs/` folder (verify the correct command and resulting packages using aspire.dev docs and workspace patterns).

4) Scaffold Nuxt.js app
- Use `npx nuxi@latest init` to create the Nuxt 3 app under `nuxtjs/<frontend-folder>`.
- Implement:
  - `nuxt.config.ts` with proxy/devProxy configuration:
    - Read `APISERVICENUXTJS_HTTPS || APISERVICENUXTJS_HTTP` env var
    - Configure Nuxt's `nitro.devProxy` or `vite.server.proxy` to proxy `/api/*` to the API URL
    - `changeOrigin: true`, `secure: false`
  - Configure for static output (SSG or SPA mode depending on needs)

5) Wire up Aspire orchestration in AppHost
- Register frontend with the same Aspire method used in React sample (prefer `AddViteApp` since Nuxt 3 uses Vite, or use `AddNpmApp`).
- Add reference + wait + external endpoints.
- Ensure publish copies Nuxt build output (`.output/public/` or `dist/`) into API `wwwroot`.

6) Verify
- `dotnet build nuxtjs/<solution>.sln -c Release`
- `npm run build` (or `npm run generate` for SSG) in the Nuxt.js frontend folder
- (Optional) run AppHost and confirm the browser shows the table populated.

DELIVERABLES
- New `nuxtjs/` folder with a working Aspire + Nuxt.js sample.
- A short `nuxtjs/README.md` describing:
  - how to run
  - how proxy works (env vars from Aspire)
  - how publish serves frontend from API wwwroot
- Commit messages include the commands used.

DO NOT
- Do not change other samples unless required to keep CI green.
- Do not hardcode API URLs/ports in Nuxt.js.
- Do not introduce unrelated tooling or complexity.
- Do not use "Swagger" wording; refer to OpenAPI.

START NOW
Inspect the `react/` sample + git history, then implement the Nuxt.js sample under `nuxtjs/` following the steps above.
