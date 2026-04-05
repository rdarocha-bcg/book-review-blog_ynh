import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '@core/services/api.service';
import { ReviewService } from '../../../reviews/services/review.service';
import { NotificationService } from '@core/services/notification.service';
import { LoadingSpinnerComponent } from '@shared/components/loading-spinner/loading-spinner.component';
import { Subject, takeUntil } from 'rxjs';
import { Review } from '../../../reviews/models/review.model';

/**
 * Review Moderation Component
 * Approve, reject, or edit pending reviews.
 */
@Component({
  selector: 'app-review-moderation',
  standalone: true,
  imports: [CommonModule, RouterLink, LoadingSpinnerComponent],
  template: `
    <div class="container mx-auto px-4 py-8">
      <div class="mb-8">
        <a routerLink="/admin" class="text-blue-600 hover:underline mb-2 inline-block">← Back to Dashboard</a>
        <h1 class="text-4xl font-bold">Review Moderation</h1>
        <p class="text-gray-600 mt-1">Approve or reject pending reviews.</p>
      </div>

      <app-loading-spinner *ngIf="loading"></app-loading-spinner>

      <div *ngIf="!loading" class="space-y-4">
        <div
          *ngFor="let review of pendingReviews; trackBy: trackById"
          class="bg-white rounded-lg shadow p-6 border border-slate-200"
        >
          <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 class="text-xl font-semibold">{{ review.title }}</h2>
              <p class="text-sm text-gray-600">{{ review.bookTitle }} by {{ review.bookAuthor }}</p>
              <p class="text-sm text-gray-500 mt-1">by {{ review.author }} · {{ review.genre }} · {{ review.rating }}/5</p>
            </div>
            <div class="flex gap-2 flex-shrink-0">
              <button
                type="button"
                (click)="approve(review)"
                class="px-4 py-2 bg-[var(--secondary)] text-white rounded font-medium hover:brightness-90 transition"
                [attr.aria-label]="'Approve ' + review.title"
              >Approve</button>
              <button
                type="button"
                (click)="reject(review)"
                class="px-4 py-2 bg-red-600 text-white rounded font-medium hover:bg-red-700 transition"
                [attr.aria-label]="'Reject ' + review.title"
              >Reject</button>
              <a
                [routerLink]="['/reviews', review.id, 'edit']"
                class="px-4 py-2 bg-slate-200 text-slate-800 rounded font-medium hover:bg-slate-300 transition inline-block"
              >Edit</a>
            </div>
          </div>
        </div>
        <p *ngIf="pendingReviews.length === 0" class="text-center text-gray-500 py-8">No pending reviews to moderate.</p>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReviewModerationComponent implements OnInit, OnDestroy {
  pendingReviews: Review[] = [];
  loading = true;
  private destroy$ = new Subject<void>();

  constructor(
    private apiService: ApiService,
    private reviewService: ReviewService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadPending();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadPending(): void {
    this.loading = true;
    this.apiService
      .get<Review[]>('admin/reviews/pending')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.pendingReviews = Array.isArray(data) ? data : [];
          this.loading = false;
        },
        error: () => {
          this.reviewService.getReviews({}).pipe(takeUntil(this.destroy$)).subscribe((res) => {
            this.pendingReviews = (res.data || []).filter((r: Review) => !r.isPublished);
            this.loading = false;
          });
        },
      });
  }

  approve(review: Review): void {
    this.apiService
      .patch<Review>(`admin/reviews/${review.id}/approve`, { isPublished: true })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.notificationService.success('Review approved.');
          this.loadPending();
        },
        error: () => {
          this.reviewService.updateReview(review.id, { ...review, isPublished: true })
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: () => {
                this.notificationService.success('Review approved.');
                this.loadPending();
              },
              error: () => this.notificationService.error('Failed to approve.'),
            });
        },
      });
  }

  reject(review: Review): void {
    if (!confirm('Reject this review?')) return;
    this.apiService
      .delete(`admin/reviews/${review.id}`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.notificationService.success('Review rejected.');
          this.loadPending();
        },
        error: () => {
          this.reviewService.deleteReview(review.id).pipe(takeUntil(this.destroy$)).subscribe({
            next: () => {
              this.notificationService.success('Review rejected.');
              this.loadPending();
            },
            error: () => this.notificationService.error('Failed to reject.'),
          });
        },
      });
  }

  trackById(_index: number, review: Review): string {
    return review.id;
  }
}
