/**
 * Development Environment
 *
 * Use a relative /api base so `ng serve` can proxy (see proxy.conf.cjs).
 * Do not use http://localhost:3000 here unless you run a separate API on 3000
 * without the proxy — that bypasses the proxy and breaks when nothing listens on 3000.
 */
import { IEnvironment } from './environment.interface';

export const environment: IEnvironment = {
  production: false,
  apiUrl: '/api',
  features: {
    markdownPreview: true,
    adminAnalytics: true,
  },
};

