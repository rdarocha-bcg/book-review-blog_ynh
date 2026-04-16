import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

/**
 * 401 — session is managed outside this app (e.g. YunoHost portal).
 */
@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="container mx-auto px-4 py-12 text-center" aria-labelledby="unauthorized-heading">
      <div class="mx-auto max-w-md">
        <h1 id="unauthorized-heading" class="mb-2 text-4xl font-bold text-[var(--primary)]">401</h1>
        <h2 class="mb-4 text-xl font-semibold text-[var(--text-dark)]">Unauthorized</h2>
        <p class="mb-8 text-[var(--text-muted)]">
          Sign in from your server user portal if this site is protected, then try again.
        </p>
        <a
          routerLink="/"
          class="inline-block rounded-full bg-[var(--secondary)] px-6 py-3 font-semibold text-white hover:brightness-95"
          aria-label="Go to home page"
        >
          Home
        </a>
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UnauthorizedComponent {}
