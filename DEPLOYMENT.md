# Deployment — Book Review Blog

## YunoHost (recommended)

Use the package at the **repo root** (`manifest.toml`, `scripts/`, `conf/`), or install from **`https://github.com/rdarocha-bcg/book-review-blog_ynh`** on the server. One install provides:

- Production build of the Angular app (correct `base-href` and `apiUrl`)
- Fastify API as a `systemd` service
- MariaDB schema via SQL migrations
- NGINX: SPA + `/api` proxy to localhost with SSOWat headers

See [YUNOHOST_INTEGRATION.md](YUNOHOST_INTEGRATION.md) and [doc/PRE_INSTALL.md](doc/PRE_INSTALL.md).

**API contract / auth:** [docs/API_SSO.md](docs/API_SSO.md), [YUNOHOST_INTEGRATION.md](YUNOHOST_INTEGRATION.md).

---

## Continuous deployment to YunoHost (GitHub Actions)

This repository includes `.github/workflows/deploy-ynh.yml`.

Deployment triggers:

- automatically after the `CI` workflow succeeds on branch `main`
- manually with **Actions > Deploy to YunoHost > Run workflow**

The workflow connects over SSH and runs:

```bash
yunohost app upgrade <app_id> -u <source_url>
```

### Required GitHub secrets

Set these in **Repository settings > Secrets and variables > Actions**:

- `YNH_SSH_HOST`: server hostname or IP
- `YNH_SSH_USER`: SSH user allowed to run `yunohost app upgrade` (usually with sudo/root rights)
- `YNH_SSH_PRIVATE_KEY`: private key matching the public key installed on the server
- `YNH_SSH_KNOWN_HOSTS`: full known_hosts line(s) for strict host key pinning

### Optional repository variables

- `YNH_APP_INSTANCE_ID` (default: `book-review-blog`)
- `YNH_APP_SOURCE_URL` (default: `https://github.com/rdarocha-bcg/book-review-blog_ynh`)
- `YNH_SSH_PORT` (default: `22`)

### Notes

- Keep CI as the quality gate before deployment.
- If your YunoHost instance id is not `book-review-blog`, set `YNH_APP_INSTANCE_ID`.
- The workflow enforces strict host key checking using `YNH_SSH_KNOWN_HOSTS`.
- The workflow targets the GitHub **Environment** named `production`.

### Recommended protection (required for manual approval)

In **Repository settings > Environments > production**:

1. Create (or edit) the `production` environment.
2. Add **Required reviewers** (you and/or trusted maintainers).
3. Optionally restrict deployable branches (for example `main` only).

With this setup, each deployment run pauses until approved in GitHub Actions.

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
