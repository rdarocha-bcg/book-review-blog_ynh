import { Injectable } from '@angular/core';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Role Guard
 * Protects routes that require a specific role (e.g. admin).
 * Use after AuthGuard so user is authenticated.
 */
@Injectable({
  providedIn: 'root',
})
export class RoleGuard {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, _state: RouterStateSnapshot): boolean {
    void _state;

    const requiredRoles = (route.data['roles'] as string[]) || ['admin'];
    const user = this.authService.getCurrentUser();

    if (!user) {
      this.router.navigate(['/auth/login']);
      return false;
    }

    const userRole = (user.role as string) || 'user';
    if (requiredRoles.includes(userRole)) {
      return true;
    }

    this.router.navigate(['/']);
    return false;
  }
}
