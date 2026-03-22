import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { NotificationService } from '@core/services/notification.service';
import { ButtonComponent } from '@shared/components/button/button.component';
import { LoadingSpinnerComponent } from '@shared/components/loading-spinner/loading-spinner.component';
import { Subject, takeUntil } from 'rxjs';

/**
 * Login Component
 * User login page
 */
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    ButtonComponent,
    LoadingSpinnerComponent,
  ],
  template: `
    <div class="container mx-auto px-4 py-12">
      <div class="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 class="text-3xl font-bold text-center mb-8">Login</h1>

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-4">
          <!-- Email -->
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

          <!-- Password -->
          <div>
            <label for="password" class="block text-sm font-semibold mb-2">Password *</label>
            <input
              id="password"
              type="password"
              formControlName="password"
              placeholder="Enter your password"
              class="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              [attr.aria-label]="'Password'"
              [attr.aria-invalid]="isFieldInvalid('password')"
            />
            <p *ngIf="isFieldInvalid('password')" class="text-red-600 text-sm mt-1">
              Password is required
            </p>
          </div>

          <!-- Remember Me -->
          <div class="flex items-center gap-2">
            <input
              id="rememberMe"
              type="checkbox"
              formControlName="rememberMe"
              class="w-4 h-4 cursor-pointer"
              [attr.aria-label]="'Remember me'"
            />
            <label for="rememberMe" class="text-sm cursor-pointer">Remember me</label>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            [disabled]="!loginForm.valid || isSubmitting"
            class="w-full bg-yellow-400 text-slate-900 py-2 rounded font-semibold hover:bg-yellow-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
            [attr.aria-label]="'Login button'"
          >
            <span *ngIf="!isSubmitting">Login</span>
            <span *ngIf="isSubmitting" class="flex items-center justify-center gap-2">
              <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
              Logging in...
            </span>
          </button>
        </form>

        <!-- Links -->
        <div class="mt-6 text-center space-y-2">
          <p class="text-sm">
            Don't have an account?
            <a routerLink="/register" class="text-blue-600 hover:text-blue-800 font-semibold">Register</a>
          </p>
          <p class="text-sm">
            <a routerLink="/auth/forgot-password" class="text-blue-600 hover:text-blue-800">Forgot password?</a>
          </p>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent implements OnInit, OnDestroy {
  loginForm!: FormGroup;
  isSubmitting = false;
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private notificationService: NotificationService,
    private router: Router
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    // Redirect if already authenticated
    if (this.authService.isAuthenticatedSync()) {
      this.router.navigate(['/']);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Initialize form with validation
   */
  private initializeForm(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false],
    });
  }

  /**
   * Check if form field is invalid and touched
   */
  isFieldInvalid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  /**
   * Submit login form
   */
  onSubmit(): void {
    if (!this.loginForm.valid) {
      return;
    }

    this.isSubmitting = true;
    const credentials = {
      email: this.loginForm.get('email')?.value,
      password: this.loginForm.get('password')?.value,
    };

    this.authService
      .login(credentials)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.notificationService.success('Login successful!');
          this.isSubmitting = false;
          this.router.navigate(['/']);
        },
        error: (error) => {
          this.notificationService.error('Invalid email or password');
          console.error('Login error:', error);
          this.isSubmitting = false;
        },
      });
  }
}
