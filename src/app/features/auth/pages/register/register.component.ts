import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { environment } from '@environments/environment';
import { Subject, takeUntil } from 'rxjs';

/**
 * Registration — accounts are created in YunoHost, not in this app.
 */
@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container mx-auto px-4 py-12">
      <div class="max-w-md mx-auto pinterest-panel p-8 text-center">
        <span class="inline-block px-3 py-1 rounded-full bg-[var(--surface-alt)] text-[var(--primary)] text-xs font-semibold mb-4">
          Join the community
        </span>
        <h1 class="text-3xl font-bold mb-4 text-[var(--text-dark)]">Create an account</h1>
        <p class="text-[var(--text-muted)] mb-6">
          User accounts are managed by <strong>YunoHost</strong>. Ask your server administrator to create a user, or use
          the admin tools on your server.
        </p>
        <a
          class="inline-block w-full bg-[var(--secondary)] text-white py-3 rounded-full font-semibold hover:brightness-95 transition mb-4"
          [href]="ssoLoginUrl"
        >
          Open YunoHost portal
        </a>
        <p class="text-sm text-[var(--text-muted)]">
          Already have an account?
          <a routerLink="/auth/login" class="text-[var(--accent-strong)] hover:underline font-semibold">Sign in</a>
        </p>
        <p class="mt-4 text-sm">
          <a routerLink="/" class="text-[var(--accent-strong)] hover:underline">Back to home</a>
        </p>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterComponent implements OnInit, OnDestroy {
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
