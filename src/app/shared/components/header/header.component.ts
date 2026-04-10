import {
  Component,
  OnDestroy,
  ChangeDetectionStrategy,
  Inject,
  inject,
  signal,
  ElementRef,
  viewChild,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { SiteConfigService } from '@core/services/site-config.service';
import { SSO_LOGOUT_REDIRECT } from '@core/tokens/sso-redirect.token';
import { environment } from '@environments/environment';
import { filter, Subject, takeUntil } from 'rxjs';

/**
 * Header Component
 * Navigation and user menu
 */
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <header
      class="relative sticky top-0 z-40 border-b border-[var(--border-light)] bg-[#fff9fc]/85 backdrop-blur-md"
      role="banner"
    >
      <a href="#main-content" class="skip-link">Skip to main content</a>
      <nav
        class="container mx-auto my-3 flex items-center justify-between gap-4 rounded-full border border-[var(--border-light)] bg-white/95 px-5 py-3 shadow-[0_10px_24px_-20px_rgba(122,54,95,0.8)]"
        aria-label="Main navigation"
      >
        <div class="flex min-w-0 flex-1 items-center gap-3 md:gap-8">
          <a
            routerLink="/"
            class="min-w-0 truncate text-2xl font-semibold text-[var(--primary)] luxe-title tracking-[0.01em]"
            [attr.aria-label]="site.config().siteNameShort + ' home'"
            ><span aria-hidden="true">📚</span> {{ site.config().siteNameShort }}</a
          >
          <button
            type="button"
            class="inline-flex shrink-0 flex-col justify-center gap-1 rounded-full border border-[var(--border-light)] bg-white/90 p-2.5 text-[var(--primary)] shadow-sm md:hidden"
            [attr.aria-expanded]="mobileNavOpen()"
            aria-controls="mobile-nav-panel"
            id="mobile-nav-toggle"
            aria-label="Main menu"
            (click)="toggleMobileNav()"
            #menuButton
          >
            <span class="sr-only">{{ mobileNavOpen() ? 'Close menu' : 'Open menu' }}</span>
            <span class="block h-0.5 w-5 rounded-full bg-current" aria-hidden="true"></span>
            <span class="block h-0.5 w-5 rounded-full bg-current" aria-hidden="true"></span>
            <span class="block h-0.5 w-5 rounded-full bg-current" aria-hidden="true"></span>
          </button>
          <ul class="hidden gap-6 md:flex" role="menubar">
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
        <div class="flex shrink-0 items-center gap-2 sm:gap-4">
          <div *ngIf="currentUser$ | async as user" class="hidden text-sm text-[var(--text-muted)] sm:block">
            Welcome, {{ user.name || user.email }}
          </div>
          <button
            *ngIf="isAuthenticated$ | async"
            routerLink="/reviews/new"
            class="bg-[var(--secondary)] text-white px-3 py-2 sm:px-4 rounded-full text-sm font-semibold hover:brightness-95 transition sm:text-base"
            aria-label="Create new review"
          >
            + New Review
          </button>
          <button
            *ngIf="(isAuthenticated$ | async) === false"
            routerLink="/login"
            class="bg-[var(--accent)] text-[var(--primary)] px-3 py-2 sm:px-4 rounded-full text-sm font-semibold hover:brightness-95 transition sm:text-base"
            aria-label="Login"
          >
            Login
          </button>
          <button
            *ngIf="isAuthenticated$ | async"
            (click)="logout()"
            class="bg-[#bc4a79] px-3 py-2 sm:px-4 rounded-full text-sm font-semibold text-white hover:brightness-95 transition sm:text-base"
            aria-label="Logout"
          >
            Logout
          </button>
        </div>
      </nav>

      @if (mobileNavOpen()) {
        <div
          class="fixed inset-0 z-[45] bg-black/35 md:hidden"
          aria-hidden="true"
          (click)="closeMobileNav()"
        ></div>
        <div
          #mobileNavPanel
          id="mobile-nav-panel"
          class="fixed left-4 right-4 top-[4.75rem] z-50 max-h-[min(70vh,calc(100dvh-6rem))] overflow-y-auto rounded-2xl border border-[var(--border-light)] bg-white/98 p-4 shadow-[0_20px_40px_-24px_rgba(122,54,95,0.55)] md:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile menu"
        >
          <ul class="flex flex-col gap-1" role="list">
            <li>
              <a
                routerLink="/"
                class="block rounded-xl px-3 py-3 font-medium text-[var(--text-dark)] hover:bg-[var(--surface)]"
                (click)="closeMobileNav()"
                >Home</a
              >
            </li>
            <li>
              <a
                routerLink="/blog"
                class="block rounded-xl px-3 py-3 font-medium text-[var(--text-dark)] hover:bg-[var(--surface)]"
                (click)="closeMobileNav()"
                >Blog</a
              >
            </li>
            <li *ngIf="(currentUser$ | async)?.role === 'admin'">
              <a
                routerLink="/admin"
                class="block rounded-xl px-3 py-3 font-medium text-[var(--text-dark)] hover:bg-[var(--surface)]"
                (click)="closeMobileNav()"
                >Admin</a
              >
            </li>
          </ul>
          <div class="mt-4 border-t border-[var(--border-light)] pt-4">
            <p *ngIf="currentUser$ | async as user" class="mb-3 px-3 text-sm text-[var(--text-muted)]">
              Welcome, {{ user.name || user.email }}
            </p>
            <div class="flex flex-col gap-2">
              <a
                *ngIf="isAuthenticated$ | async"
                routerLink="/reviews/new"
                class="inline-flex items-center justify-center rounded-full bg-[var(--secondary)] px-4 py-2.5 font-semibold text-white no-underline hover:brightness-95"
                (click)="closeMobileNav()"
              >
                + New Review
              </a>
              <a
                *ngIf="(isAuthenticated$ | async) === false"
                routerLink="/login"
                class="inline-flex items-center justify-center rounded-full bg-[var(--accent)] px-4 py-2.5 font-semibold text-[var(--primary)] no-underline hover:brightness-95"
                (click)="closeMobileNav()"
              >
                Login
              </a>
              <button
                *ngIf="isAuthenticated$ | async"
                type="button"
                class="rounded-full bg-[#bc4a79] px-4 py-2.5 font-semibold text-white hover:brightness-95"
                (click)="logoutFromMobile()"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      }
    </header>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent implements OnDestroy {
  readonly site = inject(SiteConfigService);
  private readonly router = inject(Router);

  readonly mobileNavOpen = signal(false);
  private readonly menuButtonRef = viewChild<ElementRef<HTMLButtonElement>>('menuButton');
  private readonly mobileNavPanelRef = viewChild<ElementRef<HTMLElement>>('mobileNavPanel');

  isAuthenticated$ = this.authService.isAuthenticated();
  currentUser$ = this.authService.getCurrentUser$();
  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    @Inject(SSO_LOGOUT_REDIRECT) private ssoLogoutRedirect: (url: string) => void,
  ) {
    this.router.events
      .pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        takeUntil(this.destroy$),
      )
      .subscribe(() => this.closeMobileNav());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleMobileNav(): void {
    if (this.mobileNavOpen()) {
      this.closeMobileNav();
    } else {
      this.openMobileNav();
    }
  }

  openMobileNav(): void {
    this.mobileNavOpen.set(true);
    queueMicrotask(() => this.focusFirstInPanel());
  }

  closeMobileNav(): void {
    if (!this.mobileNavOpen()) {
      return;
    }
    this.mobileNavOpen.set(false);
    const btn = this.menuButtonRef()?.nativeElement;
    queueMicrotask(() => btn?.focus());
  }

  logout(): void {
    this.authService.logout();
    this.ssoLogoutRedirect(environment.ssoLogoutUrl);
  }

  logoutFromMobile(): void {
    this.closeMobileNav();
    this.logout();
  }

  @HostListener('document:keydown', ['$event'])
  onDocumentKeydown(event: KeyboardEvent): void {
    if (!this.mobileNavOpen()) {
      return;
    }
    if (event.key === 'Escape') {
      event.preventDefault();
      this.closeMobileNav();
      return;
    }
    if (event.key !== 'Tab') {
      return;
    }
    const panel = this.mobileNavPanelRef()?.nativeElement;
    if (!panel) {
      return;
    }
    const focusables = this.getFocusableElements(panel);
    if (focusables.length === 0) {
      return;
    }
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const active = document.activeElement;
    if (event.shiftKey) {
      if (active === first || !panel.contains(active)) {
        event.preventDefault();
        last.focus();
      }
    } else if (active === last) {
      event.preventDefault();
      first.focus();
    }
  }

  private focusFirstInPanel(): void {
    const panel = this.mobileNavPanelRef()?.nativeElement;
    if (!panel) {
      return;
    }
    const focusables = this.getFocusableElements(panel);
    focusables[0]?.focus();
  }

  private getFocusableElements(container: HTMLElement): HTMLElement[] {
    const sel = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';
    return Array.from(container.querySelectorAll<HTMLElement>(sel)).filter((el) => {
      if (el.hasAttribute('disabled') || el.getAttribute('aria-hidden') === 'true') {
        return false;
      }
      return el.offsetWidth > 0 || el.offsetHeight > 0 || el.getClientRects().length > 0;
    });
  }
}
