import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiService } from '@core/services/api.service';
import { NotificationService } from '@core/services/notification.service';
import { Subject, takeUntil } from 'rxjs';

/**
 * Reset Password with Token Component
 * User lands here from email link with ?token=xxx
 */
@Component({
  selector: 'app-reset-password-token',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="page-container page-container--roomy-y">
      <div class="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 class="text-3xl font-bold text-center mb-2">Set New Password</h1>
        <p class="text-center text-gray-600 mb-8">Enter your new password below.</p>

        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
          <div>
            <label for="password" class="block text-sm font-semibold mb-2">New Password *</label>
            <input
              id="password"
              type="password"
              formControlName="password"
              placeholder="New password"
              class="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              aria-label="New password"
              [attr.aria-invalid]="form.get('password')?.invalid && form.get('password')?.touched ? 'true' : 'false'"
            />
            <p *ngIf="form.get('password')?.invalid && form.get('password')?.touched" class="text-red-600 text-sm mt-1">At least 6 characters.</p>
          </div>
          <div>
            <label for="confirmPassword" class="block text-sm font-semibold mb-2">Confirm Password *</label>
            <input
              id="confirmPassword"
              type="password"
              formControlName="confirmPassword"
              placeholder="Confirm new password"
              class="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              aria-label="Confirm new password"
            />
            <p *ngIf="form.get('confirmPassword')?.invalid && form.get('confirmPassword')?.touched" class="text-red-600 text-sm mt-1">Passwords must match.</p>
          </div>
          <button
            type="submit"
            [disabled]="!form.valid || isSubmitting || !token"
            class="w-full bg-[var(--accent)] text-[var(--primary)] py-2 rounded font-semibold hover:brightness-95 transition disabled:opacity-50"
            aria-label="Reset password"
          >
            <span *ngIf="!isSubmitting">Reset Password</span>
            <span *ngIf="isSubmitting">Saving...</span>
          </button>
        </form>

        <p *ngIf="!token" class="mt-4 text-center text-red-600 text-sm">Invalid or missing reset link. Request a new one from the login page.</p>
        <p class="mt-6 text-center text-sm">
          <a routerLink="/auth/login" class="text-blue-600 hover:underline">Back to login</a>
        </p>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResetPasswordTokenComponent implements OnInit, OnDestroy {
  form!: FormGroup;
  token: string | null = null;
  isSubmitting = false;
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token');
    this.form = this.fb.group(
      {
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required],
      },
      { validators: this.passwordMatch }
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  passwordMatch(c: AbstractControl): ValidationErrors | null {
    const p = c.get('password')?.value;
    const cp = c.get('confirmPassword')?.value;
    return p && cp && p !== cp ? { passwordMismatch: true } : null;
  }

  onSubmit(): void {
    if (!this.form.valid || !this.token) return;
    this.isSubmitting = true;
    const password = this.form.get('password')?.value;
    this.apiService
      .post<{ message: string }>('auth/reset-password', { token: this.token, password })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.notificationService.success('Password updated. You can log in now.');
          this.router.navigate(['/auth/login']);
          this.isSubmitting = false;
        },
        error: () => {
          this.notificationService.error('Invalid or expired link. Request a new one.');
          this.isSubmitting = false;
        },
      });
  }
}
