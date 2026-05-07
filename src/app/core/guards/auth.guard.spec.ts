import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { authGuard } from './auth.guard';
import { AuthService, AuthState } from '@core/services/auth.service';
import { YNH_SSO_REDIRECT } from '@core/tokens/sso-redirect.token';

function runGuard(authState: AuthState) {
  const authServiceStub = { getState: () => of(authState) };
  const redirectSpy = jasmine.createSpy('ssoRedirect');
  TestBed.configureTestingModule({
    imports: [RouterTestingModule],
    providers: [
      { provide: AuthService, useValue: authServiceStub },
      { provide: YNH_SSO_REDIRECT, useValue: redirectSpy },
    ],
  });
  const result$ = TestBed.runInInjectionContext(() => authGuard({} as never, {} as never));
  return { result$, redirectSpy };
}

describe('authGuard', () => {
  it('should allow an authenticated user', (done) => {
    const state: AuthState = {
      authenticated: true,
      user: { id: '1', email: 'a@b.com', name: 'A', role: 'user' },
    };
    const { result$, redirectSpy } = runGuard(state);
    (result$ as ReturnType<typeof of>).subscribe((result) => {
      expect(result).toBe(true);
      expect(redirectSpy).not.toHaveBeenCalled();
      done();
    });
  });

  it('should trigger SSO redirect when unauthenticated', (done) => {
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
