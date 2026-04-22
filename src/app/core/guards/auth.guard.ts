import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';
import { AuthService } from '@core/services/auth.service';

/**
 * Blocks navigation to a route unless the user has an active SSO session.
 * On failure redirects to /401 (the standard unauthorized page for this app).
 */
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.getState().pipe(
    map((state) => {
      if (state.authenticated) {
        return true;
      }
      return router.createUrlTree(['/401']);
    }),
  );
};
