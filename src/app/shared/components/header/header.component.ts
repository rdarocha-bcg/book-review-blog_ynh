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
    <header class="sticky top-0 z-40 border-b border-[var(--border-light)] bg-[#fff9fc]/85 backdrop-blur-md" role="banner">
      <a href="#main-content" class="skip-link">Skip to main content</a>
      <nav
        class="container mx-auto my-3 flex items-center justify-between gap-4 rounded-full border border-[var(--border-light)] bg-white/95 px-5 py-3 shadow-[0_10px_24px_-20px_rgba(122,54,95,0.8)]"
        aria-label="Main navigation"
      >
        <div class="flex items-center gap-8">
          <a
            routerLink="/"
            class="text-2xl font-bold text-[var(--primary)]"
            [attr.aria-label]="site.config().siteNameShort + ' home'"
            >📚 {{ site.config().siteNameShort }}</a
          >
          <ul class="hidden md:flex gap-6" role="menubar">
            <li role="none">
              <a routerLink="/" class="font-medium text-[var(--text-dark)] hover:text-[var(--accent-strong)] transition" role="menuitem"
                >Home</a
              >
            </li>
            <li role="none">
              <a
                routerLink="/blog"
                class="font-medium text-[var(--text-dark)] hover:text-[var(--accent-strong)] transition"
                role="menuitem"
                >Blog</a
              >
            </li>
            <li *ngIf="(currentUser$ | async)?.role === 'admin'" role="none">
              <a
                routerLink="/admin"
                class="font-medium text-[var(--text-dark)] hover:text-[var(--accent-strong)] transition"
                role="menuitem"
                >Admin</a
              >
            </li>
          </ul>
        </div>
        <div class="flex items-center gap-4">
          <div *ngIf="currentUser$ | async as user" class="text-sm text-[var(--text-muted)]">
            Welcome, {{ user.name || user.email }}
          </div>
          <button
            *ngIf="isAuthenticated$ | async"
            routerLink="/reviews/new"
            class="bg-[var(--secondary)] text-white px-4 py-2 rounded-full font-semibold hover:brightness-95 transition"
            aria-label="Create new review"
          >
            + New Review
          </button>
          <button
            *ngIf="(isAuthenticated$ | async) === false"
            routerLink="/login"
            class="bg-[var(--accent)] text-[var(--primary)] px-4 py-2 rounded-full font-semibold hover:brightness-95 transition"
            aria-label="Login"
          >
            Login
          </button>
          <button
            *ngIf="isAuthenticated$ | async"
            (click)="logout()"
            class="bg-[#bc4a79] px-4 py-2 rounded-full font-semibold text-white hover:brightness-95 transition"
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

