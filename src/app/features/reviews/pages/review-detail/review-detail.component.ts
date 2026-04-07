import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ReviewService } from '../../services/review.service';
import { LoadingSpinnerComponent } from '@shared/components/loading-spinner/loading-spinner.component';
import { Subject, takeUntil } from 'rxjs';

/**
 * Review Detail Component
 * Displays full review details
 */
@Component({
  selector: 'app-review-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, LoadingSpinnerComponent],
  template: `
    <div class="container mx-auto px-4 py-10">
      <a routerLink="/" class="text-[var(--accent-strong)] hover:text-[var(--primary)] mb-4 inline-block font-semibold">
        ← Back to Reviews
      </a>

      <app-loading-spinner *ngIf="isLoading$ | async"></app-loading-spinner>

      <div *ngIf="review$ | async as review" class="pinterest-panel p-8">
        <div class="mb-6">
          <h1 class="text-4xl font-semibold tracking-tight mb-2 text-[var(--primary)]">{{ review.title }}</h1>
          <p class="text-lg text-[var(--text-muted)]">by {{ review.author }}</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div class="md:col-span-2">
            <div class="mb-6">
              <h2 class="text-2xl font-semibold tracking-tight mb-4 text-[var(--primary)]">{{ review.bookTitle }}</h2>
              <p class="text-lg text-[var(--text-muted)] mb-4">Book Author: {{ review.bookAuthor }}</p>
              <div class="flex items-center gap-4 mb-4">
                <span class="text-3xl text-[var(--accent)]">★ {{ review.rating }}/5</span>
                <span class="text-sm bg-[var(--surface-alt)] text-[var(--accent-strong)] px-4 py-1 rounded-full font-semibold">
                  {{ review.genre }}
                </span>
              </div>
            </div>

            <div class="prose max-w-none">
              <p class="text-[var(--text-dark)] whitespace-pre-wrap">{{ review.content }}</p>
            </div>
          </div>

          <div class="bg-[var(--surface-alt)] border border-[var(--border-light)] p-6 rounded-2xl h-fit">
            <div class="mb-6">
              <img
                *ngIf="review.imageUrl"
                [src]="review.imageUrl"
                [alt]="review.bookTitle"
                class="w-full rounded-2xl mb-4 border border-[var(--border-light)]"
              />
              <div
                *ngIf="!review.imageUrl"
                class="w-full h-64 bg-white rounded-2xl mb-4 flex items-center justify-center border border-[var(--border-light)]"
              >
                <span class="text-[var(--text-muted)]">No image available</span>
              </div>
            </div>

            <div class="space-y-3 text-sm">
              <div>
                <span class="font-semibold">Genre:</span>
                <span class="text-[var(--text-muted)]">{{ review.genre }}</span>
              </div>
              <div>
                <span class="font-semibold">Rating:</span>
                <span class="text-[var(--accent)]">{{ review.rating }}/5</span>
              </div>
              <div>
                <span class="font-semibold">Published:</span>
                <span class="text-[var(--text-muted)]">{{ review.publishedAt | date: 'short' }}</span>
              </div>
              <div>
                <span class="font-semibold">Last Updated:</span>
                <span class="text-[var(--text-muted)]">{{ review.updatedAt | date: 'short' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReviewDetailComponent implements OnInit, OnDestroy {
  review$ = this.reviewService.getSelectedReview$();
  isLoading$ = this.reviewService.getLoading$();

  private destroy$ = new Subject<void>();

  constructor(
    private reviewService: ReviewService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      const id = params['id'];
      if (id) {
        this.reviewService.getReviewById(id)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            error: (error) => console.error('Error loading review:', error),
          });
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

