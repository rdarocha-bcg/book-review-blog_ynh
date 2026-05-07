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
- Grant **app admin** by listing YunoHost **logins** in the install question, separated by **commas** (you can also use semicolons or spaces — see `parseAdminUsernames` in `api/src/sso.ts`). **Do not use dots** as separators: `alice.bob` is read as one invalid username. If you saved a mistaken value, fix it with:
  `sudo yunohost app setting set <app_id> admin_usernames -v "alice,bob"` then set the same value for `ADMIN_USERNAMES` in `<install_dir>/api/.env` and run `sudo systemctl restart <app_id>` (`install_dir` is often under `/var/www/<app_id>` or `/home/yunohost.app/<app_id>` — check `yunohost app info <app_id>`).

### Reference

- [../README.md](../README.md)
- [../docs/API_SSO.md](../docs/API_SSO.md)
