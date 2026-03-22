import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

/**
 * 404 Not Found Component
 */
@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="container mx-auto px-4 py-12 text-center" aria-labelledby="not-found-heading">
      <div class="max-w-md mx-auto">
        <h1 id="not-found-heading" class="text-6xl font-bold text-yellow-400 mb-4">404</h1>
        <h2 class="text-3xl font-bold mb-4">Page Not Found</h2>
        <p class="text-lg text-gray-600 mb-8">
          Sorry, the page you're looking for doesn't exist.
        </p>
        <a
          routerLink="/"
          class="bg-yellow-400 text-slate-900 px-6 py-3 rounded font-semibold hover:bg-yellow-300 transition inline-block"
          aria-label="Go to home page"
        >
          Go Home
        </a>
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotFoundComponent {}
