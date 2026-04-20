import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AcademicService } from '../../services/academic.service';
import { AcademicWork } from '../../models/academic.model';
import { CardComponent } from '@shared/components/card/card.component';
import { ReviewCardSkeletonComponent } from '@shared/components/review-card-skeleton/review-card-skeleton.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { PaginationComponent } from '@shared/components/pagination/pagination.component';
import { Subject, takeUntil } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

/**
 * Academic List Component
 * Displays list of academic works with pagination and filters
 */
@Component({
  selector: 'app-academic-list',
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
    <div class=\"page-container\">
      <div class=\"mb-6\">
        <h1 class=\"mb-1 text-3xl font-bold text-[var(--primary)]\">Travaux Académiques</h1>
      </div>

      <div class=\"mb-6 pinterest-panel p-4 md:p-5\">
        <h2 class=\"mb-3 text-lg font-semibold text-[var(--primary)]\">Search & filters</h2>
        <div class=\"grid grid-cols-1 md:grid-cols-4 gap-4\">
          <input
            type=\"text\"
            placeholder=\"Search academic works...\"
            [(ngModel)]=\"searchQuery\"
            (ngModelChange)=\"onSearchQueryInput()\"
            class=\"border border-[var(--border-light)] rounded-xl px-3 py-2 bg-white\"
            aria-label=\"Search academic works\"
          />
          <select
            [(ngModel)]=\"selectedTheme\"
            (change)=\"onFilterChange()\"
            class=\"border border-[var(--border-light)] rounded-xl px-3 py-2 bg-white\"
            aria-label=\"Filter by theme\"
          >
            <option value=\"\">All Themes</option>
            <option value=\"literature\">Literature</option>
            <option value=\"philosophy\">Philosophy</option>
            <option value=\"history\">History</option>
            <option value=\"linguistics\">Linguistics</option>
          </select>
          <select
            [(ngModel)]=\"selectedSort\"
            (change)=\"onFilterChange()\"
            class=\"border border-[var(--border-light)] rounded-xl px-3 py-2 bg-white\"
            aria-label=\"Sort academic works\"
          >
            <option value=\"\">Sort by</option>
            <option value=\"newest\">Newest first</option>
            <option value=\"oldest\">Oldest first</option>
          </select>
          <button
            (click)=\"resetFilters()\"
            class=\"bg-white text-[var(--primary)] border border-[var(--border-light)] rounded-full px-3 py-2 hover:bg-[var(--surface-alt)]\"
          >
            Reset
          </button>
        </div>
      </div>

      <div [attr.aria-busy]=\"(isLoading$ | async) === true\" aria-live=\"polite\">
        <!-- Loading placeholders -->
        <div
          *ngIf=\"isLoading$ | async\"
          class=\"columns-1 md:columns-2 xl:columns-3 gap-6 space-y-6\"
        >
          <app-review-card-skeleton
            *ngFor=\"let s of skeletonSlots; trackBy: trackBySkeletonSlot\"
          ></app-review-card-skeleton>
        </div>

        <!-- Academics List -->
        <div
          *ngIf=\"(isLoading$ | async) === false\"
          class=\"columns-1 md:columns-2 xl:columns-3 gap-6 space-y-6\"
        >
          <app-card
            *ngFor=\"let academic of academics$ | async; trackBy: trackByAcademicId\"
            [hoverable]=\"true\"
            class=\"break-inside-avoid block mb-6\"
          >
            <a
              [routerLink]=\"['/academics', academic.id]\"
              class=\"group -m-1 block rounded-xl p-1 no-underline outline-none ring-[var(--accent)] transition focus-visible:ring-2\"
              [attr.aria-label]=\"'Open academic work: ' + academic.title\"
            >
              <h3 class=\"text-xl font-semibold mb-2 text-[var(--primary)] group-hover:text-[var(--accent-strong)]\">
                {{ academic.title }}
              </h3>
              <p class=\"text-sm text-[var(--text-muted)] mb-3\">{{ academic.workType }} ({{ academic.year }})</p>
              <p class=\"text-sm mb-2 text-[var(--text-dark)]\">
                <strong class=\"text-[var(--primary)]\">Theme:</strong>
                <span class=\"inline-block px-2 py-1 rounded-full bg-[var(--surface-alt)] text-[var(--accent-strong)]\">
                  {{ academic.theme }}
                </span>
              </p>
              <p class=\"text-sm text-[var(--text-dark)] line-clamp-3 mb-3\">{{ academic.summary }}</p>
              <span class=\"font-semibold text-[var(--accent-strong)] group-hover:text-[var(--primary)]\">Open →</span>
            </a>
          </app-card>
        </div>
      </div>

      <!-- No Results -->
      <div *ngIf=\"(academics$ | async)?.length === 0 && (isLoading$ | async) === false\" class=\"text-center py-12\">
        <p class=\"text-xl text-[var(--text-muted)]\">No academic works found. Try adjusting your filters.</p>
      </div>

      <!-- Pagination -->
      <app-pagination
        *ngIf=\"(isLoading$ | async) === false && totalItems > 0\"
        [currentPage]=\"currentPage\"
        [totalPages]=\"totalPages\"
        [total]=\"totalItems\"
        [limit]=\"pageSize\"
        (pageChange)=\"onPaginationChange($event)\"
      ></app-pagination>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AcademicListComponent implements OnInit, OnDestroy {
  /** Shown while any academic list request is in flight */
  readonly skeletonSlots = [0, 1, 2, 3, 4, 5] as const;

  academics$ = this.academicService.getAcademics$();
  isLoading$ = this.academicService.getLoading$();

  searchQuery = '';
  selectedTheme = '';
  selectedSort: '' | 'newest' | 'oldest' = '';

  currentPage = 1;
  pageSize = 10;
  totalItems = 0;
  totalPages = 0;

  private destroy$ = new Subject<void>();
  /** Emits when the search field changes; loads are debounced */
  private searchInput$ = new Subject<void>();

  constructor(private academicService: AcademicService) {}

  ngOnInit(): void {
    this.searchInput$
      .pipe(debounceTime(350), takeUntil(this.destroy$))
      .subscribe(() => {
        this.currentPage = 1;
        this.loadAcademics();
      });
    this.loadAcademics();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadAcademics(): void {
    const filters = {
      search: this.searchQuery || undefined,
      theme: this.selectedTheme || undefined,
      sort: this.selectedSort || undefined,
      page: this.currentPage,
      limit: this.pageSize,
    };

    this.academicService.getAcademics(filters)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.totalItems = res.total;
          this.totalPages = res.totalPages || Math.ceil(res.total / this.pageSize) || 1;
        },
        error: (error) => console.error('Error loading academics:', error),
      });
  }

  onPaginationChange(event: { page: number; limit: number }): void {
    this.currentPage = event.page;
    this.pageSize = event.limit;
    this.loadAcademics();
  }

  onFilterChange(): void {
    this.loadAcademics();
  }

  onSearchQueryInput(): void {
    this.searchInput$.next();
  }

  resetFilters(): void {
    this.searchQuery = '';
    this.selectedTheme = '';
    this.selectedSort = '';
    this.currentPage = 1;
    this.loadAcademics();
  }

  trackByAcademicId(index: number, academic: AcademicWork): string {
    return academic.id;
  }

  trackBySkeletonSlot(index: number, slot: number): number {
    return slot;
  }
}
