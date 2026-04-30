import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, shareReplay, catchError, of, EMPTY } from 'rxjs';
import { environment } from '@environments/environment';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
}

export interface AuthState {
  authenticated: boolean;
  user?: AuthUser;
}

/**
 * Thin wrapper around GET /api/auth/me.
 * Caches the result for the lifetime of the page; call refresh() to bust the cache.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly meUrl = `${environment.apiUrl}/auth/me`;

  readonly state = signal<AuthState | null>(null);

  private pending$: Observable<AuthState> | null = null;

  constructor(private http: HttpClient) {}

  /**
   * Returns the current auth state.  Makes at most one network request per
   * page load (subsequent calls reuse the in-flight or completed observable).
   */
  getState(): Observable<AuthState> {
    if (!this.pending$) {
      this.pending$ = this.http
        .get<AuthState>(this.meUrl, { withCredentials: true })
        .pipe(
          tap((s) => this.state.set(s)),
          catchError(() => {
            const unauthenticated: AuthState = { authenticated: false };
            this.state.set(unauthenticated);
            return of(unauthenticated);
          }),
          shareReplay(1),
        );
    }
    return this.pending$;
  }

  /** Force a fresh fetch (e.g. after login/logout). */
  refresh(): Observable<AuthState> {
    this.pending$ = null;
    this.state.set(null);
    return this.getState();
  }

  /** Call the server logout endpoint and clear cached auth state. */
  logout(): Observable<void> {
    return this.http.get<void>(`${environment.apiUrl}/auth/logout`, { withCredentials: true }).pipe(
      tap(() => this.refresh()),
      catchError(() => {
        this.refresh();
        return EMPTY;
      }),
    );
  }

  isAdmin(): boolean {
    return this.state()?.user?.role === 'admin';
  }
}
