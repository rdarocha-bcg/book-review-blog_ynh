import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ReviewService } from '../../services/review.service';
import { Review } from '../../models/review.model';
import { CardComponent } from '@shared/components/card/card.component';
import { ListPageShellComponent } from '@shared/components/list-page-shell/list-page-shell.component';
import { Subject, takeUntil, BehaviorSubject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { mapErrorToUserMessage } from '@core/utils/http-error.utils';

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
    ListPageShellComponent,
  ],
  template: `
    <div class="page-container">
      <div class="mb-6">
        <h1 class="mb-1 text-3xl font-bold text-[var(--primary)]">Critiques</h1>
      </div>

      <app-list-page-shell
        [loading]="(isLoading$ | async) ?? false"
        [error]="(error$ | async) ?? null"
        errorTitle="Erreur lors du chargement des critiques"
        [isEmpty]="((reviews$ | async)?.length ?? 0) === 0"
        emptyMessage="Aucune critique trouvée. Essayez d'ajuster vos filtres."
        [currentPage]="currentPage"
        [totalPages]="totalPages"
        [total]="totalItems"
        [limit]="pageSize"
        (retryClick)="retryLoadReviews()"
        (pageChange)="onPaginationChange($event)"
      >
        <!-- Filters -->
        <div filters class="grid grid-cols-1 md:grid-cols-5 gap-4">
          <input
            type="text"
            placeholder="Rechercher une critique..."
            [(ngModel)]="searchQuery"
            (ngModelChange)="onSearchQueryInput()"
            class="border border-[var(--border-light)] rounded-xl px-3 py-2 bg-[var(--input-bg)]"
            aria-label="Rechercher une critique"
          />
          <select
            [(ngModel)]="selectedGenre"
            (change)="onFilterChange()"
            class="border border-[var(--border-light)] rounded-xl px-3 py-2 bg-[var(--input-bg)]"
            aria-label="Filtrer par genre"
          >
            <option value="">Tous les genres</option>
            <option value="fiction">Fiction</option>
            <option value="non-fiction">Non-fiction</option>
            <option value="mystery">Policier</option>
            <option value="romance">Romance</option>
          </select>
          <select
            [(ngModel)]="selectedRating"
            (change)="onFilterChange()"
            class="border border-[var(--border-light)] rounded-xl px-3 py-2 bg-[var(--input-bg)]"
            aria-label="Filtrer par note"
          >
            <option value="">Toutes les notes</option>
            <option value="5">5 étoiles</option>
            <option value="4">4+ étoiles</option>
            <option value="3">3+ étoiles</option>
          </select>
          <select
            [(ngModel)]="selectedSort"
            (change)="onFilterChange()"
            class="border border-[var(--border-light)] rounded-xl px-3 py-2 bg-[var(--input-bg)]"
            aria-label="Trier les critiques"
          >
            <option value="">Trier par</option>
            <option value="newest">Plus récents</option>
            <option value="oldest">Plus anciens</option>
            <option value="rating-high">Note : décroissante</option>
            <option value="rating-low">Note : croissante</option>
          </select>
          <button
            (click)="resetFilters()"
            class="bg-[var(--input-bg)] text-[var(--primary)] border border-[var(--border-light)] rounded-full px-3 py-2 hover:bg-[var(--surface-alt)]"
          >
            Réinitialiser
          </button>
        </div>

        <!-- Review cards -->
        <app-card
          items
          *ngFor="let review of reviews$ | async; trackBy: trackByReviewId"
          [hoverable]="true"
          class="break-inside-avoid block mb-6"
        >
          <a
            [routerLink]="['\/reviews', review.id]"
            class="group -m-1 block rounded-xl p-1 no-underline outline-none ring-[var(--accent)] transition focus-visible:ring-2"
            [attr.aria-label]="'Ouvrir la critique : ' + review.title"
          >
            <h3 class="text-xl font-semibold mb-2 text-[var(--primary)] group-hover:text-[var(--accent-strong)]">
              {{ review.title }}
            </h3>
            <p class="text-sm text-[var(--text-muted)] mb-3">by {{ review.author }}</p>
            <p class="text-sm mb-2 text-[var(--text-dark)]">
              <strong class="text-[var(--primary)]">Livre :</strong> {{ review.bookTitle }} par {{ review.bookAuthor }}
            </p>
            <p class="text-sm mb-2 text-[var(--text-dark)]">
              <strong class="text-[var(--primary)]">Genre :</strong>
              <span class="inline-block px-2 py-1 rounded-full bg-[var(--surface-alt)] text-[var(--accent-strong)]">
                {{ review.genre }}
              </span>
            </p>
            <div class="flex items-center gap-2 mb-3">
              <span class="text-[var(--accent-strong)] font-semibold">★ {{ review.rating }}/5</span>
            </div>
            <p class="text-sm text-[var(--text-dark)] line-clamp-3 mb-3">{{ review.description }}</p>
            <span class="font-semibold text-[var(--accent-strong)] group-hover:text-[var(--primary)]">Lire →</span>
          </a>
        </app-card>
      </app-list-page-shell>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReviewListComponent implements OnInit, OnDestroy {
  reviews$ = this.reviewService.getReviews$();
  isLoading$ = this.reviewService.getLoading$();
  error$ = new BehaviorSubject<string | null>(null);

  searchQuery = '';
  selectedGenre = '';
  selectedRating = '';
  selectedSort: '' | 'newest' | 'oldest' | 'rating-high' | 'rating-low' = '';

  currentPage = 1;
  pageSize = 10;
  totalItems = 0;
  totalPages = 0;

  private destroy$ = new Subject<void>();
  /** Emits when the search field changes; loads are debounced to limit API calls */
  private searchInput$ = new Subject<void>();

  constructor(
    private reviewService: ReviewService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    // URL query params are the source of truth: read on every navigation change and load.
    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        this.searchQuery = params['search'] || '';
        this.selectedGenre = params['genre'] || '';
        this.selectedRating = params['rating'] || '';
        this.selectedSort = (params['sort'] as typeof this.selectedSort) || '';
        this.currentPage = params['page'] ? parseInt(params['page'], 10) : 1;
        this.loadReviews();
        this.cdr.markForCheck();
      });

    // Debounced search: update URL after the user stops typing; queryParams will trigger the load.
    this.searchInput$
      .pipe(debounceTime(350), takeUntil(this.destroy$))
      .subscribe(() => {
        this.currentPage = 1;
        this.syncUrlParams();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadReviews(): void {
    this.error$.next(null);
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
        error: (err) => {
          this.error$.next(mapErrorToUserMessage(err));
        },
      });
  }

  retryLoadReviews(): void {
    this.loadReviews();
  }

  onPaginationChange(event: { page: number; limit: number }): void {
    this.currentPage = event.page;
    this.pageSize = event.limit;
    this.syncUrlParams();
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.syncUrlParams();
  }

  onSearchQueryInput(): void {
    this.searchInput$.next();
  }

  resetFilters(): void {
    this.searchQuery = '';
    this.selectedGenre = '';
    this.selectedRating = '';
    this.selectedSort = '';
    this.currentPage = 1;
    this.syncUrlParams();
  }

  /** Reflect current filter/page state in the URL; the queryParams subscription triggers the load. */
  private syncUrlParams(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        search: this.searchQuery || null,
        genre: this.selectedGenre || null,
        rating: this.selectedRating || null,
        sort: this.selectedSort || null,
        page: this.currentPage > 1 ? this.currentPage : null,
      },
      queryParamsHandling: 'merge',
    });
  }

  trackByReviewId(index: number, review: Review): string {
    return review.id;
  }

}

