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

`ng serve --host 127.0.0.1 --port 4200 --proxy-config proxy.conf.json --disable-host-check`

so the dev server listens on **IPv4** loopback and uses the **proxy** for `/api`.

## Backend (API)

- Dev uses `apiUrl: '/api'`; `proxy.conf.json` forwards `/api` to **`http://localhost:3000`** by default.
- If nothing runs on port 3000, the UI can still load; list endpoints may return empty or error until you point `proxy.conf.json` `target` at a real API (e.g. Yunohost). See [YUNOHOST_INTEGRATION.md](../YUNOHOST_INTEGRATION.md).

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
