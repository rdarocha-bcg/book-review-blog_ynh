import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ApiService } from './api.service';
import { StorageService } from './storage.service';

/**
 * Auth Service
 * Handles authentication and token management
 */
export interface AuthUser {
  id?: string;
  email?: string;
  name?: string;
  role?: string;
  // Allow backend to add extra fields without breaking typing
  [key: string]: unknown;
}

interface AuthResponse {
  token: string;
  user: AuthUser;
  [key: string]: unknown;
}

interface AuthTokenResponse {
  token: string;
  [key: string]: unknown;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private tokenKey = 'auth_token';
  private userKey = 'auth_user';
  private isAuthenticated$ = new BehaviorSubject<boolean>(
    this.storageService.hasItem(this.tokenKey)
  );
  private user$ = new BehaviorSubject<AuthUser | null>(
    this.storageService.getItem<AuthUser>(this.userKey)
  );

  constructor(
    private apiService: ApiService,
    private storageService: StorageService
  ) {}

  /**
   * Authenticates the user with email and password.
   * On success, stores token and user in storage and updates auth state.
   * @param credentials - Object containing email and password
   * @returns Observable that emits the API response (token, user) or errors
   */
  login(credentials: { email: string; password: string }): Observable<AuthResponse> {
    return new Observable((observer) => {
      this.apiService.post<AuthResponse>('auth/login', credentials).subscribe({
        next: (response) => {
          // Persist token and user so guard and header can read auth state
          this.setToken(response.token);
          this.setUser(response.user);
          this.isAuthenticated$.next(true);
          observer.next(response);
          observer.complete();
        },
        error: (error) => {
          observer.error(error);
        },
      });
    });
  }

  /**
   * Register user
   */
  register(userData: { name: string; email: string; password: string }): Observable<AuthResponse> {
    return new Observable((observer) => {
      this.apiService.post<AuthResponse>('auth/register', userData).subscribe({
        next: (response) => {
          this.setToken(response.token);
          this.setUser(response.user);
          this.isAuthenticated$.next(true);
          observer.next(response);
          observer.complete();
        },
        error: (error) => {
          observer.error(error);
        },
      });
    });
  }

  /**
   * Logs out the current user: clears token and user from storage and resets auth state.
   */
  logout(): void {
    this.storageService.removeItem(this.tokenKey);
    this.storageService.removeItem(this.userKey);
    this.isAuthenticated$.next(false);
    this.user$.next(null);
  }

  /**
   * Set auth token
   */
  private setToken(token: string): void {
    this.storageService.setItem(this.tokenKey, token);
  }

  /**
   * Get auth token
   */
  getToken(): string | null {
    return this.storageService.getItem(this.tokenKey);
  }

  /**
   * Set user data
   */
  private setUser(user: AuthUser): void {
    this.storageService.setItem(this.userKey, user);
    this.user$.next(user);
  }

  /**
   * Returns the current user object from state (synchronous).
   * @returns The current user object or null
   */
  getCurrentUser(): AuthUser | null {
    return this.user$.value;
  }

  /**
   * Get current user as Observable
   */
  getCurrentUser$(): Observable<AuthUser | null> {
    return this.user$.asObservable();
  }

  /**
   * Returns an Observable that emits whether the user is authenticated.
   * @returns Observable of boolean (true if authenticated)
   */
  isAuthenticated(): Observable<boolean> {
    return this.isAuthenticated$.asObservable();
  }

  /**
   * Check if user is authenticated (sync)
   */
  isAuthenticatedSync(): boolean {
    return this.isAuthenticated$.value;
  }

  /**
   * Refreshes the JWT token. On failure, logs out the user.
   * @returns Observable that emits the new token response or errors
   */
  refreshToken(): Observable<AuthTokenResponse> {
    return new Observable((observer) => {
      this.apiService.post<AuthTokenResponse>('auth/refresh', {}).subscribe({
        next: (response) => {
          this.setToken(response.token);
          observer.next(response);
          observer.complete();
        },
        error: (error) => {
          this.logout();
          observer.error(error);
        },
      });
    });
  }
}

