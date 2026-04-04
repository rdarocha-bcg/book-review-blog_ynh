import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { RoleGuard } from './role.guard';
import { AuthService } from '../services/auth.service';

describe('RoleGuard', () => {
  let guard: RoleGuard;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(() => {
    authService = jasmine.createSpyObj('AuthService', ['getCurrentUser']);
    authService.getCurrentUser.and.returnValue({ id: '1', role: 'user' });
    router = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        RoleGuard,
        { provide: AuthService, useValue: authService },
        { provide: Router, useValue: router },
      ],
    });
    guard = TestBed.inject(RoleGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  it('should allow access when user has required role', () => {
    (authService.getCurrentUser as jasmine.Spy).and.returnValue({ id: '1', role: 'admin' });
    const route = { data: { roles: ['admin'] } } as unknown as ActivatedRouteSnapshot;
    const state = {} as unknown as RouterStateSnapshot;
    expect(guard.canActivate(route, state)).toBe(true);
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should redirect to home when user lacks role', () => {
    (authService.getCurrentUser as jasmine.Spy).and.returnValue({ id: '1', role: 'user' });
    const route = { data: { roles: ['admin'] } } as unknown as ActivatedRouteSnapshot;
    const state = {} as unknown as RouterStateSnapshot;
    expect(guard.canActivate(route, state)).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/']);
  });

  it('should redirect to login when no user', () => {
    (authService.getCurrentUser as jasmine.Spy).and.returnValue(null);
    const route = { data: { roles: ['admin'] } } as unknown as ActivatedRouteSnapshot;
    const state = {} as unknown as RouterStateSnapshot;
    expect(guard.canActivate(route, state)).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/auth/login']);
  });
});
