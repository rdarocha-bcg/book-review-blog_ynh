import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ReviewService } from '@features/reviews/services/review.service';
import { NotificationService } from '@core/services/notification.service';
import { LoadingSpinnerComponent } from '@shared/components/loading-spinner/loading-spinner.component';
import { Subject, takeUntil } from 'rxjs';
import { Review, ReviewPaginationResponse } from '@features/reviews/models/review.model';

/**
 * Admin Reviews Component
 * Lists all reviews with edit and delete actions (admin-only view).
 * Delete requires window.confirm confirmation before calling the API.
 */
@Component({
  selector: 'app-admin-reviews',
  standalone: true,
  imports: [CommonModule, RouterLink, LoadingSpinnerComponent],
  template: `
    <div class="page-container page-container--tight-y">
      <div class="mb-8">
        <a routerLink="/admin" class="text-[var(--accent-strong)] hover:text-[var(--primary)] mb-2 inline-block font-semibold">← Retour au tableau de bord</a>
        <h1 class="text-4xl font-bold text-[var(--primary)]">Critiques</h1>
        <p class="text-[var(--text-muted)] mt-1">Gérer toutes les critiques de livres.</p>
      </div>

      <div class="mb-4">
        <a
          routerLink="/reviews/new"
          class="inline-block px-4 py-2 rounded-lg bg-[var(--accent-strong)] text-white font-semibold hover:brightness-90 transition"
        >+ Nouvelle critique</a>
      </div>

      <app-loading-spinner *ngIf="loading"></app-loading-spinner>

      <div *ngIf="!loading" class="space-y-4">
        <div
          *ngFor="let review of reviews; trackBy: trackById"
          class="bg-[var(--card-bg)] rounded-lg border border-[var(--border-light)] p-6"
        >
          <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 class="text-xl font-semibold text-[var(--primary)]">{{ review.title }}</h2>
              <p class="text-sm text-[var(--text-muted)]">{{ review.bookTitle }} · {{ review.bookAuthor }} · ★ {{ review.rating }}/5</p>
              <p class="text-sm text-[var(--text-dark)] mt-1 line-clamp-2">{{ review.description }}</p>
              <span
                class="mt-2 inline-block text-xs font-semibold px-2 py-0.5 rounded-full"
                [class.bg-green-100]="review.isPublished"
                [class.text-green-700]="review.isPublished"
                [class.bg-yellow-100]="!review.isPublished"
                [class.text-yellow-700]="!review.isPublished"
              >{{ review.isPublished ? 'Publié' : 'Non publié' }}</span>
            </div>
            <div class="flex gap-2 flex-shrink-0">
              <a
                [routerLink]="['/reviews', review.id, 'edit']"
                class="px-4 py-2 bg-[var(--surface-alt)] text-[var(--primary)] rounded font-medium hover:brightness-95 transition inline-block"
                [attr.aria-label]="'Modifier ' + review.title"
              >Modifier</a>
              <button
                type="button"
                (click)="deleteReview(review)"
                class="px-4 py-2 bg-red-600 text-white rounded font-medium hover:bg-red-700 transition"
                [attr.aria-label]="'Supprimer ' + review.title"
              >Supprimer</button>
            </div>
          </div>
        </div>
        <p *ngIf="reviews.length === 0" class="text-center text-[var(--text-muted)] py-8">Aucune critique trouvée.</p>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminReviewsComponent implements OnInit, OnDestroy {
  reviews: Review[] = [];
  loading = true;
  private destroy$ = new Subject<void>();

  constructor(
    private reviewService: ReviewService,
    private notificationService: NotificationService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadReviews();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadReviews(): void {
    this.loading = true;
    this.reviewService
      .getReviews({ limit: 100 })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: ReviewPaginationResponse) => {
          this.reviews = res.data || [];
          this.loading = false;
          this.cdr.markForCheck();
        },
        error: () => {
          this.notificationService.error('Impossible de charger les critiques.');
          this.loading = false;
          this.cdr.markForCheck();
        },
      });
  }

  deleteReview(review: Review): void {
    if (!confirm(`Supprimer la critique "${review.title}" ?`)) return;

    this.reviewService
      .deleteReview(review.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.notificationService.success('Critique supprimée.');
          this.router.navigate(['/admin/reviews']);
          this.loadReviews();
        },
        error: () => {
          this.notificationService.error('Impossible de supprimer la critique.');
        },
      });
  }

  trackById(_index: number, review: Review): string {
    return review.id;
  }
}
