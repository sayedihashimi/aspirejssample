# Aspire Learnings

This document contains accumulated learnings from working with .NET Aspire projects, particularly with JavaScript frontends.

---

## 1. Aspire CLI does not have a 'build' command - use dotnet publish and docker build for container images

**Tags:** aspire, ci, build-yml, docker, container, github-actions, dotnet-publish, aspire-cli

### Context
CI pipeline was using `aspire build` or `aspire do build` commands to build Docker container images for an Aspire-based application with JavaScript frontends.

### What Was Missed
The Aspire CLI does not have a `build` command. The available commands are:
- `new` - Create a new Aspire project
- `init` - Initialize Aspire support
- `run` - Run in development mode
- `add` - Add hosting integrations
- `publish` - Generate deployment artifacts (Preview)
- `deploy` - Deploy to targets (Preview)
- `do` - Execute pipeline steps (Preview)

The `aspire publish` command generates manifests and docker-compose files but does NOT build Docker images.

### Impact
CI pipeline failed with:
```
Unrecognized command or argument 'build'.
```

### What Fixed It
Replace `aspire build` with the proper image building approach:

1. **For .NET API projects**: Use `dotnet publish` with container support:
   ```bash
   dotnet publish "path/to/Project.csproj" -c Release /t:PublishContainer -p:ContainerImageName="imagename" -p:ContainerImageTag="$COMMIT_SHA"
   ```

2. **For JavaScript apps with `PublishAsDockerFile()`**: Build Docker images directly:
   ```bash
   docker build -t "imagename:$COMMIT_SHA" "path/to/frontend"
   ```

### Reusable Rule
When building container images in CI for Aspire applications:
1. Do NOT use `aspire build` - it doesn't exist
2. Use `dotnet publish /t:PublishContainer` for .NET projects
3. Use `docker build` for JavaScript/Node apps with Dockerfiles
4. The `aspire publish` command generates deployment manifests, not container images
5. Check the AppHost.cs for `PublishAsDockerFile()` calls to identify which services need Docker builds

---

## 2. Aspire monorepo samples require unique service names to avoid env var collisions

**Tags:** aspire, monorepo, service-names, environment-variables, vue, angular, react, omission

### Context
In a monorepo with multiple Aspire samples (React, Angular, Vue), each sample needs unique service names to avoid conflicts. Service names like `apiservice` and `frontend` generate environment variables (e.g., `APISERVICE_HTTPS`) that would collide across samples.

### What Was Missed
1. Initial Vue sample used generic names `apiservice` and `frontend` instead of `apiservicevue` and `frontendvue`
2. The instruction files (`.github/prompts/build-vue-app.md`, `build-angular-app.md`) incorrectly specified using generic names
3. All files referencing the environment variables needed updating

### Impact
- Environment variable name collisions in monorepo
- Confusion about which service belongs to which sample
- CI workflow already expected unique names but AppHost used generic ones

### What Fixed It
Updated all files that reference service names:
1. `AppHost.cs` - service registration names
2. `vite.config.js` / `proxy.conf.js` - environment variable references (`APISERVICEVUE_HTTPS`, etc.)
3. `default.conf.template` - nginx proxy environment variables
4. `README.md` - documentation examples
5. `.github/prompts/*.md` - instruction files
6. `.github/workflows/build.yml` - Docker image names (was already correct)

