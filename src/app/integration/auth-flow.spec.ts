import { TestBed } from '@angular/core/testing';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from '@core/services/auth.service';
import { ApiService } from '@core/services/api.service';
import { AuthGuard } from '@core/guards/auth.guard';

/**
 * Integration tests: SSO session (auth/me) and guard.
 */
describe('Auth flow (integration)', () => {
  let authService: AuthService;
  let authGuard: AuthGuard;
  let router: Router;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService, ApiService, AuthGuard],
    });
    authService = TestBed.inject(AuthService);
    authGuard = TestBed.inject(AuthGuard);
    router = TestBed.inject(Router);
    httpMock = TestBed.inject(HttpTestingController);
    spyOn(router, 'navigate').and.stub();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should allow access when authenticated after loadSession', (done) => {
    authService.loadSession().subscribe(() => {
      const route = {} as unknown as ActivatedRouteSnapshot;
      const state = {} as unknown as RouterStateSnapshot;
      expect(authGuard.canActivate(route, state)).toBe(true);
      done();
    });
    const req = httpMock.expectOne((r) => r.url.includes('auth/me'));
    req.flush({
      authenticated: true,
      user: { id: '1', email: 'a@b.com', role: 'user' },
    });
  });

  it('should redirect to login when not authenticated', (done) => {
    authService.loadSession().subscribe(() => {
      const route = {} as unknown as ActivatedRouteSnapshot;
      const state = {} as unknown as RouterStateSnapshot;
      expect(authGuard.canActivate(route, state)).toBe(false);
      expect(router.navigate).toHaveBeenCalledWith(['/auth/login']);
      done();
    });
    const req = httpMock.expectOne((r) => r.url.includes('auth/me'));
    req.flush({ authenticated: false });
  });

  it('logout should clear session state', () => {
    authService.loadSession().subscribe();
    const r1 = httpMock.expectOne((r) => r.url.includes('auth/me'));
    r1.flush({ authenticated: true, user: { id: '1' } });
    expect(authService.isAuthenticatedSync()).toBe(true);

    authService.logout();
    expect(authService.isAuthenticatedSync()).toBe(false);

    const r2 = httpMock.expectOne((r) => r.url.includes('auth/logout'));
    r2.flush(null);
  });
});
