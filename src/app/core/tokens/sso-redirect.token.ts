import { InjectionToken } from '@angular/core';

/** Browser redirect for SSO logout (overridable in tests). */
export const SSO_LOGOUT_REDIRECT = new InjectionToken<(url: string) => void>(
  'SSO_LOGOUT_REDIRECT',
  {
    factory: () => (url: string) => {
      window.location.assign(url);
    },
  },
);
