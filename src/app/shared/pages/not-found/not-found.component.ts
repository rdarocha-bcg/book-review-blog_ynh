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
        <h1 id="not-found-heading" class="text-6xl font-bold text-[var(--accent)] mb-4">404</h1>
        <h2 class="text-3xl font-bold mb-4">Page introuvable</h2>
        <p class="text-lg text-gray-600 mb-8">
          Désolé, la page que vous cherchez n'existe pas.
        </p>
        <a
          routerLink="/"
          class="bg-[var(--accent)] text-[var(--primary)] px-6 py-3 rounded font-semibold hover:brightness-95 transition inline-block"
          aria-label="Retourner à l'accueil"
        >
          Retour à l'accueil
        </a>
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotFoundComponent {}
