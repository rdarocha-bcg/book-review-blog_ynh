import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

/**
 * 401 Unauthorized Component
 */
@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="container mx-auto px-4 py-12 text-center" aria-labelledby="unauthorized-heading">
      <div class="max-w-md mx-auto">
        <h1 id="unauthorized-heading" class="text-6xl font-bold text-red-600 mb-4">401</h1>
        <h2 class="text-3xl font-bold mb-4">Unauthorized</h2>
        <p class="text-lg text-gray-600 mb-8">
          You need to be logged in to access this page.
        </p>
        <div class="space-x-4">
          <a
            routerLink="/login"
            class="bg-[var(--accent)] text-[var(--primary)] px-6 py-3 rounded font-semibold hover:brightness-95 transition inline-block"
            aria-label="Go to login page"
          >
            Login
          </a>
          <a
            routerLink="/"
            class="bg-slate-500 text-white px-6 py-3 rounded font-semibold hover:bg-slate-600 transition inline-block"
            aria-label="Go to home page"
          >
            Go Home
          </a>
        </div>
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UnauthorizedComponent {}
