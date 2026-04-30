import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ReviewService } from '../../services/review.service';
import { Review } from '../../models/review.model';
import { CardComponent } from '@shared/components/card/card.component';
import { ReviewCardSkeletonComponent } from '@shared/components/review-card-skeleton/review-card-skeleton.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { PaginationComponent } from '@shared/components/pagination/pagination.component';
import { Subject, takeUntil, BehaviorSubject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

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
      <div class="mb-6">
        <h1 class="mb-1 text-3xl font-bold text-[var(--primary)]">Critiques</h1>
      </div>

      <div class="mb-6 pinterest-panel p-4 md:p-5">
        <h2 class="mb-3 text-lg font-semibold text-[var(--primary)]">Recherche &amp; filtres</h2>
        <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
          <input
            type="text"
            placeholder="Rechercher une critique..."
            [(ngModel)]="searchQuery"
            (ngModelChange)="onSearchQueryInput()"
            class="border border-[var(--border-light)] rounded-xl px-3 py-2 bg-white"
            aria-label="Rechercher une critique"
          />
          <select
            [(ngModel)]="selectedGenre"
            (change)="onFilterChange()"
            class="border border-[var(--border-light)] rounded-xl px-3 py-2 bg-white"
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
            class="border border-[var(--border-light)] rounded-xl px-3 py-2 bg-white"
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
            class="border border-[var(--border-light)] rounded-xl px-3 py-2 bg-white"
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
            class="bg-white text-[var(--primary)] border border-[var(--border-light)] rounded-full px-3 py-2 hover:bg-[var(--surface-alt)]"
          >
            Réinitialiser
          </button>
        </div>
      </div>

      <!-- Error State -->
      <div *ngIf="error$ | async" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6" role="alert">
        <p class="font-bold mb-2">Erreur lors du chargement des critiques. Veuillez réessayer.</p>
        <button (click)="retryLoadReviews()" class="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700">
          Réessayer
        </button>
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
          *ngIf="(isLoading$ | async) === false && (error$ | async) === null"
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
            [attr.aria-label]="'Ouvrir la critique : ' + review.title"
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
        </div>
      </div>

      <!-- No Results -->
      <div *ngIf="(reviews$ | async)?.length === 0 && (isLoading$ | async) === false && (error$ | async) === null" class="text-center py-12">
        <p class="text-xl text-[var(--text-muted)]">Aucune critique trouvée. Essayez d'ajuster vos filtres.</p>
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
        error: () => {
          this.error$.next('Erreur réseau ou serveur indisponible. Veuillez réessayer.');
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
      queryParamsHandling: 'replace',
    });
  }

  trackByReviewId(index: number, review: Review): string {
    return review.id;
  }

  trackBySkeletonSlot(index: number, slot: number): number {
    return slot;
  }
}

