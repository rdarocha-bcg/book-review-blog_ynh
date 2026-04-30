import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, shareReplay, catchError, of, finalize, filter, take, switchMap } from 'rxjs';
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

  /** Tracks whether a session refresh is currently in flight. */
  private isRefreshing = false;
  /** Emits `false` when a refresh starts, `true` when it completes. */
  private refreshSubject = new BehaviorSubject<boolean>(false);

  /** True while a session refresh HTTP call is in flight. */
  get isRefreshingNow(): boolean {
    return this.isRefreshing;
  }

  /** Observable of the refresh completion state (false = in progress, true = done). */
  get refreshing$(): Observable<boolean> {
    return this.refreshSubject.asObservable();
  }

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

  /** Force a fresh fetch and signal in-flight state so concurrent 401s can queue. */
  refresh(): Observable<AuthState> {
    if (this.isRefreshing) {
      return this.refreshSubject.pipe(
        filter((done) => done),
        take(1),
        switchMap(() => this.getState()),
      );
    }
    this.pending$ = null;
    this.state.set(null);
    this.isRefreshing = true;
    this.refreshSubject.next(false);
    return this.getState().pipe(
      finalize(() => {
        this.isRefreshing = false;
        this.refreshSubject.next(true);
      }),
    );
  }

  isAdmin(): boolean {
    return this.state()?.user?.role === 'admin';
  }
}
