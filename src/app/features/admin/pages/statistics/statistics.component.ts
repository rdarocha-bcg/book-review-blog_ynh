import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="page-container page-container--tight-y">
      <div class="mb-8">
        <a routerLink="/admin" class="mb-2 inline-block text-[var(--accent-strong)] hover:underline">← Admin</a>
        <h1 class="text-3xl font-bold text-[var(--primary)]">Audience</h1>
        <p class="mt-1 text-[var(--text-muted)]">Statistiques de visite via Umami — sans cookies, conforme RGPD.</p>
      </div>

      <div class="rounded-lg border border-[var(--border-light)] bg-[var(--card-bg)] p-6">
        <p class="mb-4 text-[var(--text-muted)]">
          Les données d'audience sont disponibles dans le tableau de bord Umami&nbsp;:
        </p>
        <a
          href="https://stats.remidarocha.fr"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center gap-2 rounded-lg bg-[var(--accent-strong)] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-strong)]"
        >
          Ouvrir Umami
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatisticsComponent {}
