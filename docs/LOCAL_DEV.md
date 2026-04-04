# Local development process

Single flow for running the Angular app on your machine. Comments in English; this doc is the team runbook.

## Prerequisites

- **Node.js ≥ 18.19** (Angular CLI 18). `npm start` checks this automatically (`scripts/ensure-node-version.mjs`).
- **npm** (comes with Node).
- **Git** (optional, for status only in helper scripts).

Use **Windows PowerShell or CMD** with Node for Windows if you want to avoid WSL.

## Recommended flow (any OS)

1. Clone / open the repo and go to the project root.
2. `npm install`
3. `npm start` (alias: `npm run dev`)
4. When the terminal shows **Compiled successfully**, open **http://127.0.0.1:4200/**  
   - On Windows, prefer this URL over `localhost` if you see `ERR_CONNECTION_REFUSED` (IPv4 vs IPv6 — see [TROUBLESHOOTING.md](../TROUBLESHOOTING.md)).
5. Leave the terminal running; stop the server with **Ctrl+C**.

`npm start` runs:

`ng serve --host 127.0.0.1 --port 4200 --proxy-config proxy.conf.cjs --disable-host-check`

so the dev server listens on **IPv4** loopback and uses the **proxy** for `/api`.

## Full stack locally (Angular + Fastify API + MariaDB)

Use this when you want `/api` to hit the real Fastify app in `api/` instead of a remote Yunohost instance.

1. **Docker** (Docker Desktop or Engine) for MariaDB.
2. From the repo root, start the database. `npm run db:up` runs `docker compose up -d --wait`, which blocks until the MariaDB service passes its healthcheck (requires **Docker Compose v2.20+**). If `--wait` is unsupported, run `docker compose up -d` manually, then wait until `docker compose ps` shows **healthy** before migrating.

3. Configure the API:

   ```bash
   cp api/.env.example api/.env
   ```

   Keep `ADMIN_USERNAMES=devuser` so it matches the default `ynh-user` injected by `proxy.conf.cjs` (or set `DEV_YNH_USER` when you run `npm start`).

4. Install API dependencies (once), apply SQL migrations, then run the API:

   ```bash
   cd api && npm ci && npm run migrate && npm run dev
   ```

   Or from the repo root: `npm run db:migrate` (after `npm ci` in `api/` once).

5. In a **second** terminal, from the repo root: `npm start` and open **http://127.0.0.1:4200/**.

6. Stop the database when finished: `npm run db:down` (data is kept in the Docker volume until you remove it).

Convenience scripts at repo root: `npm run db:up`, `npm run db:down`, `npm run db:migrate`, `npm run dev:api` (same Node ≥ 18.19 check as `npm start` for `db:migrate` and `dev:api`).

## Backend (API) — summary

- Dev uses `apiUrl: '/api'`; `proxy.conf.cjs` forwards `/api` to **`http://127.0.0.1:3000`** and injects dev SSOWat-style headers (`DEV_*` env vars optional).
- If nothing runs on port 3000, the UI can still load; API calls will fail until you run the local API or point the proxy at another backend. See [YUNOHOST_INTEGRATION.md](../YUNOHOST_INTEGRATION.md).

## Windows helper script

If Node is too old or you want a one-shot setup (portable Node under `.tools/`, optional port cleanup):

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\dev-windows.ps1
```

Options:

- **`-KillPort4200`** — stop whatever is **listening on port 4200** (stale `ng serve`) before starting.
- **`-SkipInstall`** — skip `npm install`.

Example:

```powershell
.\scripts\dev-windows.ps1 -KillPort4200
```

## If something fails

See **[TROUBLESHOOTING.md](../TROUBLESHOOTING.md)** (port in use, connection refused, API, etc.).
