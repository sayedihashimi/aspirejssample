YOU ARE COPILOT WORKING INSIDE THIS REPO WORKSPACE.

GOAL
Create a new Next.js sample that is functionally equivalent to the existing Aspire 13 React sample that lives under the `react/` folder of this repo:
- Repo: https://github.com/sayedihashimi/aspirejssample
- React sample folder: `react/`
- Create a Next.js sample folder: `nextjs/`
- The Next.js sample must implement the same Aspire architecture and runtime behavior as the React one:
  - AppHost orchestrator
  - ASP.NET Core Web API backend
  - Next.js dev server with proxy to `/api`
  - Production publish packs the built Next.js output into the API's `wwwroot` and serves it via `UseFileServer()`
  - Health checks and ServiceDefaults
  - No hardcoded URLs; use Aspire-provided env vars for service URLs

Follow the instructions in ./memorizer.md.

IMPORTANT: UNIQUE SERVICE NAMES (NO CONFLICTS)
- Service names MUST be unique across samples to avoid env var collisions.
- For THIS Next.js sample:
  - API service name MUST be: `apiservicenextjs`
  - Frontend service name MUST be: `frontendnextjs`
- Therefore, the Next.js dev server MUST proxy `/api/*` to:
  - `process.env.APISERVICENEXTJS_HTTPS || process.env.APISERVICENEXTJS_HTTP`
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
- A new folder `nextjs/` exists at repo root (sibling to `react/`).
- Inside `nextjs/` there is a 3–4 project Aspire solution equivalent to React's:
  - *.AppHost (Aspire orchestrator)
  - *.api (ASP.NET Core Web API backend)
  - *.ServiceDefaults (Aspire ServiceDefaults shared project)
  - Next.js frontend project with appropriate project representation in the solution (e.g., esproj if that's what the React sample used; follow the pattern used in `react/` and Aspire docs).

B) Dev mode behavior
- Running the AppHost starts:
  - the API project
  - the Next.js dev server
- The Next.js dev server proxies `/api/*` to the API service using Aspire-injected environment variables:
  - APISERVICENEXTJS_HTTPS and/or APISERVICENEXTJS_HTTP
- The Next.js UI fetches `/api/weatherforecast` and displays a table with columns:
  - Date, Temp (C), Temp (F), Summary
- No hardcoded API base URL in Next.js source; always relative `/api/...`

C) Production/container behavior
- The API publishes with the Next.js build output copied into API `wwwroot` (same idea as React's `PublishWithContainerFiles(frontend, "./wwwroot")`).
- The API serves:
  - static frontend files (index.html + assets) via `UseFileServer()`
  - the weather endpoint at `/api/weatherforecast`
- The AppHost build/publish pipeline works similarly to the React sample (don't break existing CI).

D) Quality gates
- `dotnet build` for the Next.js solution succeeds.
- The Aspire build command used in CI (see `.github/workflows/build.yml`) still works for the repo and doesn't regress other samples.
- Next.js app builds with `npm run build` without errors.

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
- Reuse the same ServiceDefaults approach and code from `react/` (don't reinvent).

3) AppHost project (UNIQUE SERVICE NAMES)
- Mirror React's `AppHost.cs` behavior, but with unique names:
  - uses `DistributedApplication.CreateBuilder(args)`
  - includes docker compose environment: `builder.AddDockerComposeEnvironment("env")` (if that's still in the React sample; match it)
  - registers the API project as `"apiservicenextjs"` with health check and external endpoints
  - registers the frontend as `"frontendnextjs"` as a Node/JavaScript app that runs Next.js dev server
    - Use the Aspire JavaScript hosting package approach recommended by Aspire 13 docs
    - In React sample it uses `AddViteApp`. For Next.js, use `AddNpmApp` or similar (since Next.js has its own dev server, not Vite—VERIFY IN https://aspire.dev/ and/or existing workspace usage).
  - Add `.WithReference(apiService)` and `.WaitFor(apiService)` and `.WithExternalHttpEndpoints()` like the React sample
  - Production publish:
    - `apiService.PublishWithContainerFiles(frontend, "./wwwroot");`
    - Ensure the "frontend build output folder" is the one Next.js produces (typically `out/` for static export or `.next/` for standard builds). Confirm exact path in your Next.js app and wire it correctly in Aspire's publish configuration.

4) Next.js frontend project
- Create a Next.js app that matches functionality:
  - One main page/component that fetches weather forecasts on mount and renders the table.
  - Use Next.js App Router (recommended) or Pages Router (acceptable).
  - Loading UI similar to React sample ("Loading... Please refresh once the ASP.NET backend has started." is fine).
- Dev proxy:
  - Implement Next.js rewrites or custom server config so `/api` is proxied to:
    - process.env.APISERVICENEXTJS_HTTPS || process.env.APISERVICENEXTJS_HTTP
  - Next.js uses `next.config.js` for rewrites. Configure it to read the env var and proxy `/api/*` requests.
  - Do not hardcode localhost ports.
- Build output:
  - For Aspire compatibility, configure Next.js for static export (`output: 'export'` in `next.config.js`) OR ensure the build output is compatible with being served from API `wwwroot`.
  - Ensure base path is compatible with being served from `/` (default).
  - `npm run build` should produce static assets suitable for copying into API `wwwroot`.

NAMING / CONSISTENCY
- Prefer to follow the same naming style as the React sample, but under `nextjs/`.
- Suggested (but adjust to match existing conventions):
  - Solution name: `MyNextJsApp.sln` (or mirror React naming; pick one and be consistent)
  - Projects: `MyNextJsApp.AppHost`, `MyNextJsApp.api`, `MyNextJsApp.ServiceDefaults`
  - Frontend folder: `mynextjsapp.web`
- If you choose different names, ensure AppHost service names remain unique to avoid conflicts:
  - API service registered as `"apiservicenextjs"`
  - Frontend registered as `"frontendnextjs"`
  This is important because the env var names are derived from the service name (e.g., `APISERVICENEXTJS_HTTPS`).

RECOMMENDED NEXT.JS IMPLEMENTATION DETAILS (KEEP IT SIMPLE)
- Use Next.js 14+ (latest stable version).
- Prefer App Router (new standard) but Pages Router is acceptable.
- Keep it minimal:
  - Main page fetches and renders weather table.
  - Use React hooks (useState, useEffect) for data fetching.
  - Date rendering: `new Date(forecast.date).toLocaleDateString()` like React sample.
- Configure for static export to simplify deployment:
  - Add `output: 'export'` in `next.config.js`
  - This makes Next.js generate static HTML/JS/CSS files suitable for serving from `wwwroot`

STEP-BY-STEP EXECUTION PLAN (DO THIS)
1) Inspect current React sample
- Read:
  - `react/MyReactApp.AppHost/AppHost.cs` (or `Program.cs` if used)
  - `react/MyReactApp.api/Program.cs`
  - `react/MyReactApp.ServiceDefaults/*`
  - `react/myreactapp.web/*` especially dev proxy config and build output config
- Run:
  - git --no-pager log
  - Use commit messages to replicate the same setup steps for Next.js.

2) Create `nextjs/` folder and scaffold the .NET projects
- Use the same dotnet templates and aspire version approach as React sample commits:
  - `dotnet new aspire-apphost ... -f net10.0 --aspire-version 13.0`
  - `dotnet new aspire-servicedefaults ...`
  - `dotnet new webapi ...`
