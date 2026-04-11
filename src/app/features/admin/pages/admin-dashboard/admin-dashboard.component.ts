import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

/**
 * Admin hub: moderation and stats only (single-operator setup).
 */
@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="page-container page-container--tight-y">
      <h1 class="mb-2 text-3xl font-bold text-[var(--primary)]">Admin</h1>
      <p class="mb-8 text-[var(--text-muted)]">Tools for managing reviews.</p>

      <div class="grid max-w-2xl grid-cols-1 gap-4 sm:grid-cols-2">
        <a
          routerLink="/reviews/new"
          class="rounded-lg border border-[var(--border-light)] bg-[var(--card-bg)] p-5 transition hover:border-[var(--accent-strong)]"
        >
          <h2 class="mb-1 font-semibold text-[var(--primary)]">New review</h2>
          <p class="text-sm text-[var(--text-muted)]">Create a review.</p>
        </a>

        <a
          routerLink="/"
          class="rounded-lg border border-[var(--border-light)] bg-[var(--card-bg)] p-5 transition hover:border-[var(--accent-strong)]"
        >
          <h2 class="mb-1 font-semibold text-[var(--primary)]">All reviews</h2>
          <p class="text-sm text-[var(--text-muted)]">Browse the list.</p>
        </a>

        <a
          routerLink="/admin/moderation"
          class="rounded-lg border border-[var(--border-light)] bg-[var(--card-bg)] p-5 transition hover:border-[var(--accent-strong)]"
        >
          <h2 class="mb-1 font-semibold text-[var(--primary)]">Moderation</h2>
          <p class="text-sm text-[var(--text-muted)]">Pending reviews.</p>
        </a>

        <a
          routerLink="/admin/stats"
          class="rounded-lg border border-[var(--border-light)] bg-[var(--card-bg)] p-5 transition hover:border-[var(--accent-strong)]"
        >
          <h2 class="mb-1 font-semibold text-[var(--primary)]">Statistics</h2>
          <p class="text-sm text-[var(--text-muted)]">Overview.</p>
        </a>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminDashboardComponent {}
