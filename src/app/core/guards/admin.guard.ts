import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';
import { AuthService } from '@core/services/auth.service';

/**
 * Blocks navigation to admin routes unless the user has an active SSO session
 * AND holds the 'admin' role.
 * On failure redirects to /401.
 */
export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.getState().pipe(
    map((state) => {
      if (state.authenticated && state.user?.role === 'admin') {
        return true;
      }
      return router.createUrlTree(['/401']);
    }),
  );
};
