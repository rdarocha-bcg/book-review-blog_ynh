import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { environment } from '@environments/environment';
import { Subject, takeUntil } from 'rxjs';

/**
 * Login — redirects to YunoHost SSO portal (no local password).
 */
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container mx-auto px-4 py-12">
      <div class="max-w-md mx-auto pinterest-panel p-8 text-center">
        <h1 class="text-3xl font-bold mb-4 text-[var(--primary)]">Sign in</h1>
        <p class="text-[var(--text-muted)] mb-6">
          This app uses <strong>YunoHost single sign-on</strong>. Open the user portal and sign in there, then return
          to this site.
        </p>
        <a
          class="inline-block w-full bg-[var(--secondary)] text-white py-3 rounded-full font-semibold hover:brightness-95 transition shadow-sm"
          [href]="ssoLoginUrl"
        >
          Open YunoHost portal
        </a>
        <p class="mt-6 text-sm text-[var(--text-muted)]">
          After signing in at the portal, reload this page or navigate home.
        </p>
        <p class="mt-4 text-sm">
          <a routerLink="/" class="text-[var(--accent-strong)] hover:underline">Back to home</a>
        </p>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent implements OnInit, OnDestroy {
  readonly ssoLoginUrl = environment.ssoLoginUrl;
  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.authService
      .loadSession()
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        if (this.authService.isAuthenticatedSync()) {
          this.router.navigate(['/']);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
