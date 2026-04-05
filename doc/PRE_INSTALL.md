### Single package: frontend + API + database

This YunoHost app ships:

- The **Angular** UI (static files)
- The **Fastify** REST API in `api/` (Node, `systemd`)
- **MariaDB** via `resources.database`

You do **not** need a separate backend URL. NGINX proxies `/path/api/` to `http://127.0.0.1:<allocated-port>/api/` and forwards **SSOWat** user headers to the API.

### Prerequisites

- Enough RAM for `npm ci` + `ng build` on the server (see `manifest.toml` `ram.build`).
- MariaDB provided by YunoHost for this app instance.

### After install

- Sign in via the **YunoHost user portal** so the browser has an SSO session; the app uses `GET /api/auth/me` with cookies.
- Grant **app admin** by listing YunoHost usernames in the install question (stored as `ADMIN_USERNAMES` for the API).

### Reference

- [../README.md](../README.md)
- [../docs/API_SSO.md](../docs/API_SSO.md)
