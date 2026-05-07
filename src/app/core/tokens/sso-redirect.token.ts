import { InjectionToken } from '@angular/core';

/** Replace in tests to avoid navigating the Karma window. */
export const YNH_SSO_REDIRECT = new InjectionToken<(url: string) => void>(
  'YNH_SSO_REDIRECT',
  {
    providedIn: 'root',
    factory: () => (url: string) => {
      globalThis.location.assign(url);
    },
  },
);
