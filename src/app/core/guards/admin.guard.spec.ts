import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { adminGuard } from './admin.guard';
import { AuthService, AuthState } from '@core/services/auth.service';
import { YNH_SSO_REDIRECT } from '@core/tokens/sso-redirect.token';

function runGuard(authState: AuthState, ssoRedirect?: jasmine.Spy) {
  const authServiceStub = { getState: () => of(authState) };
  const redirectSpy = ssoRedirect ?? jasmine.createSpy('ssoRedirect');
  TestBed.configureTestingModule({
    imports: [RouterTestingModule],
    providers: [
      { provide: AuthService, useValue: authServiceStub },
      { provide: YNH_SSO_REDIRECT, useValue: redirectSpy },
    ],
  });
  const router = TestBed.inject(Router);
  const result$ = TestBed.runInInjectionContext(() => adminGuard({} as never, [] as never));
  return { result$, router, redirectSpy };
}

describe('adminGuard', () => {
  it('should allow navigation for an authenticated admin', (done) => {
    const state: AuthState = {
      authenticated: true,
      user: { id: '1', email: 'admin@example.com', name: 'Admin', role: 'admin' },
    };
    const { result$ } = runGuard(state);
    (result$ as ReturnType<typeof of>).subscribe((result) => {
      expect(result).toBe(true);
      done();
    });
  });

  it('should redirect to /401 for an authenticated non-admin user', (done) => {
    const state: AuthState = {
      authenticated: true,
      user: { id: '2', email: 'user@example.com', name: 'User', role: 'user' },
    };
    const { result$, router } = runGuard(state);
    (result$ as ReturnType<typeof of>).subscribe((result) => {
      expect(result).toEqual(router.createUrlTree(['/401']));
      done();
    });
  });

  it('should invoke SSO redirect and return false when unauthenticated', (done) => {
    const state: AuthState = { authenticated: false };
    const { result$, redirectSpy } = runGuard(state);
    (result$ as ReturnType<typeof of>).subscribe((result) => {
      expect(result).toBe(false);
      expect(redirectSpy).toHaveBeenCalledTimes(1);
      const url = redirectSpy.calls.first().args[0] as string;
      expect(url).toMatch(new RegExp(`^${window.location.origin}/yunohost/sso\\?r=`));
      done();
    });
  });
});
