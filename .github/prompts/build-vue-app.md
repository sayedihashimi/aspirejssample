YOU ARE COPILOT WORKING INSIDE THIS REPO WORKSPACE.

GOAL
Create a new Vue sample that is functionally equivalent to the existing Aspire 13 React sample under `react/` in this repo:
- Repo: https://github.com/sayedihashimi/aspirejssample
- React sample folder: `react/`
- Create a Vue sample folder: `vue/`
- The Vue sample must implement the same Aspire architecture and runtime behavior as the React one:
  - AppHost orchestrator
  - ASP.NET Core Web API backend
  - JS frontend dev server with proxy to `/api`
  - Production publish packs the built frontend into the API’s `wwwroot` and serves it via `UseFileServer()`
  - Health checks + ServiceDefaults
  - No hardcoded URLs; use Aspire-provided env vars for service URLs

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
- A new folder `vue/` exists at repo root (sibling to `react/`).
- Inside `vue/` there is an Aspire solution equivalent to React’s:
  - *.AppHost (Aspire orchestrator)
  - *.api (ASP.NET Core Web API backend)
  - *.ServiceDefaults (Aspire ServiceDefaults shared project)
  - Vue frontend project (Vite-based Vue app)
- Solution file exists and includes all projects (and the frontend project representation consistent with how `react/` does it; follow the workspace pattern).

B) Dev mode behavior
- Running AppHost starts:
  - the API project
  - the Vue dev server
- Vue dev server proxies `/api/*` to the API service using Aspire-injected env vars:
  - APISERVICEVUE_HTTPS and/or APISERVICEVUE_HTTP (Vue-specific naming to avoid conflicts)
- Vue UI fetches `/api/weatherforecast` and displays a table with columns:
  - Date, Temp (C), Temp (F), Summary
- No hardcoded API base URL in Vue source; always relative `/api/...`

C) Production/container behavior
- The API publishes with the Vue build output copied into API `wwwroot` (same idea as React’s `PublishWithContainerFiles(frontend, "./wwwroot")`).
- The API serves:
  - static frontend files via `UseFileServer()`
  - the weather endpoint at `/api/weatherforecast`
- Don’t break existing CI behavior in `.github/workflows/build.yml`.

D) Quality gates
- `dotnet build` for the Vue solution succeeds.
- `npm run build` for the Vue app succeeds.
- Existing `react/` sample remains unaffected.

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

3) AppHost project
- Mirror React’s AppHost behavior:
  - `DistributedApplication.CreateBuilder(args)`
  - docker compose env line if present in React sample: `builder.AddDockerComposeEnvironment("env")`
  - register API `"apiservicevue"` with health check + external endpoints
  - register frontend `"frontendvue"` as a Vite app pointing to the Vue app directory
    - Prefer the same Aspire JS hosting method as React uses (likely `AddViteApp`) and adjust only what’s needed for Vue.
  - `.WithReference(apiService)` and `.WaitFor(apiService)` and `.WithExternalHttpEndpoints()`
  - Production publish:
    - `apiService.PublishWithContainerFiles(frontend, "./wwwroot");`
    - Ensure the Vue build output directory is the one Vite produces (`dist/`).

4) Vue frontend project (Vite + Vue)
- Create a Vue app (Vite-based) under `vue/<frontend-folder>`.
- Implement a single page/component that:
  - fetches `/api/weatherforecast` on mount
  - displays the same table as React sample
  - shows a “Loading...” message until data is available
- Dev proxy:
  - Configure Vite proxy for `/api` using:
    - `process.env.APISERVICEVUE_HTTPS || process.env.APISERVICEVUE_HTTP`
  - `secure: false`, `changeOrigin: true`
- Build:
  - `npm run build` outputs to `dist/`

NAMING / CONSISTENCY
- Prefer to follow the same naming style as the React sample, but under `vue/`.
- Keep Aspire service names unique to avoid conflicts with other samples in the monorepo:
  - API service name MUST be `"apiservicevue"`
  - Frontend service name MUST be `"frontendvue"`
  This ensures env var names like `APISERVICEVUE_HTTP(S)` are unique to the Vue sample.

RECOMMENDED VUE IMPLEMENTATION DETAILS (KEEP IT SIMPLE)
- Use Vue 3 + Vite.
- Use the Composition API (`<script setup>`) or Options API—either is fine, but keep it minimal.
- Example shape:
  - `src/App.vue` fetches and renders table.
  - Date rendering: format `new Date(forecast.date).toLocaleDateString()` like React sample.

STEP-BY-STEP EXECUTION PLAN (DO THIS)
1) Inspect current React sample
- Read:
  - `react/...AppHost...` (AppHost file)
  - `react/...api/Program.cs`
  - `react/...ServiceDefaults/...`
  - `react/myreactapp.web/vite.config.js` (proxy + build)
- Run:
  - `git --no-pager log`
  - Use commit messages to mirror the same setup steps for Vue.

2) Create `vue/` folder and scaffold the .NET projects
- Use the same templates + aspire version approach used in `react/` commits:
  - `dotnet new aspire-apphost ... -f net10.0 --aspire-version 13.0`
  - `dotnet new aspire-servicedefaults ...`
  - `dotnet new webapi ...`
- Add references like React sample:
  - AppHost -> api
  - api -> ServiceDefaults
- Create solution and add projects like React sample (sln + add commands).

3) Add Aspire JavaScript hosting support
- Mirror React’s `aspire add javascript` equivalent in the `vue/` folder (verify the correct command and resulting packages using aspire.dev docs and workspace patterns).

4) Scaffold Vue app
- Create the Vue Vite app under `vue/<frontend-folder>`.
- Implement:
  - `vite.config.js` proxy identical in intent to React sample:
    - `/api` -> `process.env.APISERVICEVUE_HTTPS || process.env.APISERVICEVUE_HTTP`
    - `changeOrigin: true`
    - `secure: false`
  - `build.outDir = 'dist'`

5) Wire up Aspire orchestration in AppHost
- Register frontend with the same Aspire method used in React sample (prefer `AddViteApp` if that’s what React uses).
- Add reference + wait + external endpoints.
- Ensure publish copies Vue `dist` into API `wwwroot`.

6) Verify
- `dotnet build vue/<solution>.sln -c Release`
- `npm run build` in the Vue frontend folder
- (Optional) run AppHost and confirm the browser shows the table populated.

DELIVERABLES
- New `vue/` folder with a working Aspire + Vue sample.
- A short `vue/README.md` describing:
  - how to run
  - how proxy works (env vars from Aspire)
  - how publish serves frontend from API wwwroot
- Commit messages include the commands used.

DO NOT
- Do not change `react/` unless required to keep CI green.
- Do not hardcode API URLs/ports in Vue.
- Do not introduce unrelated tooling or complexity.
- Do not use “Swagger” wording; refer to OpenAPI.

START NOW
Inspect the `react/` sample + git history, then implement the Vue sample under `vue/` following the steps above.
