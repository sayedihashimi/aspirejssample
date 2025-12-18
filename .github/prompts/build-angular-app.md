YOU ARE COPILOT WORKING INSIDE THIS REPO WORKSPACE.

GOAL
Create a new Angular sample that is functionally equivalent to the existing Aspire 13 React sample that lives under the `react/` folder of this repo:
- Repo: https://github.com/sayedihashimi/aspirejssample
- React sample folder: `react/`
- Create an Angular sample folder: `angular/`
- The Angular sample must implement the same Aspire architecture and runtime behavior as the React one:
  - AppHost orchestrator
  - ASP.NET Core Web API backend
  - JS frontend dev server with proxy to `/api`
  - Production publish packs the built frontend into the API’s `wwwroot` and serves it via `UseFileServer()`
  - Health checks and ServiceDefaults
  - No hardcoded URLs; use Aspire-provided env vars for service URLs

Follow the instructions in ./memorizer.md.

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
- Use “thinking mode”: plan privately first, then execute with small, verifiable steps.
- If you have any questions, ask them.
- Prefer changes that mirror the `react/` solution structure and naming conventions unless there’s a strong reason to diverge.
- Keep diffs minimal and predictable. Use clear commits.
- This will be iterative. Plan, Update, Verify. For verify do things like running a build to ensure no errors and make sure that the app runs successfully. If not, iterate until it's working.
- You will create a full TODO list
- When executing complete all TODO list items, no temporary code.

WHAT “EQUIVALENT” MEANS (ACCEPTANCE CRITERIA)
Your final result is correct when all of the following are true:

A) Folder + solution layout
- A new folder `angular/` exists at repo root (sibling to `react/`).
- Inside `angular/` there is a 3–4 project Aspire solution equivalent to React’s:
  - *.AppHost (Aspire orchestrator)
  - *.api (ASP.NET Core Web API backend)
  - *.ServiceDefaults (Aspire ServiceDefaults shared project)
  - Angular frontend project (Node/Angular CLI app) with appropriate project representation in the solution (e.g., esproj if that’s what the React sample used; follow the pattern used in `react/` and Aspire docs).

B) Dev mode behavior
- Running the AppHost starts:
  - the API project
  - the Angular dev server
- The Angular dev server proxies `/api/*` to the API service using Aspire-injected environment variables:
  - APISERVICEANGULAR_HTTPS and/or APISERVICEANGULAR_HTTP (Angular-specific naming to avoid conflicts)
- The Angular UI fetches `/api/weatherforecast` and displays a table with columns:
  - Date, Temp (C), Temp (F), Summary
- No hardcoded API base URL in Angular source; always relative `/api/...`

C) Production/container behavior
- The API publishes with the Angular build output copied into API `wwwroot` (same idea as React’s `PublishWithContainerFiles(frontend, "./wwwroot")`).
- The API serves:
  - static frontend files (index.html + assets) via `UseFileServer()`
  - the weather endpoint at `/api/weatherforecast`
- The AppHost build/publish pipeline works similarly to the React sample (don’t break existing CI).

D) Quality gates
- `dotnet build` for the Angular solution succeeds.
- The Aspire build command used in CI (see `.github/workflows/build.yml`) still works for the repo and doesn’t regress the React sample.
- Angular app builds with `npm run build` (or the standard Angular build script) without errors.

WHAT TO IMPLEMENT (MIRROR THE REACT SAMPLE)
1) Backend API project
- Copy the API backend pattern from `react/`:
  - `builder.Services.AddOpenApi();`
  - `builder.AddServiceDefaults();`
  - `app.MapDefaultEndpoints();`
  - `app.UseHttpsRedirection();`
  - `app.MapGet("/api/weatherforecast", ...)` (or the same MapGroup pattern from React sample)
  - `app.UseFileServer();`
- Keep the same response shape: date, temperatureC, temperatureF, summary
- Keep `/api/...` routing consistent

2) ServiceDefaults project
- Reuse the same ServiceDefaults approach and code from `react/` (don’t reinvent).

3) AppHost project
- Mirror React’s `AppHost.cs` behavior:
  - uses `DistributedApplication.CreateBuilder(args)`
  - includes docker compose environment: `builder.AddDockerComposeEnvironment("env")` (if that’s still in the React sample; match it)
  - registers the API project with health check and external endpoints
  - registers the frontend as a Node/JavaScript app that runs Angular CLI dev server
    - Use the Aspire JavaScript hosting package approach recommended by Aspire 13 docs
    - In React sample it uses `AddViteApp`. For Angular, use the correct Aspire method (likely `AddNpmApp` or equivalent—VERIFY IN https://aspire.dev/ and/or existing workspace usage).
  - Add `.WithReference(apiService)` and `.WaitFor(apiService)` and `.WithExternalHttpEndpoints()` like the React sample
  - Production publish:
    - `apiService.PublishWithContainerFiles(frontend, "./wwwroot");`
    - Ensure the “frontend build output folder” is the one Angular produces (often `dist/<app-name>/...`). Confirm exact path in your Angular app and wire it correctly in Aspire’s publish configuration.

4) Angular frontend project
- Create an Angular app that matches functionality:
  - One main page/component that fetches weather forecasts on init and renders the table.
  - Use Angular HttpClient.
  - Loading UI similar to React sample (“Loading... Please refresh once the ASP.NET backend has started.” is fine).