### Reusable Rule
When creating a new Aspire sample in a monorepo:
1. Use unique service names with sample suffix: `apiservice<sample>`, `frontend<sample>` (e.g., `apiservicevue`, `frontendvue`)
2. Update ALL files that reference environment variables derived from service names:
   - Proxy configs (vite.config.js, proxy.conf.js)
   - Nginx configs (default.conf.template)  
   - README documentation
   - CI workflow (build.yml)
   - Instruction files (.github/prompts/*.md)
3. Environment variable format: `<SERVICENAME>_HTTPS`, `<SERVICENAME>_HTTP` (uppercase with underscores)

**Search pattern:**
```bash
grep -rE "APISERVICE|apiservice|frontend" --include="*.cs" --include="*.js" --include="*.yaml" --include="*.yml" --include="*.template" --include="*.md" <sample-folder>/
```

---

## 3. JavaScript frontends in Aspire need Dockerfile, nginx config, and PublishAsDockerFile() for CI container builds

**Tags:** aspire, react, vite, dockerfile, ci, omission, docker, apphost, javascript

### Context
Setting up CI to build container images for an Aspire solution with both Angular and React JavaScript frontends.

### What Was Missed
The React frontend was missing Docker containerization support:
1. No `Dockerfile` in the React project directory
2. No `default.conf.template` for nginx configuration
3. AppHost used `AddViteApp()` instead of `AddJavaScriptApp().PublishAsDockerFile()`

The Angular app had all these files, but React was configured differently.

### Impact
CI failed with:
```
ERROR: failed to build: failed to solve: failed to read dockerfile: open Dockerfile: no such file or directory
```

### What Fixed It
1. Created `Dockerfile` for React/Vite app:
   ```dockerfile
   FROM node:20 AS build
   WORKDIR /app
   COPY package.json package-lock.json ./
   RUN npm install
   COPY . .
   RUN npm run build
   
   FROM nginx:alpine
   COPY --from=build /app/default.conf.template /etc/nginx/templates/default.conf.template
   COPY --from=build /app/dist /usr/share/nginx/html
   EXPOSE 80
   CMD ["nginx", "-g", "daemon off;"]
   ```
   Note: Vite outputs to `dist/` (not `dist/projectname/browser` like Angular)

2. Created `default.conf.template` for nginx with correct API service name

3. Updated `AppHost.cs` to use `AddJavaScriptApp()` with `PublishAsDockerFile()`:
   ```csharp
   var frontend = builder.AddJavaScriptApp("frontend", "../myreactapp.web", "dev")
       .WithReference(apiService)
       .WaitFor(apiService)
       .WithHttpEndpoint(env: "PORT")
       .WithExternalHttpEndpoints()
       .PublishAsDockerFile();
   ```

### Reusable Rule
When adding Docker/CI support for JavaScript frontends in Aspire:
1. Each frontend needs a `Dockerfile`
2. Each frontend needs a `default.conf.template` for nginx
3. AppHost must use `PublishAsDockerFile()` for container builds
4. Build output paths differ by framework:
   - Vite/React: `dist/`
   - Angular 17+: `dist/<projectname>/browser`
5. The nginx template must reference the correct API service name (matches AppHost registration)

---

## 4. Angular Dockerfile must match project outputPath from angular.json

**Tags:** angular, dockerfile, build-output, refactor, omission, ci, docker

### Context
Renaming or creating an Angular project in an Aspire solution where the Dockerfile was copied from a template or another project.

### What Was Missed
The Dockerfile contained a hardcoded path to the Angular build output that didn't match the actual project name:
- Dockerfile had: `COPY --from=build /app/dist/weather/browser /usr/share/nginx/html`
- Angular project outputs to: `dist/myangularapp.web/browser` (based on `outputPath` in `angular.json`)

### Impact
Docker build failed with:
```
"/app/dist/weather/browser": not found
```

### What Fixed It
Updated the Dockerfile to use the correct output path matching the Angular project's `outputPath` in `angular.json`:
```dockerfile
COPY --from=build /app/dist/myangularapp.web/browser /usr/share/nginx/html
```

### Reusable Rule
When creating or renaming an Angular project with Docker support:
1. Check `angular.json` for the `outputPath` setting (e.g., `dist/projectname`)
2. Update Dockerfile `COPY` commands to match the actual output path
3. For Angular 17+, the browser build output is in `dist/<projectname>/browser`

**Search pattern to verify consistency:**
```bash
# Find output path in angular.json
grep -r "outputPath" angular.json

# Find COPY commands in Dockerfile referencing dist
grep "dist/" Dockerfile
```

---

## 5. Aspire JavaScript apps must configure dev server to use PORT env var

**Tags:** aspire, javascript, vite, vue, react, angular, port-configuration, omission

### Context
When creating a JavaScript frontend app (Vue, React, Angular) with .NET Aspire, the AppHost uses `.WithHttpEndpoint(env: "PORT")` to tell Aspire to assign a port and set it in the PORT environment variable for the frontend dev server.

### What Was Missed
The Vue sample was created with `vite.config.js` that didn't configure Vite to listen on the PORT environment variable. The Aspire dashboard URL for the frontend didn't work because Vite was listening on its default port (5173) instead of the Aspire-assigned port.

### Impact
- The URL shown in the Aspire dashboard for the frontend doesn't work
- Users can only access the frontend via localhost URL in the console
- Same issue occurred with Angular implementation before being fixed

### What Fixed It
For Vite-based apps (Vue, React), add `port: parseInt(process.env.PORT) || 5173` to the server config in `vite.config.js`:

```javascript
server: {
  port: parseInt(process.env.PORT) || 5173,
  proxy: {
    // ...
  }
}
```

For Angular apps, use `run-script-os` to handle cross-platform PORT variable:
- `"start:win32": "ng serve --port %PORT%"`
- `"start:default": "ng serve --port $PORT"`

### Reusable Rule
When creating an Aspire JavaScript app with `.WithHttpEndpoint(env: "PORT")`:
1. **Vite apps**: Add `port: parseInt(process.env.PORT) || <default>` to `server` config in `vite.config.js`
2. **Angular apps**: Use `run-script-os` with `--port %PORT%` (Windows) and `--port $PORT` (Unix)
3. **Other dev servers**: Configure to read PORT from environment
4. Verify the Aspire dashboard URL works, not just the localhost console URL

---

## 6. Aspire JavaScript hosting uses AddJavaScriptApp not AddNpmApp

**Tags:** aspire, javascript, nextjs, hosting, build-failure, apphost

### Context
Creating an Aspire-hosted Next.js (or other JavaScript/Node.js) application sample.

### What Was Missed
The AppHost.cs used `AddNpmApp` which does not exist in the `Aspire.Hosting.JavaScript` package.

### Impact
Build failure with error:
```
error CS1061: 'IDistributedApplicationBuilder' does not contain a definition for 'AddNpmApp'
```

### What Fixed It
Changed `builder.AddNpmApp(...)` to `builder.AddJavaScriptApp(...)` which is the correct method name in `Aspire.Hosting.JavaScript`.

```csharp
// Wrong - does not exist
var frontend = builder.AddNpmApp("frontendnextjs", "../mynextjsapp.web", "dev")

// Correct
var frontend = builder.AddJavaScriptApp("frontendnextjs", "../mynextjsapp.web", "dev")
```

### Reusable Rule
When adding JavaScript/Node.js apps (React, Next.js, Vue, Angular, etc.) to an Aspire AppHost:
1. Use `builder.AddJavaScriptApp("serviceName", "path", "scriptName")`
2. NOT `AddNpmApp` or `AddViteApp` (these are not valid method names)
3. The `Aspire.Hosting.JavaScript` package provides `AddJavaScriptApp` as the generic method for any JavaScript framework

---

## 7. Next.js Aspire apps need run-script-os for cross-platform PORT handling

**Tags:** aspire, nextjs, javascript, port-configuration, cross-platform, windows, run-script-os

### Context
Creating an Aspire-hosted Next.js application that needs to run on Windows.

### What Was Missed
The `package.json` dev script used bash syntax `${PORT:-3000}` which doesn't work on Windows PowerShell. Next.js CLI directly receives the port argument, so cross-platform syntax is required.

### Impact
Runtime error on Windows:
```
error: option '-p, --port <port>' argument '${PORT:-3000}' is invalid. '${PORT:-3000}' is not a non-negative number.
```

### What Fixed It
Used `run-script-os` package to provide platform-specific scripts:

```json
{
  "scripts": {
    "dev": "run-script-os",
    "dev:win32": "next dev -p %PORT%",
    "dev:default": "next dev -p $PORT"
  },
  "devDependencies": {
    "run-script-os": "^1.1.6"
  }
}
```

### Reusable Rule
When creating Aspire JavaScript apps that pass PORT as a CLI argument:
1. Do NOT use bash syntax `${PORT:-default}` - fails on Windows
2. Use `run-script-os` with platform-specific scripts:
   - `script:win32` for Windows: uses `%PORT%`
   - `script:default` for Unix/Mac: uses `$PORT`
3. This applies to Next.js, Angular, and any framework where PORT is passed as CLI arg
4. Vite-based apps (React, Vue) handle PORT in config file, so they don't need this

---

## 8. Nuxt apps use #__nuxt root element, not #app, for centering CSS

**Tags:** aspire, nuxt, css, centering, javascript-samples, body-flex

### Context
Creating a Nuxt.js sample in the Aspire monorepo with the same centered layout as other JavaScript samples (Vue, React, etc.).

### What Was Missed
1. Nuxt uses `#__nuxt` as its root element, not `#app` like Vite-based apps
2. Nuxt requires a separate global CSS file referenced in `nuxt.config.ts`
3. The weather table needs proper centering styles matching other samples

### Impact
Weather table appeared left-aligned instead of horizontally and vertically centered like other samples.

### What Fixed It
1. Created `assets/css/global.css` with standard body flex centering and `#__nuxt { width: 100% }`
2. Added `css: ['~/assets/css/global.css']` to `nuxt.config.ts`
3. Updated `app.vue` to use `.weather-container` class with centered table styles

```css
/* In global.css */
body {
  margin: 0;
  display: flex;
  place-items: center;
  min-width: 320px;
  min-height: 100vh;
}

#__nuxt {
  width: 100%;
}
```

```css
/* In app.vue scoped styles */
.weather-container {
  margin: 0 auto;
  text-align: center;
  width: 100%;
}

