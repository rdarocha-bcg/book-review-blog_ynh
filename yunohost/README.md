# Book Review Blog for YunoHost

Angular SPA + **Fastify API** + **MariaDB**, integrated with **SSO/LDAP** (manifest `sso = true`, `ldap = true`).

## Install

```bash
yunohost app install https://github.com/<your-org>/book-review-blog_ynh
```

Install questions (typical):

| Question | Default | Description |
|----------|---------|-------------|
| Domain | — | vhost |
| Path | `/blog` | e.g. `domain.tld/blog` |
| Main permission | visitors | Who can open the app |
| Admin usernames | (empty) | Comma-separated YunoHost logins that get **app admin** (`ADMIN_USERNAMES`) |

The API listens on **`127.0.0.1`** on an allocated port; NGINX proxies `__PATH__/api/` there and forwards SSOWat headers.

## Upgrade

```bash
yunohost app upgrade book-review-blog
```

Rebuilds frontend and API, runs migrations, restarts `systemd`.

## Configuration

- **App admins:** `yunohost app setting book-review-blog admin_usernames -v "alice,bob"` then upgrade or adjust `.env` + restart service as documented in YunoHost helpers.
- **Logs:** `journalctl -u book-review-blog -f` (service name matches instance).

## Requirements

- **YunoHost ≥ 12.0**
- RAM: ~512M during build, ~200M runtime (see `manifest.toml`)
- Node.js installed via YunoHost helpers during install/upgrade

## Docs

- [doc/PRE_INSTALL.md](doc/PRE_INSTALL.md)
- [../YUNOHOST_INTEGRATION.md](../YUNOHOST_INTEGRATION.md)
- [../docs/API_SSO.md](../docs/API_SSO.md)

## License

Private project.
