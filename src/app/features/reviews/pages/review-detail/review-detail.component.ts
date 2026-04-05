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
    <div class="container mx-auto px-4 py-8">
      <a routerLink="/" class="text-blue-600 hover:text-blue-800 mb-4 inline-block">← Back to Reviews</a>

      <app-loading-spinner *ngIf="isLoading$ | async"></app-loading-spinner>

      <div *ngIf="review$ | async as review" class="bg-white rounded-lg shadow-lg p-8">
        <div class="mb-6">
          <h1 class="text-4xl font-bold mb-2">{{ review.title }}</h1>
          <p class="text-lg text-gray-600">by {{ review.author }}</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div class="md:col-span-2">
            <div class="mb-6">
              <h2 class="text-2xl font-semibold mb-4">{{ review.bookTitle }}</h2>
              <p class="text-lg text-gray-600 mb-4">Book Author: {{ review.bookAuthor }}</p>
              <div class="flex items-center gap-4 mb-4">
                <span class="text-3xl text-[var(--accent)]">★ {{ review.rating }}/5</span>
                <span class="text-lg bg-blue-100 text-blue-800 px-3 py-1 rounded">{{ review.genre }}</span>
              </div>
            </div>

            <div class="prose max-w-none">
              <p class="text-gray-700 whitespace-pre-wrap">{{ review.content }}</p>
            </div>
          </div>

          <div class="bg-gray-50 p-6 rounded-lg h-fit">
            <div class="mb-6">
              <img
                *ngIf="review.imageUrl"
                [src]="review.imageUrl"
                [alt]="review.bookTitle"
                class="w-full rounded mb-4"
              />
              <div *ngIf="!review.imageUrl" class="w-full h-64 bg-gray-300 rounded mb-4 flex items-center justify-center">
                <span class="text-gray-500">No image available</span>
              </div>
            </div>

            <div class="space-y-3 text-sm">
              <div>
                <span class="font-semibold">Genre:</span>
                <span class="text-gray-600">{{ review.genre }}</span>
              </div>
              <div>
                <span class="font-semibold">Rating:</span>
                <span class="text-[var(--accent)]">{{ review.rating }}/5</span>
              </div>
              <div>
                <span class="font-semibold">Published:</span>
                <span class="text-gray-600">{{ review.publishedAt | date: 'short' }}</span>
              </div>
              <div>
                <span class="font-semibold">Last Updated:</span>
                <span class="text-gray-600">{{ review.updatedAt | date: 'short' }}</span>
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