#weatherTable {
  margin-left: auto;
  margin-right: auto;
}
```

### Reusable Rule
When creating Nuxt.js samples with centered layouts:
1. Use `#__nuxt` instead of `#app` for root element width styling
2. Create `assets/css/global.css` for body flex centering
3. Reference CSS in `nuxt.config.ts` with `css: ['~/assets/css/global.css']`
4. Use `.weather-container` with `text-align: center` and `margin: 0 auto` for content centering
5. Use `margin-left: auto; margin-right: auto` on tables for horizontal centering

---

## 9. Astro apps need run-script-os for PORT and inline centering CSS

**Tags:** aspire, astro, javascript, port-configuration, cross-platform, windows, run-script-os, css, centering

### Context
Creating an Aspire-hosted Astro application that needs to run on Windows and match the centered layout of other JavaScript samples.

### What Was Missed
1. The Astro dev command accepts `--port` as a CLI argument, requiring cross-platform handling
2. Setting `port` in `vite.server` config inside `astro.config.mjs` does NOT work - Astro uses its own dev server, not Vite's
3. The weather table CSS styling was not centered (used basic left-aligned table styles)

### Impact
- The URL shown in the Aspire dashboard for the frontend didn't work (Astro listened on default port 4321)
- Weather table was left-aligned instead of horizontally and vertically centered like other samples

