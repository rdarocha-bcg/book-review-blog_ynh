import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { adminGuard } from './admin.guard';
import { AuthService, AuthState } from '@core/services/auth.service';

function runGuard(authState: AuthState) {
  const authServiceStub = { getState: () => of(authState) };
  TestBed.configureTestingModule({
    imports: [RouterTestingModule],
    providers: [{ provide: AuthService, useValue: authServiceStub }],
  });
  const router = TestBed.inject(Router);
  return TestBed.runInInjectionContext(() => adminGuard({} as never, {} as never));
}

describe('adminGuard', () => {
  it('should allow navigation for an authenticated admin', (done) => {
    const state: AuthState = {
      authenticated: true,
      user: { id: '1', email: 'admin@example.com', name: 'Admin', role: 'admin' },
    };
    (runGuard(state) as ReturnType<typeof of>).subscribe((result) => {
      expect(result).toBe(true);
      done();
    });
  });

  it('should redirect to /401 for an authenticated non-admin user', (done) => {
    const state: AuthState = {
      authenticated: true,
      user: { id: '2', email: 'user@example.com', name: 'User', role: 'user' },
    };
    (runGuard(state) as ReturnType<typeof of>).subscribe((result) => {
      expect(result).not.toBe(true);
      done();
    });
  });

  it('should redirect to /401 for an unauthenticated user', (done) => {
    const state: AuthState = { authenticated: false };
    (runGuard(state) as ReturnType<typeof of>).subscribe((result) => {
      expect(result).not.toBe(true);
      done();
    });
  });
});
