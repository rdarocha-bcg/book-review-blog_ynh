import { inject } from '@angular/core';
import { CanActivateFn, CanMatchFn, Router } from '@angular/router';
import { map } from 'rxjs';
import { AuthService } from '@core/services/auth.service';
import { YNH_SSO_REDIRECT } from '@core/tokens/sso-redirect.token';
import { yunohostPortalLoginUrl } from '@core/utils/sso-login-url';

/**
 * Blocks navigation to admin routes unless the user has an active SSO session
 * AND holds the 'admin' role.
 * Unauthenticated users are sent to the YunoHost SSO portal (nginx normally
 * already enforces login on /admin only). Authenticated non-admins → /401.
 * Uses `canMatch` so the admin chunk is not loaded for ineligible users.
 */
export const adminGuard: CanActivateFn & CanMatchFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const ssoRedirect = inject(YNH_SSO_REDIRECT);

  return auth.getState().pipe(
    map((state) => {
      if (!state.authenticated) {
        if (typeof globalThis !== 'undefined' && 'location' in globalThis) {
          const loc = globalThis.location as Location;
          ssoRedirect(yunohostPortalLoginUrl(loc.href, loc.origin));
        }
        return false;
      }
      if (state.user?.role !== 'admin') return router.createUrlTree(['/401']);
      return true;
    }),
  );
};
