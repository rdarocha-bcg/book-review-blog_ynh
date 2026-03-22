import { TestBed } from '@angular/core/testing';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from '@core/services/auth.service';
import { AuthGuard } from '@core/guards/auth.guard';
import { StorageService } from '@core/services/storage.service';

/**
 * Integration tests: authentication flow (login, guard, logout).
 */
describe('Auth flow (integration)', () => {
  let authService: AuthService;
  let authGuard: AuthGuard;
  let router: Router;
  let httpMock: HttpTestingController;
  let storage: StorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService, AuthGuard, StorageService],
    });
    authService = TestBed.inject(AuthService);
    authGuard = TestBed.inject(AuthGuard);
    router = TestBed.inject(Router);
    httpMock = TestBed.inject(HttpTestingController);
    storage = TestBed.inject(StorageService);
    storage.clear();
    spyOn(router, 'navigate').and.stub();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should allow access when user is authenticated (after login)', (done) => {
    authService.login({ email: 'a@b.com', password: 'p' }).subscribe({
      next: () => {
        const route = {} as unknown as ActivatedRouteSnapshot;
        const state = {} as unknown as RouterStateSnapshot;
        expect(authGuard.canActivate(route, state)).toBe(true);
        done();
      },
    });
    const req = httpMock.expectOne((r) => r.url.includes('auth/login'));
    req.flush({ token: 'jwt', user: { id: '1', email: 'a@b.com' } });
  });

  it('should redirect to login when no token', () => {
    const route = {} as unknown as ActivatedRouteSnapshot;
    const state = {} as unknown as RouterStateSnapshot;
    expect(authGuard.canActivate(route, state)).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/auth/login']);
  });

  it('login then logout should clear token', (done) => {
    authService.login({ email: 'a@b.com', password: 'p' }).subscribe({
      next: () => {
        expect(authService.getToken()).toBeTruthy();
        authService.logout();
        expect(authService.getToken()).toBeNull();
        done();
      },
    });
    const req = httpMock.expectOne((r) => r.url.includes('auth/login'));
    req.flush({ token: 'jwt', user: { id: '1', email: 'a@b.com' } });
  });
});
