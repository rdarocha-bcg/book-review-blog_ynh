import {
  Component,
  OnDestroy,
  ChangeDetectionStrategy,
  computed,
  inject,
  signal,
  ElementRef,
  viewChild,
  HostListener,
} from '@angular/core';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { SiteConfigService } from '@core/services/site-config.service';
import { filter, Subject, takeUntil } from 'rxjs';

/**
 * Minimal site header: reviews, create, admin tools.
 */
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink],
  template: `
    <header
      class="relative sticky top-0 z-40 border-b border-[var(--border-light)] shadow-sm bg-[color:var(--header-bg)] backdrop-blur-md"
      role="banner"
    >
      <a href="#main-content" class="skip-link">Aller au contenu principal</a>
      <nav
        class="container mx-auto flex items-center justify-between gap-4 px-4 py-3 md:px-6"
        aria-label="Main navigation"
      >
        <div class="flex min-w-0 flex-1 items-center gap-4 md:gap-8">
          <a
            routerLink="/"
            class="min-w-0 truncate text-xl font-semibold text-[var(--primary)] md:text-2xl"
            [attr.aria-label]="site.config().siteNameShort + ' home'"
            >{{ site.config().siteNameShort }}</a
          >
          <button
            type="button"
            class="inline-flex shrink-0 flex-col justify-center gap-1 rounded-md border border-[var(--border-light)] bg-[var(--nav-bg)] p-2 text-[var(--primary)] md:hidden"
            [attr.aria-expanded]="mobileNavOpen()"
            aria-controls="mobile-nav-panel"
            id="mobile-nav-toggle"
            aria-label="Menu principal"
            (click)="toggleMobileNav()"
            #menuButton
          >
            <span class="sr-only">{{ mobileNavOpen() ? 'Fermer le menu' : 'Ouvrir le menu' }}</span>
            <span class="block h-0.5 w-5 rounded-full bg-current" aria-hidden="true"></span>
            <span class="block h-0.5 w-5 rounded-full bg-current" aria-hidden="true"></span>
            <span class="block h-0.5 w-5 rounded-full bg-current" aria-hidden="true"></span>
          </button>
          <ul class="hidden gap-6 md:flex">
            <li>
              <a routerLink="/" class="font-medium text-[var(--text-dark)] hover:text-[var(--accent-strong)]">Accueil</a>
            </li>
            <li>
              <a routerLink="/reviews" class="font-medium text-[var(--text-dark)] hover:text-[var(--accent-strong)]"
                >Critiques</a
              >
            </li>
            <li>
              <a routerLink="/academics" class="font-medium text-[var(--text-dark)] hover:text-[var(--accent-strong)]"
                >Travaux</a
              >
            </li>
            <li>
              <a routerLink="/about" class="font-medium text-[var(--text-dark)] hover:text-[var(--accent-strong)]"
                >À propos</a
              >
            </li>
            <li>
              <a routerLink="/contact" class="font-medium text-[var(--text-dark)] hover:text-[var(--accent-strong)]"
                >Contact</a
              >
            </li>
            @if (isAdmin()) {
              <li>
                <a routerLink="/admin" class="font-medium text-[var(--text-dark)] hover:text-[var(--accent-strong)]"
                  >Admin</a
                >
              </li>
            }
          </ul>
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
          class="fixed left-4 right-4 top-[4.25rem] z-50 max-h-[min(70vh,calc(100dvh-6rem))] overflow-y-auto rounded-lg border border-[var(--border-light)] bg-[var(--card-bg)] p-4 shadow-lg md:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Menu mobile"
        >
          <ul class="flex flex-col gap-1">
            <li>
              <a
                routerLink="/"
                class="block rounded-md px-3 py-3 font-medium text-[var(--text-dark)] hover:bg-[var(--surface)]"
                (click)="closeMobileNav()"
                >Accueil</a
              >
            </li>
            <li>
              <a
                routerLink="/reviews"
                class="block rounded-md px-3 py-3 font-medium text-[var(--text-dark)] hover:bg-[var(--surface)]"
                (click)="closeMobileNav()"
                >Critiques</a
              >
            </li>
            <li>
              <a
                routerLink="/academics"
                class="block rounded-md px-3 py-3 font-medium text-[var(--text-dark)] hover:bg-[var(--surface)]"
                (click)="closeMobileNav()"
                >Travaux</a
              >
            </li>
            <li>
              <a
                routerLink="/about"
                class="block rounded-md px-3 py-3 font-medium text-[var(--text-dark)] hover:bg-[var(--surface)]"
                (click)="closeMobileNav()"
                >À propos</a
              >
            </li>
            <li>
              <a
                routerLink="/contact"
                class="block rounded-md px-3 py-3 font-medium text-[var(--text-dark)] hover:bg-[var(--surface)]"
                (click)="closeMobileNav()"
                >Contact</a
              >
            </li>
            @if (isAdmin()) {
              <li>
                <a
                  routerLink="/admin"
                  class="block rounded-md px-3 py-3 font-medium text-[var(--text-dark)] hover:bg-[var(--surface)]"
                  (click)="closeMobileNav()"
                  >Admin</a
                >
              </li>
            }
          </ul>
        </div>
      }
    </header>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent implements OnDestroy {
  readonly site = inject(SiteConfigService);
  readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  /** True when the current user holds the admin role. */
  readonly isAdmin = computed(() => this.auth.state()?.user?.role === 'admin');

  readonly mobileNavOpen = signal(false);
  private readonly menuButtonRef = viewChild<ElementRef<HTMLButtonElement>>('menuButton');
  private readonly mobileNavPanelRef = viewChild<ElementRef<HTMLElement>>('mobileNavPanel');

  private destroy$ = new Subject<void>();

  constructor() {
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
