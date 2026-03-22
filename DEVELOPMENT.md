# Development Guide - Book Review Blog

Setup and workflow for local development.

---

## Prerequisites

- **Node.js** 18.x or 20.x (LTS recommended)
- **npm** 9+
- **Angular CLI** (optional; use `npx ng` if not installed globally)

---

## Initial Setup

### 1. Clone and install

```bash
git clone <repository-url>
cd book-review-blog
npm install
```

### 2. Environment

- **Development** uses `src/environments/environment.ts`.
- Default `apiUrl`: `http://localhost:3000/api` (or your backend URL).

Edit if your API runs elsewhere:

```ts
// src/environments/environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
};
```

### 3. Proxy (optional)

To avoid CORS during dev, proxy API calls to your backend:

- Add or use `proxy.conf.json` at project root, e.g.:

```json
{
  "/api": {
    "target": "http://localhost:3000",
    "secure": false
  }
}
```

- In `angular.json`, under `projects > book-review-blog > architect > serve > options`:

```json
"proxyConfig": "proxy.conf.json"
```

Then the app can call `/api/...` and the dev server will forward to the target.

---

## Commands

| Command | Description |
|--------|-------------|
| `npm start` | Dev server at http://localhost:4200 |
| `npm run build` | Build (default config) |
| `npm run build:prod` | Production build |
| `npm test` | Unit tests (Karma) |
| `npm run test:coverage` | Tests with coverage report |
| `npm run lint` | Run ESLint |

---

## Project Structure (main parts)

- `src/app/core/` – Services (API, Auth, Storage), guards, interceptors
- `src/app/shared/` – Reusable components (header, footer, button, pagination, etc.)
- `src/app/features/` – Feature areas: `reviews`, `auth`, `blog`, `admin`
- `src/environments/` – Environment config (apiUrl, etc.)
- `src/styles.scss` – Global styles (Tailwind imported here or in angular.json)

---

## Troubleshooting

### Port 4200 already in use

```bash
ng serve --port 4300
```

### API calls fail (CORS)

- Use the proxy (see above), or
- Configure CORS on the backend to allow `http://localhost:4200`.

### Build fails with "environment" or path errors

- Ensure `src/environments/environment.ts` and `environment.prod.ts` exist.
- Check `tsconfig` paths (e.g. `@environments/*`) match your structure.

### Tests fail (Chrome / Karma)

- Run with headless Chrome: in `karma.conf.js` set `browsers: ['ChromeHeadless']` if needed.
- Clear cache: delete `node_modules/.cache` and run `npm test` again.

### Tailwind styles not applied

- Confirm `content` in `tailwind.config.js` includes `"./src/**/*.{html,ts}"`.
- Restart the dev server after changing `tailwind.config.js`.

---

## Code Style

- Follow the project’s **CODING_STANDARDS.md** and **ARCHITECTURE.md**.
- Run `npm run lint` before committing.
- Prefer standalone components and the existing folder structure (core, shared, features).

---

## Next Steps

- **Deployment:** see [DEPLOYMENT.md](./DEPLOYMENT.md).
- **API contract:** see [API.md](./API.md) for expected backend endpoints.
