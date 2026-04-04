# Book Review Blog

Angular frontend for a book review blog. Reviews, auth, and admin are implemented; the backend is expected to be provided by a Yunohost REST API.

## Quick start

1. **Node.js ≥ 18.19** (LTS recommended). `npm start` fails fast with a clear message if Node is too old.
2. From the repo root:

```powershell
npm install
npm start
```

3. When you see **Compiled successfully**, open **http://127.0.0.1:4200/** (use this URL on Windows if `localhost` gives `ERR_CONNECTION_REFUSED`).

**Same as `npm start`:** `npm run dev`

**Full local process** (backend, proxy, Windows script, port issues): **[docs/LOCAL_DEV.md](./docs/LOCAL_DEV.md)**

**Windows only — Node too old or stale server on port 4200:**

`powershell -ExecutionPolicy Bypass -File .\scripts\dev-windows.ps1 -KillPort4200`

Uses system Node when possible; otherwise downloads portable Node under `.tools\` (no admin). Omit `-KillPort4200` if you do not need to free port 4200.

Use **Node for Windows** and a normal terminal if you want to avoid WSL.

## Commands

| Command | Description |
|--------|-------------|
| `npm start` / `npm run dev` | Dev server at http://127.0.0.1:4200 (IPv4; checks Node ≥ 18.19) |
| `npm run build` | Development build |
| `npm run build:prod` | Production build |
| `npm run build:stats` | Production build + `stats.json` for bundle analysis |
| `npm test` | Unit tests (Karma/Jasmine) |
| `npm run test:coverage` | Tests with coverage report |
| `npm run lint` | Lint (ESLint) |

## Documentation

| Document | Purpose |
|----------|---------|
| [START_HERE.md](./START_HERE.md) | Entry point and navigation |
| [QUICKSTART.md](./QUICKSTART.md) | 5-minute setup and first steps |
| [docs/LOCAL_DEV.md](./docs/LOCAL_DEV.md) | Local launch process (npm, proxy, Windows) |
| [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md) | Development and patterns |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Architecture and structure |
| [YUNOHOST_INTEGRATION.md](./YUNOHOST_INTEGRATION.md) | Backend API and deployment |
| [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) | Common issues and fixes |
| [DEPLOYMENT.md](./DEPLOYMENT.md) | Production build and deploy (e.g. Yunohost) |
| [GIT_AND_RELEASE.md](./GIT_AND_RELEASE.md) | Git, tags, and going live |
| [CURSOR_MCP.md](./CURSOR_MCP.md) | Cursor MCP (Playwright browser) for local debugging |

## Tech stack

- **Angular** 18 (standalone components, lazy-loaded routes)
- **Tailwind CSS** for styling
- **RxJS** for state and async
- **TypeScript** strict mode

## Project structure

- `src/app/core` – Services (API, Auth, Storage, Notifications), guards, interceptors  
- `src/app/shared` – Reusable components (Header, Footer, Button, Card, etc.) and error pages  
- `src/app/features` – Reviews, Auth, Admin, Blog (lazy-loaded)  
- `src/environments` – API URL and config (dev/prod)

## Backend

Configure the API base URL in:

- `src/environments/environment.ts` (development)
- `src/environments/environment.prod.ts` (production)

For local dev with a remote API, use the proxy: set `apiUrl` to the proxy path and run `npm start`. See [YUNOHOST_INTEGRATION.md](./YUNOHOST_INTEGRATION.md) and `proxy.conf.json`.

## License

Private project.
