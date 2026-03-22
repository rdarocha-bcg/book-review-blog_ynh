# Troubleshooting Guide - Book Review Blog

## Development

### `npm start` fails or port 4200 in use

**Symptom**: Error like "Port 4200 is already in use" or EADDRINUSE.

**Solution**:
- Stop any other Angular or dev server using port 4200.
- Use another port: `ng serve --port 4300`
- On Windows, find process: `netstat -ano | findstr :4200` then `taskkill /PID <pid> /F`

---

### Build fails with "Cannot find module"

**Symptom**: `Error: Cannot find module '@core/...'` or similar.

**Solution**:
- Ensure path aliases are in `tsconfig.json` (e.g. `"@core/*": ["src/app/core/*"]`).
- Restart the IDE/TypeScript server.
- Run `npm install` and `ng build` again.
- If the path is wrong, use the correct alias: `@core`, `@shared`, `@features`, `@environments`.

---

### Tailwind classes not applied

**Symptom**: Utility classes like `bg-yellow-400` have no effect.

**Solution**:
- Confirm `tailwind.config.js` has `content: ["./src/**/*.{html,ts}"]`.
- Restart the dev server after changing Tailwind config.
- Check that `styles.scss` imports Tailwind (e.g. `@import "tailwindcss/base"` etc.).

---

### Tests fail: "NullInjectorError: No provider for X"

**Symptom**: TestBed fails with no provider for a service or token.

**Solution**:
- Add the missing provider in `TestBed.configureTestingModule({ providers: [...] })`.
- For services used by the component under test, either provide the real service (if it has no heavy deps) or a spy:  
  `{ provide: MyService, useValue: jasmine.createSpyObj('MyService', ['method']) }`.
- If the component uses `Router` or `ActivatedRoute`, add `RouterTestingModule` or provide mocks.

---

### Tests fail: HTTP request not matched

**Symptom**: "Expected one matching request, found none" (or similar) in HTTP tests.

**Solution**:
- Ensure the test triggers the code that calls the API (e.g. `fixture.detectChanges()`, or calling a method that does the HTTP call).
- Use `httpMock.expectOne((req) => req.url.includes('your-endpoint'))` to match the URL.
- Call `req.flush(mockData)` or `req.error(...)` to complete the request.
- Call `httpMock.verify()` in `afterEach` to ensure no outstanding requests.

---

## Authentication

### Login does nothing or redirects incorrectly

**Symptom**: Clicking Login doesn’t navigate or shows no error.

**Solution**:
- Open DevTools (F12) → Network: check if `POST .../auth/login` is sent and what it returns.
- If 401: wrong email/password or backend not returning token.
- If CORS: backend must allow your origin and send proper CORS headers.
- Check `environment.ts`: `apiUrl` must point to the correct API (or proxy).

---

### "Unauthorized" or 401 on API calls after login

**Symptom**: After logging in, other requests return 401.

**Solution**:
- Ensure the auth interceptor attaches the token: `Authorization: Bearer <token>`.
- Check that the backend expects the token in the header and that the token is not expired.
- In DevTools → Application → Local Storage, confirm `auth_token` is set after login.

---

### Logout or session lost on refresh

**Symptom**: User is logged out after page refresh.

**Solution**:
- Token is stored in `localStorage`; it persists across refreshes. If it’s lost, something may be clearing storage or the app may be redirecting on 401.
- Check that `AuthGuard` (or similar) doesn’t redirect before the token is read from storage.
- Ensure the backend token has a sufficient TTL if you expect long-lived sessions.

---

## API / Backend

### CORS errors in browser

**Symptom**: Console shows "blocked by CORS policy" or "No 'Access-Control-Allow-Origin' header".

**Solution**:
- Configure CORS on the Yunohost backend to allow your frontend origin and methods/headers (e.g. `Authorization`, `Content-Type`).
- For local dev, use the proxy: set `apiUrl` to a path that goes through `proxy.conf.json` to the real API, and run `ng serve` so the proxy is used.

---

### API URL or proxy wrong

**Symptom**: Requests go to wrong host or 404.

**Solution**:
- **Development**: In `src/environments/environment.ts`, set `apiUrl` to the path that the proxy forwards (e.g. `/api` if proxy strips prefix). In `proxy.conf.json`, set `target` to your real API base URL.
- **Production**: In `environment.prod.ts`, set `apiUrl` to the full API base (e.g. `https://your-domain.com/api`).
- Restart the dev server after changing environment or proxy.

---

## Production build

### `ng build` or `npm run build:prod` fails

**Symptom**: Build error (e.g. type error, missing file, budget exceeded).

**Solution**:
- Fix TypeScript and template errors reported in the output.
- If bundle budget exceeded: reduce bundle size (lazy load more, drop unused deps) or adjust `angular.json` budgets.
- Ensure all imports resolve (path aliases, correct file names).

---

### Blank page after deployment

**Symptom**: Deployed app shows blank screen.

**Solution**:
- Ensure the server serves `index.html` for all routes (SPA fallback). Example (Nginx): `try_files $uri $uri/ /index.html;`
- Check base href: if the app is in a subfolder, build with `ng build --base-href /your-subfolder/`.
- Open DevTools → Console and Network for failed requests (e.g. 404 for JS/CSS or API).

---

## Performance

### First load slow or bundle large

**Symptom**: Slow initial load or large main bundle.

**Solution**:
- Confirm feature routes are lazy-loaded (`loadComponent` / `loadChildren` with dynamic import).
- Generate bundle stats: `npm run build:stats` (writes `dist/book-review-blog/stats.json`). Use a tool like [webpack-bundle-analyzer](https://www.npmjs.com/package/webpack-bundle-analyzer) or the Angular [bundle analyzer](https://angular.dev/tools/cli/split-by-route) to inspect.
- Check `angular.json` production budgets; fix or relax if needed.
- Consider smaller alternatives for heavy libraries or load them only where needed.

---

## Getting more help

- **Codebase**: See `DEVELOPER_GUIDE.md`, `ARCHITECTURE.md`, `CODING_STANDARDS.md`.
- **API**: See `YUNOHOST_INTEGRATION.md`.
- **Setup**: See `QUICKSTART.md`, `README.md`.

If the issue persists, note the exact error message, steps to reproduce, and environment (OS, Node version, `ng version`) when asking for help.
