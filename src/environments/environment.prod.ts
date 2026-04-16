/**
 * Production bundle environment (file-replaced at `ng build --configuration production`).
 *
 * YunoHost install/upgrade overwrites this file from `conf/environment.prod.ts` with real
 * `__API_PATH__` before building on the server — see `scripts/install`.
 *
 * Values below are safe defaults for local `ng build` / CI (same-origin `/api` as dev).
 */
export const environment = {
  production: true,
  apiUrl: '/api',
};
