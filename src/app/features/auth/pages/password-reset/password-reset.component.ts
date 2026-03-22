import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '@core/services/api.service';
import { NotificationService } from '@core/services/notification.service';
import { Subject, takeUntil } from 'rxjs';

/**
 * Password Reset Component
 * Request a password reset link via email (backend sends the email)
 */
@Component({
  selector: 'app-password-reset',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="container mx-auto px-4 py-12">
      <div class="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 class="text-3xl font-bold text-center mb-2">Reset Password</h1>
        <p class="text-center text-gray-600 mb-8">
          Enter your email and we'll send you a link to reset your password.
        </p>

        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
          <div>
            <label for="email" class="block text-sm font-semibold mb-2">Email *</label>
            <input
              id="email"
              type="email"
              formControlName="email"
              placeholder="Enter your email"
              class="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              [attr.aria-label]="'Email'"
              [attr.aria-invalid]="isFieldInvalid('email')"
            />
            <p *ngIf="isFieldInvalid('email')" class="text-red-600 text-sm mt-1">
              Please enter a valid email
            </p>
          </div>

          <button
            type="submit"
            [disabled]="!form.valid || isSubmitting"
            class="w-full bg-yellow-400 text-slate-900 py-2 rounded font-semibold hover:bg-yellow-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span *ngIf="!isSubmitting">Send reset link</span>
            <span *ngIf="isSubmitting">Sending...</span>
          </button>
        </form>

        <p class="mt-6 text-center text-sm">
          <a routerLink="/auth/login" class="text-blue-600 hover:underline">Back to login</a>
        </p>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PasswordResetComponent implements OnInit, OnDestroy {
  form!: FormGroup;
  isSubmitting = false;
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  onSubmit(): void {
    if (!this.form.valid) return;

    this.isSubmitting = true;
    const email = this.form.get('email')?.value;

    this.apiService
      .post<{ message: string }>('auth/forgot-password', { email })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.notificationService.success(
            'If an account exists for this email, you will receive a reset link.'
          );
          this.isSubmitting = false;
          this.form.reset();
        },
        error: () => {
          this.notificationService.error('Something went wrong. Please try again.');
          this.isSubmitting = false;
        },
      });
  }
}
