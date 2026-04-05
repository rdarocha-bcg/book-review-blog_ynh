# Book Review Blog

Angular frontend for a book review blog. Reviews, auth, and admin are implemented; the backend is expected to be provided by a YunoHost REST API.

**Source:** [github.com/rdarocha-bcg/book-review-blog](https://github.com/rdarocha-bcg/book-review-blog) · **YunoHost install:** [github.com/rdarocha-bcg/book-review-blog_ynh](https://github.com/rdarocha-bcg/book-review-blog_ynh) (see [YUNOHOST_INTEGRATION.md](./YUNOHOST_INTEGRATION.md)).

## Quick start

1. **Node.js ≥ 18.19** (LTS recommended). `npm start` fails fast with a clear message if Node is too old.
2. From the repo root:

```powershell
npm install
npm start
```

3. When you see **Compiled successfully**, open **http://127.0.0.1:4200/** (use this URL on Windows if `localhost` gives `ERR_CONNECTION_REFUSED`).

**Same as `npm start`:** `npm run dev`

**Full local process** (Angular + optional Docker MariaDB + Fastify API, proxy, Windows script): **[docs/LOCAL_DEV.md](./docs/LOCAL_DEV.md)**

**Windows only — Node too old or stale server on port 4200:**

`powershell -ExecutionPolicy Bypass -File .\scripts\dev-windows.ps1 -KillPort4200`

Uses system Node when possible; otherwise downloads portable Node under `.tools\` (no admin). Omit `-KillPort4200` if you do not need to free port 4200.

Use **Node for Windows** and a normal terminal if you want to avoid WSL.

## Commands

| Command | Description |
|--------|-------------|
| `npm start` / `npm run dev` | Dev server at http://127.0.0.1:4200 (IPv4; checks Node ≥ 18.19) |
| `npm run db:up` / `npm run db:down` | Local MariaDB via Docker (see docs/LOCAL_DEV.md) |
| `npm run dev:api` | Fastify API in `api/` (port 3000; needs DB + `api/.env`) |
| `npm run db:migrate` | Apply SQL migrations in `api/` (after `npm ci` in `api/`) |
| `npm run build` | Development build |
| `npm run build:prod` | Production build |
| `npm run build:stats` | Production build + `stats.json` for bundle analysis |
| `npm test` | Unit tests (Karma/Jasmine) |
| `npm run test:coverage` | Tests with coverage report |
| `npm run lint` | Lint (ESLint) |

## Documentation

| Document | Purpose |
|----------|---------|
| [QUICKSTART.md](./QUICKSTART.md) | Short setup and first steps |
| [docs/LOCAL_DEV.md](./docs/LOCAL_DEV.md) | Local stack (Angular, proxy, Docker DB, API, Windows) |
| [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md) | Development workflow and patterns |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Application structure |
| [API.md](./API.md) | Expected REST contract (frontend ↔ backend) |
| [docs/API_SSO.md](./docs/API_SSO.md) | SSO headers and API behavior behind YunoHost |
| [YUNOHOST_INTEGRATION.md](./YUNOHOST_INTEGRATION.md) | Backend packaging and deployment |
| [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) | Common issues and fixes |
| [DEPLOYMENT.md](./DEPLOYMENT.md) | Production build and deploy |
| [GIT_AND_RELEASE.md](./GIT_AND_RELEASE.md) | Git workflow and releases |
| [CODING_STANDARDS.md](./CODING_STANDARDS.md) | Style and conventions |
| [CURSOR_MCP.md](./CURSOR_MCP.md) | Cursor MCP (Playwright) for local debugging |

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

For local dev, use the proxy (`proxy.conf.cjs`): `apiUrl` `/api` and run `npm start`. For the bundled Fastify API + DB, see [docs/LOCAL_DEV.md](./docs/LOCAL_DEV.md) and [YUNOHOST_INTEGRATION.md](./YUNOHOST_INTEGRATION.md).

## License

Private project.
