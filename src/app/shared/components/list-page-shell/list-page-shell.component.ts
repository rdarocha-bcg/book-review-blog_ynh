import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReviewCardSkeletonComponent } from '@shared/components/review-card-skeleton/review-card-skeleton.component';
import { PaginationComponent } from '@shared/components/pagination/pagination.component';

/**
 * ListPageShellComponent
 *
 * Shared layout shell for paginated list pages (reviews, academics).
 * Handles the repeated concerns via content projection:
 * - Loading skeleton placeholders
 * - Error banner with retry
 * - Empty-state message
 * - Pagination footer
 *
 * Usage:
 * ```html
 * <app-list-page-shell [loading]="..." [error]="..." [isEmpty]="..." ...>
 *   <div filters class="grid ..."><!-- filter controls --></div>
 *   <ng-container items><!-- *ngFor card list --></ng-container>
 * </app-list-page-shell>
 * ```
 */
@Component({
  selector: 'app-list-page-shell',
  standalone: true,
  imports: [CommonModule, ReviewCardSkeletonComponent, PaginationComponent],
  template: `
    <!-- Filters panel -->
    <div class="mb-6 pinterest-panel p-4 md:p-5">
      <h2 class="mb-3 text-lg font-semibold text-[var(--primary)]">Recherche &amp; filtres</h2>
      <ng-content select="[filters]"></ng-content>
    </div>

    <!-- Error banner -->
    <div
      *ngIf="error"
      class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6"
      role="alert"
    >
      <p class="font-bold mb-2">{{ errorTitle }}</p>
      <p class="text-sm mb-3">{{ error }}</p>
      <button
        (click)="retryClick.emit()"
        class="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
      >
        Réessayer
      </button>
    </div>

    <!-- Loading / items area -->
    <div [attr.aria-busy]="loading" aria-live="polite">
      <!-- Skeleton placeholders -->
      <div
        *ngIf="loading"
        class="columns-1 md:columns-2 xl:columns-3 gap-6 space-y-6"
        aria-hidden="true"
      >
        <app-review-card-skeleton
          *ngFor="let s of skeletonSlots; trackBy: trackByIndex"
        ></app-review-card-skeleton>
      </div>

      <!-- Projected item cards -->
      <div
        *ngIf="!loading && !error"
        class="columns-1 md:columns-2 xl:columns-3 gap-6 space-y-6"
      >
        <ng-content select="[items]"></ng-content>
      </div>
    </div>

    <!-- Empty state -->
    <div
      *ngIf="isEmpty && !loading && !error"
      class="text-center py-12"
    >
      <p class="text-xl text-[var(--text-muted)]">{{ emptyMessage }}</p>
    </div>

    <!-- Pagination -->
    <app-pagination
      *ngIf="!loading && total > 0"
      [currentPage]="currentPage"
      [totalPages]="totalPages"
      [total]="total"
      [limit]="limit"
      (pageChange)="pageChange.emit($event)"
    ></app-pagination>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListPageShellComponent {
  /** True while data is being fetched. Shows skeleton placeholders. */
  @Input() loading = false;

  /** Error message to display in the error banner. Null = no error. */
  @Input() error: string | null = null;

  /** Title line for the error banner. */
  @Input() errorTitle = 'Erreur lors du chargement';

  /** True when the loaded data set is empty (after loading, no error). */
  @Input() isEmpty = false;

  /** Text shown in the empty state. */
  @Input() emptyMessage = 'Aucun résultat. Essayez d\'ajuster vos filtres.';

  /** Pagination inputs */
  @Input() currentPage = 1;
  @Input() totalPages = 0;
  @Input() total = 0;
  @Input() limit = 10;

  /** Emitted when the user clicks the retry button in the error banner. */
  @Output() retryClick = new EventEmitter<void>();

  /** Emitted when the user changes page. Passes PaginationComponent's event. */
  @Output() pageChange = new EventEmitter<{ page: number; limit: number }>();

  readonly skeletonSlots = [0, 1, 2, 3, 4, 5];

  trackByIndex(index: number): number {
    return index;
  }
}
