# Deployment — Book Review Blog

## YunoHost (recommended)

Use the official package under `yunohost/`. One install provides:

- Production build of the Angular app (correct `base-href` and `apiUrl`)
- Fastify API as a `systemd` service
- MariaDB schema via SQL migrations
- NGINX: SPA + `/api` proxy to localhost with SSOWat headers

See [yunohost/README.md](yunohost/README.md) and [yunohost/doc/PRE_INSTALL.md](yunohost/doc/PRE_INSTALL.md).

**API contract / auth:** [docs/API_SSO.md](docs/API_SSO.md), [YUNOHOST_INTEGRATION.md](YUNOHOST_INTEGRATION.md).

---

## Manual / generic hosting

### Frontend only

```bash
npm ci
ng build --configuration production
```

Serve `dist/book-review-blog/` with a web server. You must either:

- Run the **bundled API** (`api/`) behind the same origin and reverse-proxy `/api`, **or**
- Point `environment.prod.ts` `apiUrl` at another deployment and configure SSO/proxy headers consistently (advanced).

### API (Node)

```bash
cd api
npm ci
npm run build
# Set DATABASE_* , PORT, HOST=127.0.0.1, ADMIN_USERNAMES, NODE_ENV=production
node dist/migrate.js
node dist/index.js
```

The API is intended to sit **behind** a trusted reverse proxy that sets SSOWat identity headers.

---

## Checklist

- [ ] `npm run build` (or YunoHost install) succeeds
- [ ] MariaDB reachable and migrations applied
- [ ] Same-origin `/api` or documented CORS + credentials strategy
- [ ] HTTPS in production
- [ ] SSO logout URL configured in Angular `environment` for production builds
