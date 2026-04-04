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
      <div class="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
        <h1 class="text-3xl font-bold mb-4">Sign in</h1>
        <p class="text-slate-600 mb-6">
          This app uses <strong>YunoHost single sign-on</strong>. Open the user portal and sign in there, then return
          to this site.
        </p>
        <a
          class="inline-block w-full bg-yellow-400 text-slate-900 py-3 rounded font-semibold hover:bg-yellow-300 transition"
          [href]="ssoLoginUrl"
        >
          Open YunoHost portal
        </a>
        <p class="mt-6 text-sm text-slate-500">
          After signing in at the portal, reload this page or navigate home.
        </p>
        <p class="mt-4 text-sm">
          <a routerLink="/" class="text-blue-600 hover:underline">Back to home</a>
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
