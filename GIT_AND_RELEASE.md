# Git versioning and going live

This guide covers **version control with Git** and **deploying the production build** (static Angular app).

---

## 0. Prerequisite: Git identity (required before first commit)

Git refuses to commit without a name and email. Run once per machine (global) or once per repo (omit `--global`):

```bash
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
```

Then create the first commit (this repo is already initialized on `main` with files staged):

```bash
cd /path/to/newdir
git commit -m "chore: initial commit - Book Review Blog frontend"
```

---

## 1. Version control (Git)

### Initialize the repository (only if you start from scratch elsewhere)

```bash
cd /path/to/newdir
git init
git branch -M main
git add .
git commit -m "chore: initial commit - Book Review Blog frontend"
```

### Connect to GitHub / GitLab / Forgejo

1. Create an **empty** repository on the host (no README if you already have one locally).
2. Add the remote and push:

```bash
git remote add origin https://github.com/rdarocha-bcg/book-review-blog.git
git branch -M main
git push -u origin main
```

Use your own `https://github.com/<user>/book-review-blog.git` if you work from a fork; the canonical upstream is **rdarocha-bcg/book-review-blog**.

### Semantic versioning (tags)

The app version in `package.json` (e.g. `0.1.0`) should match your releases.

```bash
# After a stable release
git tag -a v0.1.0 -m "Release v0.1.0 - first public version"
git push origin v0.1.0
```

For the next release: bump `version` in `package.json`, commit, then tag `v0.2.0`, etc.

### What not to commit

Already ignored: `node_modules/`, `dist/`, `.angular/cache/`, coverage, `.env*`.  
Never commit secrets (API keys, passwords).

---

## 2. Production build

```bash
npm ci
npm run build:prod
```

Output: `dist/book-review-blog/` (see `angular.json` → `outputPath` if different).

Set **`src/environments/environment.prod.ts`** `apiUrl` to your real API URL before building.

---

## 3. Going live (deploy)

The SPA is **static files**: upload the contents of `dist/book-review-blog/` to your web server.

- **Full checklist and examples** (Nginx, Yunohost, HTTPS): [DEPLOYMENT.md](./DEPLOYMENT.md)
- **API / CORS / Yunohost**: [YUNOHOST_INTEGRATION.md](./YUNOHOST_INTEGRATION.md)

Typical flow:

1. Build on your machine or in CI (`npm run build:prod`).
2. Copy `dist/book-review-blog/*` to the server (e.g. `scp`, rsync, or CI artifact).
3. Configure the server for a SPA: **fallback to `index.html`** for unknown routes (`try_files` with Nginx).
4. Enable **HTTPS** (Let’s Encrypt on Yunohost/VPS).
5. Ensure the **backend** allows your frontend origin (CORS).

---

## 4. Optional: CI (GitHub Actions)

You can add a workflow that runs `npm ci`, `npm run lint`, and `npm run build:prod` on each push. Example file name: `.github/workflows/ci.yml` (create when you need it).

---

## Quick reference

| Goal              | Command |
|-------------------|---------|
| First push        | `git push -u origin main` |
| Tag a release     | `git tag -a v0.1.0 -m "..."` then `git push origin v0.1.0` |
| Production folder | `dist/book-review-blog/` after `npm run build:prod` |
