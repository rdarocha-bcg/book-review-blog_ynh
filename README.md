# Book Review Blog

Angular frontend for a book review blog. Reviews, auth, and admin are implemented; the backend is expected to be provided by a Yunohost REST API.

## Quick start

```bash
npm install
npm start
```

Open **http://localhost:4200/**.

## Commands

| Command | Description |
|--------|-------------|
| `npm start` | Dev server at http://localhost:4200 |
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
| [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md) | Development and patterns |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Architecture and structure |
| [YUNOHOST_INTEGRATION.md](./YUNOHOST_INTEGRATION.md) | Backend API and deployment |
| [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) | Common issues and fixes |
| [DEPLOYMENT.md](./DEPLOYMENT.md) | Production build and deploy (e.g. Yunohost) |
| [GIT_AND_RELEASE.md](./GIT_AND_RELEASE.md) | Git, tags, and going live |

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
