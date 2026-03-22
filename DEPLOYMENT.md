# Deployment Guide - Book Review Blog

This document provides a checklist and steps for building and deploying the Angular frontend, including integration with a Yunohost backend.

---

## Pre-deployment Checklist

- [ ] All tests pass: `npm test`
- [ ] Lint passes: `npm run lint`
- [ ] Environment variables for production are set (e.g. `apiUrl`)
- [ ] Backend API is deployed and reachable (Yunohost or other)
- [ ] CORS is configured on the backend to allow your frontend origin
- [ ] SSL/HTTPS is configured for the production domain

---

## Build for Production

### 1. Install dependencies

```bash
npm ci
```

### 2. Production build

```bash
npm run build:prod
```

Or:

```bash
ng build --configuration production
```

Output is written to `dist/book-review-blog/` (or the path in `angular.json`).

### 3. Verify build output

- [ ] `dist/book-review-blog/` contains `index.html`, `main-*.js`, `polyfills-*.js`, `styles-*.css`, etc.
- [ ] Open `index.html` locally (or serve the folder) and confirm the app loads and API base URL is correct.

---

## Deploying the Static Frontend

The app is a static SPA. Serve the contents of `dist/book-review-blog/` with any web server.

### Option A: Nginx (e.g. on Yunohost or VPS)

1. Copy build output to the server, e.g.:

   ```bash
   scp -r dist/book-review-blog/* user@your-server:/var/www/book-review-blog/
   ```

2. Nginx configuration (example):

   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       root /var/www/book-review-blog;
       index index.html;

       location / {
           try_files $uri $uri/ /index.html;
       }

       location /api {
           proxy_pass http://localhost:3000;  # or your Yunohost API URL
           proxy_http_version 1.1;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   ```

3. Enable HTTPS (e.g. Let’s Encrypt) and restart Nginx.

### Option B: Apache

1. Copy build output to the document root.
2. Enable `mod_rewrite` and use a rule set like:

   ```apache
   RewriteEngine On
   RewriteBase /
   RewriteRule ^index\.html$ - [L]
   RewriteCond %{REQUEST_FILENAME} !-f
   RewriteCond %{REQUEST_FILENAME} !-d
   RewriteRule . /index.html [L]
   ```

3. Configure proxy for `/api` to your backend if needed.

### Option C: Yunohost app (custom app or static site)

- If your Yunohost setup supports a “static site” or “custom app”, point its document root to the folder containing the built files.
- Ensure the app’s domain and SSL are configured in Yunohost.
- Configure the backend API URL (same domain with `/api` or a separate subdomain) and CORS.

---

## Environment Configuration

### Production API URL

- **Build time:** Set in `src/environments/environment.prod.ts` (e.g. `apiUrl: 'https://your-domain.com/api'`).
- **Runtime (optional):** For runtime config, you would need a small endpoint or config file that the app fetches on load; not included by default.

Rebuild after changing environment files.

---

## Backend (Yunohost) Requirements

- [ ] REST API base URL matches `environment.prod.apiUrl`
- [ ] CORS allows your frontend origin (e.g. `https://your-domain.com`)
- [ ] Auth endpoints: `POST /api/auth/login`, `POST /api/auth/register`, `POST /api/auth/forgot-password`, etc.
- [ ] Reviews CRUD: `GET/POST /api/reviews`, `GET/PUT/DELETE /api/reviews/:id`
- [ ] JWT sent in `Authorization: Bearer <token>` (handled by the app’s auth interceptor)

---

## Post-deployment

- [ ] Open the production URL and test: login, register, list/detail/create/edit review, logout
- [ ] Test password reset flow if used
- [ ] Check browser console and network tab for 4xx/5xx or CORS errors
- [ ] Verify HTTPS and redirects (HTTP → HTTPS)

---

## Quick Reference

| Task              | Command / action                    |
|-------------------|------------------------------------|
| Install deps      | `npm ci`                           |
| Production build  | `npm run build:prod`               |
| Run tests         | `npm test`                         |
| Lint              | `npm run lint`                     |
| Build output      | `dist/book-review-blog/`           |

---

**Last updated:** 2026
