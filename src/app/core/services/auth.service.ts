import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, catchError, map, of, tap } from 'rxjs';
import { ApiService } from './api.service';

/**
 * Auth Service — session from YunoHost SSO via GET /api/auth/me (cookies, no JWT).
 */
export interface AuthUser {
  id?: string;
  email?: string;
  name?: string;
  role?: string;
  [key: string]: unknown;
}

interface AuthMeResponse {
  authenticated: boolean;
  user?: AuthUser;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private isAuthenticated$ = new BehaviorSubject<boolean>(false);
  private user$ = new BehaviorSubject<AuthUser | null>(null);
  constructor(private apiService: ApiService) {}

  /**
   * Loads current user from the API (SSO cookies). Safe to call multiple times.
   */
  loadSession(): Observable<void> {
    return this.apiService.get<AuthMeResponse>('auth/me').pipe(
      tap((res) => {
        if (res.authenticated && res.user) {
          this.user$.next(res.user);
          this.isAuthenticated$.next(true);
        } else {
          this.user$.next(null);
          this.isAuthenticated$.next(false);
        }
      }),
      map(() => void 0),
      catchError(() => {
        this.user$.next(null);
        this.isAuthenticated$.next(false);
        return of(void 0);
      }),
    );
  }

  /**
   * Clears local auth state. Use SSO logout URL in the UI to end the portal session.
   */
  logout(): void {
    this.user$.next(null);
    this.isAuthenticated$.next(false);
    this.apiService.post('auth/logout', {}).subscribe();
  }

  getCurrentUser(): AuthUser | null {
    return this.user$.value;
  }

  getCurrentUser$(): Observable<AuthUser | null> {
    return this.user$.asObservable();
  }

  isAuthenticated(): Observable<boolean> {
    return this.isAuthenticated$.asObservable();
  }

  isAuthenticatedSync(): boolean {
    return this.isAuthenticated$.value;
  }
}
