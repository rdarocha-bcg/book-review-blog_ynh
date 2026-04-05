import { Component, OnDestroy, ChangeDetectionStrategy, Inject, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { SiteConfigService } from '@core/services/site-config.service';
import { SSO_LOGOUT_REDIRECT } from '@core/tokens/sso-redirect.token';
import { environment } from '@environments/environment';
import { Subject } from 'rxjs';

/**
 * Header Component
 * Navigation and user menu
 */
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <header class="bg-[var(--primary)] text-white shadow-lg" role="banner">
      <a href="#main-content" class="skip-link">Skip to main content</a>
      <nav class="container mx-auto px-4 py-4 flex items-center justify-between" aria-label="Main navigation">
        <div class="flex items-center gap-8">
          <a
            routerLink="/"
            class="text-2xl font-bold"
            [attr.aria-label]="site.config().siteNameShort + ' home'"
            >📚 {{ site.config().siteNameShort }}</a
          >
          <ul class="hidden md:flex gap-6" role="menubar">
            <li role="none"><a routerLink="/" class="hover:text-[var(--accent)] transition" role="menuitem">Home</a></li>
            <li role="none"><a routerLink="/blog" class="hover:text-[var(--accent)] transition" role="menuitem">Blog</a></li>
            <li *ngIf="(currentUser$ | async)?.role === 'admin'" role="none">
              <a routerLink="/admin" class="hover:text-[var(--accent)] transition" role="menuitem">Admin</a>
            </li>
          </ul>
        </div>
        <div class="flex items-center gap-4">
          <div *ngIf="currentUser$ | async as user" class="text-sm">
            Welcome, {{ user.name || user.email }}
          </div>
          <button
            *ngIf="isAuthenticated$ | async"
            routerLink="/reviews/new"
            class="bg-[var(--secondary)] text-white px-4 py-2 rounded font-semibold hover:brightness-90 transition"
            aria-label="Create new review"
          >
            + New Review
          </button>
          <button
            *ngIf="(isAuthenticated$ | async) === false"
            routerLink="/login"
            class="bg-[var(--accent)] text-[var(--primary)] px-4 py-2 rounded font-semibold hover:brightness-95 transition"
            aria-label="Login"
          >
            Login
          </button>
          <button
            *ngIf="isAuthenticated$ | async"
            (click)="logout()"
            class="bg-red-600 px-4 py-2 rounded font-semibold hover:bg-red-700 transition"
            aria-label="Logout"
          >
            Logout
          </button>
        </div>
      </nav>
    </header>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent implements OnDestroy {
  readonly site = inject(SiteConfigService);
  isAuthenticated$ = this.authService.isAuthenticated();
  currentUser$ = this.authService.getCurrentUser$();
  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    @Inject(SSO_LOGOUT_REDIRECT) private ssoLogoutRedirect: (url: string) => void,
  ) {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  logout(): void {
    this.authService.logout();
    this.ssoLogoutRedirect(environment.ssoLogoutUrl);
  }
}