### What Fixed It
1. Used `run-script-os` package for cross-platform PORT handling in `package.json`:
   ```json
   {
     "scripts": {
       "dev": "run-script-os",
       "dev:win32": "astro dev --port %PORT%",
       "dev:default": "astro dev --port $PORT"
     },
     "devDependencies": {
       "run-script-os": "^1.1.6"
     }
   }
   ```

2. Updated `index.astro` with proper centering CSS (inline since Astro pages are self-contained):
   - Body flexbox: `display: flex; place-items: center; min-height: 100vh;`
   - Container wrapper: `.weather-container { margin: 0 auto; text-align: center; width: 100%; }`
   - Table centering: `#weatherTable { margin-left: auto; margin-right: auto; }`

3. Removed the `vite.server.port` config from `astro.config.mjs` (it doesn't affect the dev server)

### Reusable Rule
When creating Astro samples in Aspire:
1. Use `run-script-os` with `--port %PORT%` (Windows) and `--port $PORT` (Unix) - same pattern as Angular/Next.js
2. Do NOT configure port in `astro.config.mjs` under `vite.server` - Astro ignores it for dev server
3. Add centering CSS inline in the Astro page (body flex, container wrapper, table margins)
4. Match styling to other samples (dark/light mode, fonts, table styles)

---

## Quick Reference Checklist

### Adding a new JavaScript frontend to Aspire

- [ ] Create unique service names (e.g., `apiservicevue`, `frontendvue`)
- [ ] Add `Dockerfile` in frontend project
- [ ] Add `default.conf.template` for nginx
- [ ] Configure dev server to use `PORT` environment variable
- [ ] Use `PublishAsDockerFile()` in AppHost
- [ ] Update all files referencing service names/env vars
- [ ] Verify Docker output paths match framework conventions
- [ ] Match CSS styling to existing samples (use same table styles, fonts, layout)

### CI/CD for Aspire projects

- [ ] Use `dotnet publish /t:PublishContainer` for .NET projects
- [ ] Use `docker build` for JavaScript frontends
- [ ] Do NOT use `aspire build` (doesn't exist)
- [ ] Check `AppHost.cs` for `PublishAsDockerFile()` calls
