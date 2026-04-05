import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ReviewService } from '../../services/review.service';
import { Review } from '../../models/review.model';
import { LoadingSpinnerComponent } from '@shared/components/loading-spinner/loading-spinner.component';
import { CardComponent } from '@shared/components/card/card.component';
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
    LoadingSpinnerComponent,
    CardComponent,
    ButtonComponent,
    PaginationComponent,
  ],
  template: `
    <div class="container mx-auto px-4 py-8">
      <h1 class="text-4xl font-bold mb-8">Book Reviews</h1>

      <!-- Filters -->
      <div class="mb-8 bg-white p-6 rounded-lg shadow">
        <h2 class="text-xl font-semibold mb-4">Filters</h2>
        <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
          <input
            type="text"
            placeholder="Search reviews..."
            [(ngModel)]="searchQuery"
            (change)="onFilterChange()"
            class="border rounded px-3 py-2"
            aria-label="Search reviews"
          />
          <select
            [(ngModel)]="selectedGenre"
            (change)="onFilterChange()"
            class="border rounded px-3 py-2"
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
            class="border rounded px-3 py-2"
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
            class="border rounded px-3 py-2"
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
            class="bg-slate-500 text-white rounded px-3 py-2 hover:bg-slate-600"
          >
            Reset
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <app-loading-spinner *ngIf="isLoading$ | async"></app-loading-spinner>

      <!-- Reviews List -->
      <div
        *ngIf="(isLoading$ | async) === false"
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <app-card
          *ngFor="let review of reviews$ | async; trackBy: trackByReviewId"
          [hoverable]="true"
          (click)="goToReview(review.id)"
        >
          <h3 class="text-lg font-semibold mb-2">{{ review.title }}</h3>
          <p class="text-sm text-gray-600 mb-2">by {{ review.author }}</p>
          <p class="text-sm mb-2">
            <strong>Book:</strong> {{ review.bookTitle }} by {{ review.bookAuthor }}
          </p>
          <p class="text-sm mb-2">
            <strong>Genre:</strong> {{ review.genre }}
          </p>
          <div class="flex items-center gap-2 mb-3">
            <span class="text-[var(--accent)]">★ {{ review.rating }}/5</span>
          </div>
          <p class="text-sm text-gray-700 line-clamp-3 mb-4">{{ review.description }}</p>
          <a
            [routerLink]="['/reviews', review.id]"
            class="text-blue-600 hover:text-blue-800 font-semibold"
          >
            Read Full Review →
          </a>
        </app-card>
      </div>

      <!-- No Results -->
      <div *ngIf="(reviews$ | async)?.length === 0 && (isLoading$ | async) === false" class="text-center py-12">
        <p class="text-xl text-gray-500">No reviews found. Try adjusting your filters.</p>
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

  constructor(
    private reviewService: ReviewService,
    private router: Router
  ) {}

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

  goToReview(id: string | number): void {
    this.router.navigate(['/reviews', id]);
  }

  trackByReviewId(index: number, review: Review): string {
    return review.id;
  }
}