- Dev proxy:
  - Implement Angular CLI proxy config so `/api` is proxied to:
    - process.env.APISERVICEANGULAR_HTTPS || process.env.APISERVICEANGULAR_HTTP
  - Angular typically uses `proxy.conf.json`. You may need to generate it dynamically or keep it static and rely on Aspire to inject env vars into the dev server command.
  - Approach: configure the Aspire frontend “run” command to pass the resolved env var into the proxy config (or use a small JS script that writes `proxy.conf.json` at startup). DO THIS ONLY IF NECESSARY; prefer a simple documented approach used by Aspire samples.
  - Do not hardcode localhost ports.
- Build output:
  - Ensure `npm run build` produces static assets suitable for copying into API `wwwroot`.
  - Ensure base href is compatible with being served from `/` (default).

NAMING / CONSISTENCY
- Prefer to follow the same naming style as the React sample, but under `angular/`.
- Suggested (but adjust to match existing conventions):
  - Solution name: `MyAngularApp.sln` (or mirror React naming; pick one and be consistent)
  - Projects: `MyAngularApp.AppHost`, `MyAngularApp.api`, `MyAngularApp.ServiceDefaults`
  - Frontend folder: `myangularapp.web`
- If you choose different names, ensure AppHost service names remain unique to avoid conflicts:
  - API service registered as `"apiserviceangular"`
  - Frontend registered as `"frontendangular"`
  This is important because the env var names are derived from the service name (e.g., `APISERVICEANGULAR_HTTPS`).

STEP-BY-STEP EXECUTION PLAN (DO THIS)
1) Inspect current React sample
- Read:
  - `react/MyReactApp.AppHost/AppHost.cs` (or `Program.cs` if used)
  - `react/MyReactApp.api/Program.cs`
  - `react/MyReactApp.ServiceDefaults/*`
  - `react/myreactapp.web/*` especially dev proxy config and build output config
- Run:
  - git --no-pager log
  - Use commit messages to replicate the same setup steps for Angular.

2) Create `angular/` folder and scaffold the .NET projects
- Use the same dotnet templates and aspire version approach as React sample commits:
  - `dotnet new aspire-apphost ... -f net10.0 --aspire-version 13.0`
  - `dotnet new aspire-servicedefaults ...`
  - `dotnet new webapi ...`
- Add references like React sample did:
  - AppHost references api
  - api references ServiceDefaults
- Create solution and add projects like React sample commit (the sln + add commands).

3) Add Aspire JavaScript hosting support
- In React history there is `aspire add javascript`. Do the equivalent in the Angular sample folder.
- Ensure the AppHost project references the needed Aspire.Hosting.JavaScript package version consistent with repo.

4) Scaffold Angular app
- Use Angular CLI to create the app under `angular/<frontend-folder>`.
- Keep it as a standard Angular app (standalone components or module-based is fine).
- Ensure `npm scripts` include:
  - `start` (ng serve)
  - `build` (ng build)
- Implement UI component to fetch and render weather table.

5) Wire up Aspire dev orchestration
- In AppHost, add the frontend via the correct Aspire method for Node apps (VERIFY IN ASPIRE DOCS):
  - Configure working directory to the Angular frontend folder.
  - Configure the dev command to run Angular dev server.
  - Ensure env vars for `APISERVICEANGULAR_HTTP(S)` are available to the frontend process.
  - WaitFor + WithReference to the API service.
  - External endpoints enabled.

6) Configure Angular proxy to `/api`
- Ensure `ng serve` uses a proxy config.
- Proxy target must resolve from env:
  - APISERVICEANGULAR_HTTPS or APISERVICEANGULAR_HTTP
- If Angular proxy config cannot directly read env vars, add a minimal startup script:
  - reads env
  - writes `proxy.conf.json`
  - then launches `ng serve --proxy-config proxy.conf.json`
- Keep it simple, documented, and local to the frontend project.

7) Production publish integration
- Ensure AppHost publish step copies Angular build output into API `wwwroot`.
- Verify correct dist path for the Angular version you scaffolded.
- Ensure API serves static assets via `UseFileServer()`.

8) Verify
- From repo root, ensure:
  - `dotnet build angular/<solution>.sln -c Release` succeeds
  - (Optional) run AppHost and confirm in browser:
    - frontend loads
    - data is shown
- Ensure existing `react/` sample remains unaffected.

DELIVERABLES
- New `angular/` folder with fully working Aspire+Angular sample.
- Any minimal README notes under `angular/` describing:
  - how to run locally
  - how dev proxy works
  - how publish serves frontend from API wwwroot
- Commit messages should describe commands used (like existing repo practice).

DO NOT
- Do not change the `react/` sample unless you must to keep CI green.
- Do not hardcode localhost API ports/URLs in Angular.
- Do not introduce unrelated frameworks or complex tooling.
- Do not use “Swagger” wording; refer to OpenAPI.

START NOW
Begin by inspecting the existing `react/` sample files in the workspace and the git history, then implement the Angular sample under `angular/` following the steps above.
