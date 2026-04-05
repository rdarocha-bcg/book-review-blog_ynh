# API specification — YunoHost SSO

This document is the contract for the Fastify backend when deployed behind YunoHost with SSOWat.

## Authentication

- **Source of truth:** HTTP headers set by SSOWat (not forgeable by browsers when traffic goes through YunoHost nginx). See [YunoHost SSO/LDAP](https://doc.yunohost.org/en/dev/packaging/advanced/sso_ldap_integration).
- **Headers (YunoHost ≥ 12):** documented as `YNH_USER`, `YNH_USER_EMAIL`, `YNH_USER_FULLNAME`; PHP sees `Ynh-User`, etc. Node.js exposes them as **lowercase** (`ynh-user`, `ynh-user-email`, `ynh-user-fullname`). NGINX must forward them to the API (see `conf/nginx.conf`). SSOWat also sets **`Authorization: Basic`** when `auth_header` is enabled; the API falls back to decoding the **Basic username** when Ynh-* headers are missing (some nginx builds mishandle underscore header names).
- **Server trust rule:** In production, only accept `YNH_*` identity when the request comes from a trusted proxy (`127.0.0.1`). In development (`NODE_ENV=development`), headers may be forwarded by `ng serve` proxy for local testing.
- **JWT / `Authorization: Bearer`:** Not used for v1. The Angular app uses **cookies + same-origin** requests with `withCredentials: true`.

### Endpoints — auth

| Method | Path | Auth | Response |
|--------|------|------|----------|
| GET | `/api/auth/me` | Optional | `200` `{ authenticated: true, user: { id, email, name, role } }` or `200` `{ authenticated: false }` |
| POST | `/api/auth/login` | — | `410` or `501` — use YunoHost portal (documented for backward compatibility) |
| POST | `/api/auth/register` | — | `410` or `501` — create users in YunoHost |
| POST | `/api/auth/refresh` | — | `501` |
| POST | `/api/auth/logout` | — | `204` no-op (client redirects to SSO logout) |

`role` is `admin` if `YNH_USER` is listed in `ADMIN_USERNAMES` (comma-separated env, set by YunoHost install script), else `user`.

### Endpoints — reviews

Same paths as before, relative to `/api`:

- `GET /api/reviews` — Public list; only `isPublished=true` unless authenticated (then author may see own drafts — v1: public only published + optional `?includeDrafts=1` for owner).
- `GET /api/reviews/:id` — Public if published; else owner or admin.
- `POST /api/reviews` — Requires authenticated SSO user.
- `PUT /api/reviews/:id` — Owner or admin.
- `DELETE /api/reviews/:id` — Owner or admin.

Pagination response: `{ data, total, page, limit, totalPages }`.

### Endpoints — admin

All require `role === admin'` (from `ADMIN_USERNAMES`).

- `GET /api/admin/users` — From `user_directory` table (synced on each `auth/me`).
- `DELETE /api/admin/users/:id` — Removes app directory row only (does not delete YunoHost account).
- `GET /api/admin/reviews/pending` — Reviews with `is_published=false`.
- `PATCH /api/admin/reviews/:id/approve` — Body `{ isPublished: boolean }`.
- `DELETE /api/admin/reviews/:id` — Hard delete.
- `GET /api/admin/stats` — Aggregates for dashboard.

## Angular impact

- `AuthService` loads session via `GET /api/auth/me` on startup and after navigation; no `localStorage` tokens.
- `ApiService` sends `withCredentials: true` on all requests.
- Logout redirects to `environment.ssoLogoutUrl` (YunoHost SSO logout URL).
- Login / Register routes show instructions or redirect to the portal URL (`environment.ssoLoginUrl`).
