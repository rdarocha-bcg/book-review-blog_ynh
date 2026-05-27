import { Component, ChangeDetectionStrategy, OnInit, signal, inject, ChangeDetectorRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReviewService } from '@features/reviews/services/review.service';
import { AcademicService } from '@features/academics/services/academic.service';
import { Review } from '@features/reviews/models/review.model';

interface GenreCount {
  genre: string;
  count: number;
  pct: number;
}

interface DashboardStats {
  totalReviews: number;
  totalAcademics: number;
  avgRating: number;
  genres: GenreCount[];
  recentReviews: Review[];
}

/**
 * Admin hub: quick stats + moderation shortcuts.
 */
@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [RouterLink, CommonModule],
  template: `
    <div class="page-container page-container--tight-y">
      <h1 class="mb-2 text-3xl font-bold text-[var(--primary)]">Admin</h1>
      <p class="mb-8 text-[var(--text-muted)]">Tableau de bord de gestion.</p>

      <!-- Inline analytics -->
      <section aria-labelledby="stats-heading" class="mb-10">
        <h2 id="stats-heading" class="mb-4 text-lg font-semibold text-[var(--primary)]">Résumé du contenu</h2>

        @if (loading()) {
          <div class="grid max-w-3xl grid-cols-2 gap-4 sm:grid-cols-4">
            @for (_ of [1,2,3,4]; track $index) {
              <div class="animate-pulse rounded-xl border border-[var(--border-light)] bg-[var(--card-bg)] p-5">
                <div class="mb-2 h-8 w-16 rounded bg-[var(--surface-alt)]"></div>
                <div class="h-4 w-24 rounded bg-[var(--surface-alt)]"></div>
              </div>
            }
          </div>
        }

        @if (!loading() && stats()) {
          <div class="grid max-w-3xl grid-cols-2 gap-4 sm:grid-cols-4">
            <!-- Total reviews -->
            <div class="rounded-xl border border-[var(--border-light)] bg-[var(--card-bg)] p-5">
              <p class="text-3xl font-bold text-[var(--primary)]">{{ stats()!.totalReviews }}</p>
              <p class="mt-1 text-sm text-[var(--text-muted)]">Critiques</p>
            </div>
            <!-- Total academics -->
            <div class="rounded-xl border border-[var(--border-light)] bg-[var(--card-bg)] p-5">
              <p class="text-3xl font-bold text-[var(--primary)]">{{ stats()!.totalAcademics }}</p>
              <p class="mt-1 text-sm text-[var(--text-muted)]">Travaux académiques</p>
            </div>
            <!-- Average rating -->
            <div class="rounded-xl border border-[var(--border-light)] bg-[var(--card-bg)] p-5">
              <p class="text-3xl font-bold text-[var(--accent-strong)]">★ {{ stats()!.avgRating | number:'1.1-1' }}</p>
              <p class="mt-1 text-sm text-[var(--text-muted)]">Note moyenne</p>
            </div>
            <!-- Genre count -->
            <div class="rounded-xl border border-[var(--border-light)] bg-[var(--card-bg)] p-5">
              <p class="text-3xl font-bold text-[var(--primary)]">{{ stats()!.genres.length }}</p>
              <p class="mt-1 text-sm text-[var(--text-muted)]">Genres</p>
            </div>
          </div>

          <!-- Genre distribution -->
          @if (stats()!.genres.length > 0) {
            <div class="mt-6 max-w-3xl rounded-xl border border-[var(--border-light)] bg-[var(--card-bg)] p-5">
              <h3 class="mb-4 text-sm font-semibold text-[var(--primary)]">Répartition par genre</h3>
              <ul class="space-y-2" aria-label="Répartition par genre">
                @for (g of stats()!.genres; track g.genre) {
                  <li class="flex items-center gap-3">
                    <span class="w-24 shrink-0 text-sm text-[var(--text-muted)] capitalize">{{ g.genre }}</span>
                    <div class="flex-1 overflow-hidden rounded-full bg-[var(--surface-alt)] h-2.5" role="progressbar" [attr.aria-valuenow]="g.pct" aria-valuemin="0" aria-valuemax="100" [attr.aria-label]="g.genre + ' : ' + g.count + ' critiques'">
                      <div class="h-full rounded-full bg-[var(--secondary)] transition-all duration-500" [style.width.%]="g.pct"></div>
                    </div>
                    <span class="w-8 shrink-0 text-right text-sm font-medium text-[var(--text-dark)]">{{ g.count }}</span>
                  </li>
                }
              </ul>
            </div>
          }

          <!-- Recent reviews -->
          @if (stats()!.recentReviews.length > 0) {
            <div class="mt-6 max-w-3xl rounded-xl border border-[var(--border-light)] bg-[var(--card-bg)] p-5">
              <h3 class="mb-3 text-sm font-semibold text-[var(--primary)]">Dernières critiques ajoutées</h3>
              <ul class="divide-y divide-[var(--border-light)]">
                @for (r of stats()!.recentReviews; track r.id) {
                  <li class="flex items-center justify-between gap-4 py-2">
                    <a [routerLink]="['/reviews', r.id]" class="truncate text-sm font-medium text-[var(--accent-strong)] hover:underline">{{ r.title }}</a>
                    <span class="shrink-0 text-xs text-[var(--text-muted)]">★ {{ r.rating }}</span>
                  </li>
                }
              </ul>
            </div>
          }
        }
      </section>

      <!-- Action shortcuts -->
      <section aria-labelledby="actions-heading">
        <h2 id="actions-heading" class="mb-4 text-lg font-semibold text-[var(--primary)]">Actions rapides</h2>
        <div class="grid max-w-2xl grid-cols-1 gap-4 sm:grid-cols-2">
          <a
            routerLink="/reviews/new"
            class="rounded-lg border border-[var(--border-light)] bg-[var(--card-bg)] p-5 transition hover:border-[var(--accent-strong)] focus-visible:outline-2 focus-visible:outline-[var(--primary)]"
          >
            <h3 class="mb-1 font-semibold text-[var(--primary)]">Nouvelle critique</h3>
            <p class="text-sm text-[var(--text-muted)]">Créer une critique de livre.</p>
          </a>

          <a
            routerLink="/academics/new"
            class="rounded-lg border border-[var(--border-light)] bg-[var(--card-bg)] p-5 transition hover:border-[var(--accent-strong)] focus-visible:outline-2 focus-visible:outline-[var(--primary)]"
          >
            <h3 class="mb-1 font-semibold text-[var(--primary)]">Nouveau travail académique</h3>
            <p class="text-sm text-[var(--text-muted)]">Créer un travail académique.</p>
          </a>

          <a
            routerLink="/admin/reviews"
            class="rounded-lg border border-[var(--border-light)] bg-[var(--card-bg)] p-5 transition hover:border-[var(--accent-strong)] focus-visible:outline-2 focus-visible:outline-[var(--primary)]"
          >
            <h3 class="mb-1 font-semibold text-[var(--primary)]">Gérer les critiques</h3>
            <p class="text-sm text-[var(--text-muted)]">Modifier ou supprimer des critiques.</p>
          </a>

          <a
            routerLink="/admin/academics"
            class="rounded-lg border border-[var(--border-light)] bg-[var(--card-bg)] p-5 transition hover:border-[var(--accent-strong)] focus-visible:outline-2 focus-visible:outline-[var(--primary)]"
          >
            <h3 class="mb-1 font-semibold text-[var(--primary)]">Gérer les travaux</h3>
            <p class="text-sm text-[var(--text-muted)]">Modifier ou supprimer des travaux académiques.</p>
          </a>

          <a
            routerLink="/admin/stats"
            class="rounded-lg border border-[var(--border-light)] bg-[var(--card-bg)] p-5 transition hover:border-[var(--accent-strong)] focus-visible:outline-2 focus-visible:outline-[var(--primary)]"
          >
            <h3 class="mb-1 font-semibold text-[var(--primary)]">Audience</h3>
            <p class="text-sm text-[var(--text-muted)]">Statistiques de visite (Umami).</p>
          </a>

          <a
            routerLink="/reviews"
            class="rounded-lg border border-[var(--border-light)] bg-[var(--card-bg)] p-5 transition hover:border-[var(--accent-strong)] focus-visible:outline-2 focus-visible:outline-[var(--primary)]"
          >
            <h3 class="mb-1 font-semibold text-[var(--primary)]">Voir le site</h3>
            <p class="text-sm text-[var(--text-muted)]">Consulter les critiques publiées.</p>
          </a>
        </div>
      </section>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminDashboardComponent implements OnInit {
  private readonly reviewService = inject(ReviewService);
  private readonly academicService = inject(AcademicService);
  private readonly cdr = inject(ChangeDetectorRef);

  readonly loading = signal(true);
  readonly stats = signal<DashboardStats | null>(null);

  ngOnInit(): void {
    let reviewsTotal = 0;
    let academicsTotal = 0;
    let allReviews: Review[] = [];

    this.reviewService.getReviews({ limit: 200 }).subscribe({
      next: (res) => {
        reviewsTotal = res.total;
        allReviews = res.data;

        this.academicService.getAcademics({ limit: 1 }).subscribe({
          next: (ares) => {
            academicsTotal = ares.total;
            this.stats.set(this.computeStats(reviewsTotal, academicsTotal, allReviews));
            this.loading.set(false);
            this.cdr.markForCheck();
          },
          error: () => {
            this.stats.set(this.computeStats(reviewsTotal, 0, allReviews));
            this.loading.set(false);
            this.cdr.markForCheck();
          },
        });
      },
      error: () => {
        this.loading.set(false);
        this.cdr.markForCheck();
      },
    });
  }

  private computeStats(totalReviews: number, totalAcademics: number, reviews: Review[]): DashboardStats {
    const avgRating = reviews.length
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

    const genreMap = new Map<string, number>();
    for (const r of reviews) {
      genreMap.set(r.genre, (genreMap.get(r.genre) ?? 0) + 1);
    }
    const sortedGenres = [...genreMap.entries()].sort((a, b) => b[1] - a[1]);
    const maxCount = sortedGenres[0]?.[1] ?? 1;
    const genres: GenreCount[] = sortedGenres.map(([genre, count]) => ({
      genre,
      count,
      pct: Math.round((count / maxCount) * 100),
    }));

    const recentReviews = [...reviews]
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      .slice(0, 5);

    return { totalReviews, totalAcademics, avgRating, genres, recentReviews };
  }
}