- Add references like React sample did:
  - AppHost references api
  - api references ServiceDefaults
- Create solution and add projects like React sample commit (the sln + add commands).

3) Add Aspire JavaScript hosting support
- In React history there is `aspire add javascript`. Do the equivalent in the Next.js sample folder.
- Ensure the AppHost project references the needed Aspire.Hosting.JavaScript package version consistent with repo.

4) Scaffold Next.js app
- Use `npx create-next-app@latest` to create the app under `nextjs/<frontend-folder>`.
- Keep it as a standard Next.js app (App Router or Pages Router).
- Ensure `npm scripts` include:
  - `dev` (next dev)
  - `build` (next build)
- Implement UI component to fetch and render weather table.

5) Wire up Aspire dev orchestration
- In AppHost, add the frontend via the correct Aspire method for Node apps (use `AddNpmApp` since Next.js has its own dev server):
  - Configure working directory to the Next.js frontend folder.
  - Configure the dev command to run Next.js dev server (`npm run dev`).
  - Ensure env vars for `APISERVICENEXTJS_HTTP(S)` are available to the frontend process.
  - WaitFor + WithReference to the API service.
  - External endpoints enabled.

6) Configure Next.js proxy/rewrites to `/api`
- In `next.config.js`, add `rewrites` function that reads env:
  - APISERVICENEXTJS_HTTPS or APISERVICENEXTJS_HTTP
- Example:
  ```js
  async rewrites() {
    const apiUrl = process.env.APISERVICENEXTJS_HTTPS || process.env.APISERVICENEXTJS_HTTP;
    if (!apiUrl) return [];
    return [
      {
        source: '/api/:path*',
        destination: `${apiUrl}/api/:path*`,
      },
    ];
  }
  ```

7) Production publish integration
- Configure Next.js for static export: `output: 'export'` in `next.config.js`.
- Ensure AppHost publish step copies Next.js build output (`out/` directory for static export) into API `wwwroot`.
- Verify correct dist path for the Next.js version you scaffolded.
- Ensure API serves static assets via `UseFileServer()`.

8) Verify
- From repo root, ensure:
  - `dotnet build nextjs/<solution>.sln -c Release` succeeds
  - `npm run build` in Next.js folder succeeds
  - (Optional) run AppHost and confirm in browser:
    - frontend loads
    - data is shown
- Ensure existing samples remain unaffected.

DELIVERABLES
- New `nextjs/` folder with fully working Aspire+Next.js sample.
- Any minimal README notes under `nextjs/` describing:
  - how to run locally
  - how dev proxy works
  - how publish serves frontend from API wwwroot
- Commit messages should describe commands used (like existing repo practice).

DO NOT
- Do not change other samples unless you must to keep CI green.
- Do not hardcode localhost API ports/URLs in Next.js.
- Do not introduce unrelated frameworks or complex tooling.
- Do not use "Swagger" wording; refer to OpenAPI.

START NOW
Begin by inspecting the existing `react/` sample files in the workspace and the git history, then implement the Next.js sample under `nextjs/` following the steps above.
