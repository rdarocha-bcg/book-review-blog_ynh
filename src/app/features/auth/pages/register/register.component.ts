import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { NotificationService } from '@core/services/notification.service';
import { ButtonComponent } from '@shared/components/button/button.component';
import { LoadingSpinnerComponent } from '@shared/components/loading-spinner/loading-spinner.component';
import { Subject, takeUntil } from 'rxjs';

/**
 * Register Component
 * User registration page
 */
@Component({
  selector: 'app-register',
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
        <h1 class="text-3xl font-bold text-center mb-8">Create Account</h1>

        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="space-y-4">
          <!-- Name -->
          <div>
            <label for="name" class="block text-sm font-semibold mb-2">Full Name *</label>
            <input
              id="name"
              type="text"
              formControlName="name"
              placeholder="Enter your full name"
              class="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              [attr.aria-label]="'Full Name'"
              [attr.aria-invalid]="isFieldInvalid('name')"
            />
            <p *ngIf="isFieldInvalid('name')" class="text-red-600 text-sm mt-1">
              Name is required (at least 2 characters)
            </p>
          </div>

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
              Password must be at least 6 characters
            </p>
            <p class="text-gray-500 text-xs mt-1">
              Use a mix of letters, numbers, and symbols for better security
            </p>
          </div>

          <!-- Confirm Password -->
          <div>
            <label for="confirmPassword" class="block text-sm font-semibold mb-2">
              Confirm Password *
            </label>
            <input
              id="confirmPassword"
              type="password"
              formControlName="confirmPassword"
              placeholder="Confirm your password"
              class="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              [attr.aria-label]="'Confirm Password'"
              [attr.aria-invalid]="isFieldInvalid('confirmPassword')"
            />
            <p *ngIf="isFieldInvalid('confirmPassword')" class="text-red-600 text-sm mt-1">
              Passwords do not match
            </p>
          </div>

          <!-- Terms & Conditions -->
          <div class="flex items-start gap-2">
            <input
              id="agree"
              type="checkbox"
              formControlName="agree"
              class="w-4 h-4 mt-1 cursor-pointer"
              [attr.aria-label]="'Agree to terms and conditions'"
            />
            <label for="agree" class="text-sm cursor-pointer">
              I agree to the
              <a href="#" class="text-blue-600 hover:text-blue-800">terms and conditions</a>
            </label>
          </div>
          <p *ngIf="isFieldInvalid('agree')" class="text-red-600 text-sm">
            You must agree to the terms and conditions
          </p>

          <!-- Submit Button -->
          <button
            type="submit"
            [disabled]="!registerForm.valid || isSubmitting"
            class="w-full bg-yellow-400 text-slate-900 py-2 rounded font-semibold hover:bg-yellow-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
            [attr.aria-label]="'Register button'"
          >
            <span *ngIf="!isSubmitting">Create Account</span>
            <span *ngIf="isSubmitting" class="flex items-center justify-center gap-2">
              <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
              Creating account...
            </span>
          </button>
        </form>

        <!-- Links -->
        <div class="mt-6 text-center">
          <p class="text-sm">
            Already have an account?
            <a routerLink="/login" class="text-blue-600 hover:text-blue-800 font-semibold">Login</a>
          </p>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterComponent implements OnInit, OnDestroy {
  registerForm!: FormGroup;
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
    this.registerForm = this.fb.group(
      {
        name: ['', [Validators.required, Validators.minLength(2)]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required],
        agree: [false, Validators.requiredTrue],
      },
      { validators: this.passwordMatchValidator }
    );
  }

  /**
   * Custom validator to check if passwords match
   */
  private passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;

    if (password && confirmPassword && password !== confirmPassword) {
      control.get('confirmPassword')?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    return null;
  }

  /**
   * Check if form field is invalid and touched
   */
  isFieldInvalid(fieldName: string): boolean {
    const field = this.registerForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  /**
   * Submit registration form
   */
  onSubmit(): void {
    if (!this.registerForm.valid) {
      return;
    }

    this.isSubmitting = true;
    const userData = {
      name: this.registerForm.get('name')?.value,
      email: this.registerForm.get('email')?.value,
      password: this.registerForm.get('password')?.value,
    };

    this.authService
      .register(userData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.notificationService.success('Account created successfully!');
          this.isSubmitting = false;
          this.router.navigate(['/']);
        },
        error: (error) => {
          this.notificationService.error('Registration failed. Please try again.');
          console.error('Registration error:', error);
          this.isSubmitting = false;
        },
      });
  }
}
