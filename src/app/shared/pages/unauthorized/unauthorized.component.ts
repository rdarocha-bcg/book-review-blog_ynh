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
    <section class="container mx-auto px-4 py-16 text-center" aria-labelledby="unauthorized-heading">
      <div class="mx-auto max-w-lg">
        <div class="mb-6 text-7xl" aria-hidden="true">🔒</div>
        <h1 id="unauthorized-heading" class="mb-2 text-5xl font-bold text-[var(--primary)]">401</h1>
        <h2 class="mb-4 text-xl font-semibold text-[var(--text-dark)]">Accès non autorisé</h2>
        <p class="mb-8 text-[var(--text-muted)]">
          Connectez-vous depuis le portail utilisateur de votre serveur si ce site est protégé, puis réessayez.
        </p>
        <nav aria-label="Options de navigation" class="flex flex-wrap justify-center gap-3">
          <a
            routerLink="/"
            class="inline-block rounded-full bg-[var(--secondary)] px-5 py-2.5 font-semibold text-white transition hover:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--secondary)]"
          >
            Accueil
          </a>
          <a
            routerLink="/reviews"
            class="inline-block rounded-full border border-[var(--border-light)] bg-[var(--surface)] px-5 py-2.5 font-medium text-[var(--text-dark)] transition hover:bg-[var(--surface-alt)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
          >
            Critiques
          </a>
          <a
            routerLink="/academics"
            class="inline-block rounded-full border border-[var(--border-light)] bg-[var(--surface)] px-5 py-2.5 font-medium text-[var(--text-dark)] transition hover:bg-[var(--surface-alt)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
          >
            Travaux
          </a>
          <a
            routerLink="/contact"
            class="inline-block rounded-full border border-[var(--border-light)] bg-[var(--surface)] px-5 py-2.5 font-medium text-[var(--text-dark)] transition hover:bg-[var(--surface-alt)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
          >
            Contact
          </a>
        </nav>
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UnauthorizedComponent {}
