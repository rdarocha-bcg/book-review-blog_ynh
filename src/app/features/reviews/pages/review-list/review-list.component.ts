import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ReviewService } from '../../services/review.service';
import { Review } from '../../models/review.model';
import { CardComponent } from '@shared/components/card/card.component';
import { ReviewCardSkeletonComponent } from '@shared/components/review-card-skeleton/review-card-skeleton.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { PaginationComponent } from '@shared/components/pagination/pagination.component';
import { Subject, takeUntil } from 'rxjs';

/**
 * Review List Component
 * Displays list of book reviews with pagination and filters
 */
@Component({
  selector: 'app-review-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    CardComponent,
    ReviewCardSkeletonComponent,
    ButtonComponent,
    PaginationComponent,
  ],
  template: `
    <div class="page-container">
      <div class="mb-8">
        <h1 class="text-4xl font-bold mb-2 text-[var(--primary)] luxe-title">Book Reviews</h1>
        <p class="text-[var(--text-muted)]">
          Explore stylish, curated reviews in a clean Pinterest-inspired layout.
        </p>
      </div>

      <!-- Filters -->
      <div class="mb-8 pinterest-panel p-6">
        <h2 class="text-xl font-semibold mb-4 text-[var(--primary)] luxe-title">Filters</h2>
        <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
          <input
            type="text"
            placeholder="Search reviews..."
            [(ngModel)]="searchQuery"
            (change)="onFilterChange()"
            class="border border-[var(--border-light)] rounded-xl px-3 py-2 bg-white"
            aria-label="Search reviews"
          />
          <select
            [(ngModel)]="selectedGenre"
            (change)="onFilterChange()"
            class="border border-[var(--border-light)] rounded-xl px-3 py-2 bg-white"
            aria-label="Filter by genre"
          >
            <option value="">All Genres</option>
            <option value="fiction">Fiction</option>
            <option value="non-fiction">Non-Fiction</option>
            <option value="mystery">Mystery</option>
            <option value="romance">Romance</option>
          </select>
          <select
            [(ngModel)]="selectedRating"
            (change)="onFilterChange()"
            class="border border-[var(--border-light)] rounded-xl px-3 py-2 bg-white"
            aria-label="Filter by rating"
          >
            <option value="">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4+ Stars</option>
            <option value="3">3+ Stars</option>
          </select>
          <select
            [(ngModel)]="selectedSort"
            (change)="onFilterChange()"
            class="border border-[var(--border-light)] rounded-xl px-3 py-2 bg-white"
            aria-label="Sort reviews"
          >
            <option value="">Sort by</option>
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="rating-high">Rating: high to low</option>
            <option value="rating-low">Rating: low to high</option>
          </select>
          <button
            (click)="resetFilters()"
            class="bg-white text-[var(--primary)] border border-[var(--border-light)] rounded-full px-3 py-2 hover:bg-[var(--surface-alt)]"
          >
            Reset
          </button>
        </div>
      </div>

      <div [attr.aria-busy]="(isLoading$ | async) === true" aria-live="polite">
        <!-- Loading placeholders (filters/pagination stay usable) -->
        <div
          *ngIf="isLoading$ | async"
          class="columns-1 md:columns-2 xl:columns-3 gap-6 space-y-6"
        >
          <app-review-card-skeleton
            *ngFor="let s of skeletonSlots; trackBy: trackBySkeletonSlot"
          ></app-review-card-skeleton>
        </div>

        <!-- Reviews List -->
        <div
          *ngIf="(isLoading$ | async) === false"
          class="columns-1 md:columns-2 xl:columns-3 gap-6 space-y-6"
        >
        <app-card
          *ngFor="let review of reviews$ | async; trackBy: trackByReviewId"
          [hoverable]="true"
          class="break-inside-avoid block mb-6"
        >
          <!-- Single block link (option A): one focus target per card, no nested links -->
          <a
            [routerLink]="['/reviews', review.id]"
            class="group -m-1 block rounded-xl p-1 no-underline outline-none ring-[var(--accent)] transition focus-visible:ring-2"
            [attr.aria-label]="'Open review: ' + review.title"
          >
            <h3 class="text-xl font-semibold mb-2 text-[var(--primary)] group-hover:text-[var(--accent-strong)]">
              {{ review.title }}
            </h3>
            <p class="text-sm text-[var(--text-muted)] mb-3">by {{ review.author }}</p>
            <p class="text-sm mb-2 text-[var(--text-dark)]">
              <strong class="text-[var(--primary)]">Book:</strong> {{ review.bookTitle }} by {{ review.bookAuthor }}
            </p>
            <p class="text-sm mb-2 text-[var(--text-dark)]">
              <strong class="text-[var(--primary)]">Genre:</strong>
              <span class="inline-block px-2 py-1 rounded-full bg-[var(--surface-alt)] text-[var(--accent-strong)]">
                {{ review.genre }}
              </span>
            </p>
            <div class="flex items-center gap-2 mb-3">
              <span class="text-[var(--accent-strong)] font-semibold">★ {{ review.rating }}/5</span>
            </div>
            <p class="text-sm text-[var(--text-dark)] line-clamp-3 mb-3">{{ review.description }}</p>
            <span class="font-semibold text-[var(--accent-strong)] group-hover:text-[var(--primary)]">
              Read full review →
            </span>
          </a>
        </app-card>
        </div>
      </div>

      <!-- No Results -->
      <div *ngIf="(reviews$ | async)?.length === 0 && (isLoading$ | async) === false" class="text-center py-12">
        <p class="text-xl text-[var(--text-muted)]">No reviews found. Try adjusting your filters.</p>
      </div>

      <!-- Pagination -->
      <app-pagination
        *ngIf="(isLoading$ | async) === false && totalItems > 0"
        [currentPage]="currentPage"
        [totalPages]="totalPages"
        [total]="totalItems"
        [limit]="pageSize"
        (pageChange)="onPaginationChange($event)"
      ></app-pagination>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReviewListComponent implements OnInit, OnDestroy {
  /** Shown while any review list request is in flight (initial load, filters, pagination) */
  readonly skeletonSlots = [0, 1, 2, 3, 4, 5] as const;

  reviews$ = this.reviewService.getReviews$();
  isLoading$ = this.reviewService.getLoading$();

  searchQuery = '';
  selectedGenre = '';
  selectedRating = '';
  selectedSort: '' | 'newest' | 'oldest' | 'rating-high' | 'rating-low' = '';

  currentPage = 1;
  pageSize = 10;
  totalItems = 0;
  totalPages = 0;

  private destroy$ = new Subject<void>();

  constructor(private reviewService: ReviewService) {}

  ngOnInit(): void {
    this.loadReviews();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadReviews(): void {
    const filters = {
      search: this.searchQuery || undefined,
      genre: this.selectedGenre || undefined,
      rating: this.selectedRating ? parseInt(this.selectedRating, 10) : undefined,
      sort: this.selectedSort || undefined,
      page: this.currentPage,
      limit: this.pageSize,
    };

    this.reviewService.getReviews(filters)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.totalItems = res.total;
          this.totalPages = res.totalPages || Math.ceil(res.total / this.pageSize) || 1;
        },
        error: (error) => console.error('Error loading reviews:', error),
      });
  }

  onPaginationChange(event: { page: number; limit: number }): void {
    this.currentPage = event.page;
    this.pageSize = event.limit;
    this.loadReviews();
  }

  onFilterChange(): void {
    this.loadReviews();
  }

  resetFilters(): void {
    this.searchQuery = '';
    this.selectedGenre = '';
    this.selectedRating = '';
    this.selectedSort = '';
    this.currentPage = 1;
    this.loadReviews();
  }

  trackByReviewId(index: number, review: Review): string {
    return review.id;
  }

  trackBySkeletonSlot(index: number, slot: number): number {
    return slot;
  }
}

