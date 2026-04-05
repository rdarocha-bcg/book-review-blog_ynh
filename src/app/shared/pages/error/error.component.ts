import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

/**
 * Error Page Component
 * Displays error information (500, 403, etc.)
 */
@Component({
  selector: 'app-error',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="container mx-auto px-4 py-12 text-center" [attr.aria-labelledby]="'error-heading-' + statusCode">
      <div class="max-w-md mx-auto">
        <h1 [id]="'error-heading-' + statusCode" class="text-6xl font-bold text-red-600 mb-4">{{ statusCode }}</h1>
        <h2 class="text-3xl font-bold mb-4">{{ title }}</h2>
        <p class="text-lg text-gray-600 mb-8">{{ message }}</p>
        <a
          routerLink="/"
          class="bg-[var(--accent)] text-[var(--primary)] px-6 py-3 rounded font-semibold hover:brightness-95 transition inline-block"
          aria-label="Go to home page"
        >
          Go Home
        </a>
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ErrorComponent {
  @Input() statusCode: number = 500;
  @Input() title: string = 'Server Error';
  @Input() message: string = 'Something went wrong. Please try again later.';
}
