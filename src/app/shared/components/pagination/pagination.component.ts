import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface PaginationEvent {
  page: number;
  limit: number;
}

/**
 * Pagination Component
 * Reusable pagination controls
 */
@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-col sm:flex-row items-center justify-between gap-4 py-6">
      <!-- Info -->
      <div class="text-sm text-gray-600">
        Showing
        <span class="font-semibold">{{ startIndex + 1 }}</span>
        to
        <span class="font-semibold">{{ endIndex }}</span>
        of
        <span class="font-semibold">{{ total }}</span>
        items
      </div>

      <!-- Controls -->
      <div class="flex items-center gap-2">
        <!-- Previous Button -->
        <button
          (click)="onPrevious()"
          [disabled]="currentPage === 1"
          class="px-3 py-2 rounded border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
          aria-label="Previous page"
        >
          ← Previous
        </button>

        <!-- Page Numbers -->
        <div class="hidden sm:flex items-center gap-1">
          <button
            *ngFor="let pageNum of pageNumbers"
            (click)="onPageChange(pageNum)"
            [class.active]="pageNum === currentPage"
            class="px-3 py-2 rounded border border-gray-300 transition"
            [class.bg-yellow-400]="pageNum === currentPage"
            [class.hover:bg-gray-100]="pageNum !== currentPage"
            [attr.aria-label]="'Go to page ' + pageNum"
          >
            {{ pageNum }}
          </button>
        </div>

        <!-- Page Info (Mobile) -->
        <div class="sm:hidden text-sm font-semibold">
          Page {{ currentPage }} of {{ totalPages }}
        </div>

        <!-- Next Button -->
        <button
          (click)="onNext()"
          [disabled]="currentPage === totalPages"
          class="px-3 py-2 rounded border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
          aria-label="Next page"
        >
          Next →
        </button>
      </div>

      <!-- Items Per Page -->
      <div class="flex items-center gap-2">
        <label for="itemsPerPage" class="text-sm">Items per page:</label>
        <select
          id="itemsPerPage"
          [value]="limit"
          (change)="onLimitChange($event)"
          class="border rounded px-2 py-1"
          aria-label="Items per page"
        >
          <option value="5">5</option>
          <option value="10">10</option>
          <option value="20">20</option>
          <option value="50">50</option>
        </select>
      </div>
    </div>
  `,
  styles: [`
    .active {
      @apply font-semibold;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaginationComponent {
  @Input() currentPage: number = 1;
  @Input() totalPages: number = 1;
  @Input() total: number = 0;
  @Input() limit: number = 10;

  @Output() pageChange = new EventEmitter<PaginationEvent>();

  get startIndex(): number {
    return (this.currentPage - 1) * this.limit + 1;
  }

  get endIndex(): number {
    return Math.min(this.currentPage * this.limit, this.total);
  }

  get pageNumbers(): number[] {
    const pages: number[] = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(1, this.currentPage - Math.floor(maxPagesToShow / 2));
    const endPage = Math.min(this.totalPages, startPage + maxPagesToShow - 1);

    // Adjust start page if we're near the end
    if (endPage - startPage < maxPagesToShow - 1) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  }

  onPrevious(): void {
    if (this.currentPage > 1) {
      this.pageChange.emit({
        page: this.currentPage - 1,
        limit: this.limit,
      });
    }
  }

  onNext(): void {
    if (this.currentPage < this.totalPages) {
      this.pageChange.emit({
        page: this.currentPage + 1,
        limit: this.limit,
      });
    }
  }

  onPageChange(page: number): void {
    if (page !== this.currentPage && page > 0 && page <= this.totalPages) {
      this.pageChange.emit({
        page,
        limit: this.limit,
      });
    }
  }

  onLimitChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const newLimit = parseInt(target.value, 10);

    this.pageChange.emit({
      page: 1, // Reset to first page
      limit: newLimit,
    });
  }
}
