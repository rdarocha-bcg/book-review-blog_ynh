import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { map } from 'rxjs';
import { AuthService } from '@core/services/auth.service';
import { YNH_SSO_REDIRECT } from '@core/tokens/sso-redirect.token';
import { yunohostPortalLoginUrl } from '@core/utils/sso-login-url';

/**
 * Blocks navigation unless the user has an active SSO session.
 * Unauthenticated users are sent to the YunoHost SSO portal (return URL preserved),
 * which matches public blog installs where /api/auth/me has no identity until login.
 */
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const ssoRedirect = inject(YNH_SSO_REDIRECT);

  return auth.getState().pipe(
    map((state) => {
      if (state.authenticated) {
        return true;
      }
      if (typeof globalThis !== 'undefined' && 'location' in globalThis) {
        const loc = globalThis.location as Location;
        ssoRedirect(yunohostPortalLoginUrl(loc.href, loc.origin));
      }
      return false;
    }),
  );
};
