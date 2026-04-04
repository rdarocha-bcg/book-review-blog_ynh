import { TestBed } from '@angular/core/testing';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(() => {
    authService = jasmine.createSpyObj('AuthService', ['isAuthenticatedSync']);
    authService.isAuthenticatedSync.and.returnValue(false);
    router = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        AuthGuard,
        { provide: AuthService, useValue: authService },
        { provide: Router, useValue: router },
      ],
    });
    guard = TestBed.inject(AuthGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  it('should allow access when authenticated', () => {
    (authService.isAuthenticatedSync as jasmine.Spy).and.returnValue(true);
    const route = {} as unknown as ActivatedRouteSnapshot;
    const state = {} as unknown as RouterStateSnapshot;
    expect(guard.canActivate(route, state)).toBe(true);
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should redirect to login when not authenticated', () => {
    (authService.isAuthenticatedSync as jasmine.Spy).and.returnValue(false);
    const route = {} as unknown as ActivatedRouteSnapshot;
    const state = {} as unknown as RouterStateSnapshot;
    expect(guard.canActivate(route, state)).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/auth/login']);
  });
});
