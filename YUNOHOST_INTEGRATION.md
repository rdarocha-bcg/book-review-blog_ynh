# YunoHost integration — SSO + bundled API

The **YunoHost package** in `yunohost/` deploys the **Angular SPA**, the **Fastify API** (`api/`), and **MariaDB** on the same instance. Authentication uses **YunoHost SSO** (SSOWat headers), not JWT in the browser.

**Canonical API contract:** [docs/API_SSO.md](docs/API_SSO.md).

---

## Architecture

- Browser → NGINX (SSO permissions) → static files under `www/` and `/path/api/` → Fastify on `127.0.0.1:$port`.
- Fastify trusts identity headers **only** from the local reverse proxy (`127.0.0.1`).
- Angular calls `GET /api/auth/me` with **cookies** (`withCredentials: true`). Logout redirects to `https://<domain>/yunohost/sso/?action=logout`.

---

## Environment (Angular)

| File | Purpose |
|------|---------|
| `src/environments/environment.ts` | Dev: `apiUrl: '/api'`, SSO URLs placeholders |
| `src/environments/environment.prod.ts` | Replaced at YunoHost build: `__API_PATH__`, `__DOMAIN__` |
| `yunohost/conf/environment.prod.ts` | Template copied/sed during install |

---

## Authentication (summary)

| Endpoint | Behaviour |
|----------|-----------|
| `GET /api/auth/me` | Returns `{ authenticated, user? }`; upserts `user_directory` when authenticated |
| `POST /api/auth/login` | `410` — use YunoHost portal |
| `POST /api/auth/register` | `410` — create users in YunoHost |
| `POST /api/auth/logout` | `204` — client must also hit SSO logout URL |

**Admin role:** usernames listed in `ADMIN_USERNAMES` (comma-separated), set from the install question and written to `api/.env`.

**SSOWat headers** (forwarded by NGINX, names normalized by Node as lowercase):

- `Ynh-User` → `ynh-user`
- `Ynh-User-Email` → `ynh-user-email`
- `Ynh-User-Fullname` → `ynh-user-fullname`

---

## API surface (reviews + admin)

Same paths as in [docs/API_SSO.md](docs/API_SSO.md):

- Reviews: `GET/POST /api/reviews`, `GET/PUT/DELETE /api/reviews/:id`
- Admin: `GET /api/admin/users`, `DELETE /api/admin/users/:id`, pending reviews, approve, stats

---

## Local development (without full YunoHost)

1. **MariaDB:** create database and run `api` migrations: `cd api && npm ci && npm run migrate` (with `.env` or env vars).
2. **API:** `cd api && npm run dev` (listens on `127.0.0.1:3000` by default).
3. **Angular:** `npm start` — `proxy.conf.cjs` forwards `/api` to the API and **injects dev SSOWat-style headers** (`DEV_*` env vars optional).

Set app admins locally, e.g. `ADMIN_USERNAMES=devuser` to match the proxy default user.

---

## Packaging sources for YunoHost

Install scripts expect app sources under `../sources` (standard YunoHost layout): repo root including `api/`, `src/`, `package.json`, `angular.json`, etc.
