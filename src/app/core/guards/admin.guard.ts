import { inject } from '@angular/core';
import { CanActivateFn, CanMatchFn, Router } from '@angular/router';
import { map } from 'rxjs';
import { AuthService } from '@core/services/auth.service';

/**
 * Blocks navigation to admin routes unless the user has an active SSO session
 * AND holds the 'admin' role.
 * Unauthenticated users are redirected to /login; authenticated non-admins to /401.
 * Uses `canMatch` so the admin chunk is never downloaded for ineligible users.
 * Also usable as `canActivate` for individual admin-only routes.
 */
export const adminGuard: CanActivateFn & CanMatchFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.getState().pipe(
    map((state) => {
      if (!state.authenticated) return router.createUrlTree(['/login']);
      if (state.user?.role !== 'admin') return router.createUrlTree(['/401']);
      return true;
    }),
  );
};
