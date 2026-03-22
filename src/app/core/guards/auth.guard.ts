import { Injectable } from '@angular/core';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Auth Guard
 * Protects routes that require authentication
 */
@Injectable({
  providedIn: 'root',
})
export class AuthGuard {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    // Route and state are required by the CanActivate signature; they're not used directly here.
    void route;
    void state;

    if (this.authService.isAuthenticatedSync()) {
      return true;
    }

    this.router.navigate(['/auth/login']);
    return false;
  }
}

