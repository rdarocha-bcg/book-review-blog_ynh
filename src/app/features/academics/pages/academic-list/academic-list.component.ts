import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AcademicService } from '../../services/academic.service';
import { AcademicWork } from '../../models/academic.model';
import { CardComponent } from '@shared/components/card/card.component';
import { ReviewCardSkeletonComponent } from '@shared/components/review-card-skeleton/review-card-skeleton.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { PaginationComponent } from '@shared/components/pagination/pagination.component';
import { Subject, takeUntil, BehaviorSubject } from 'rxjs';
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
        <h2 class=\"mb-3 text-lg font-semibold text-[var(--primary)]\">Recherche &amp; filtres</h2>
        <div class=\"grid grid-cols-1 md:grid-cols-4 gap-4\">
          <input
            type=\"text\"
            placeholder=\"Rechercher un travail académique...\"
            [(ngModel)]=\"searchQuery\"
            (ngModelChange)=\"onSearchQueryInput()\"
            class=\"border border-[var(--border-light)] rounded-xl px-3 py-2 bg-white\"
            aria-label=\"Rechercher un travail académique\"
          />
          <select
            [(ngModel)]=\"selectedTheme\"
            (change)=\"onFilterChange()\"
            class=\"border border-[var(--border-light)] rounded-xl px-3 py-2 bg-white\"
            aria-label=\"Filtrer par thème\"
          >
            <option value=\"\">Tous les thèmes</option>
            <option value=\"literature\">Littérature</option>
            <option value=\"philosophy\">Philosophie</option>
            <option value=\"history\">Histoire</option>
            <option value=\"linguistics\">Linguistique</option>
          </select>
          <select
            [(ngModel)]=\"selectedSort\"
            (change)=\"onFilterChange()\"
            class=\"border border-[var(--border-light)] rounded-xl px-3 py-2 bg-white\"
            aria-label=\"Trier les travaux académiques\"
          >
            <option value=\"\">Trier par</option>
            <option value=\"newest\">Plus récents</option>
            <option value=\"oldest\">Plus anciens</option>
          </select>
          <button
            (click)=\"resetFilters()\"
            class=\"bg-white text-[var(--primary)] border border-[var(--border-light)] rounded-full px-3 py-2 hover:bg-[var(--surface-alt)]\"
          >
            Réinitialiser
          </button>
        </div>
      </div>

      <!-- Error State -->
      <div *ngIf="error$ | async as error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6" role="alert">
        <p class="font-bold mb-2">Erreur lors du chargement des travaux académiques. Veuillez réessayer.</p>
        <p class="text-sm mb-3">{{ error }}</p>
        <button (click)="retryLoadAcademics()" class="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700">
          Réessayer
        </button>
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
              [attr.aria-label]=\"'Ouvrir le travail : ' + academic.title\"
            >
              <h3 class=\"text-xl font-semibold mb-2 text-[var(--primary)] group-hover:text-[var(--accent-strong)]\">
                {{ academic.title }}
              </h3>
              <p class=\"text-sm text-[var(--text-muted)] mb-3\">{{ academic.workType }} ({{ academic.year }})</p>
              <p class=\"text-sm mb-2 text-[var(--text-dark)]\">
                <strong class=\"text-[var(--primary)]\">Thème :</strong>
                <span class=\"inline-block px-2 py-1 rounded-full bg-[var(--surface-alt)] text-[var(--accent-strong)]\">
                  {{ academic.theme }}
                </span>
              </p>
              <p class=\"text-sm text-[var(--text-dark)] line-clamp-3 mb-3\">{{ academic.summary }}</p>
              <span class=\"font-semibold text-[var(--accent-strong)] group-hover:text-[var(--primary)]\">Lire →</span>
            </a>
          </app-card>
        </div>
      </div>

      <!-- No Results -->
      <div *ngIf=\"(academics$ | async)?.length === 0 && (isLoading$ | async) === false\" class=\"text-center py-12\">
        <p class=\"text-xl text-[var(--text-muted)]\">Aucun travail académique trouvé. Essayez d'ajuster vos filtres.</p>
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
  error$ = new BehaviorSubject<string | null>(null);

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

  constructor(
    private academicService: AcademicService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    // URL query params are the source of truth: read on every navigation change and load.
    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        this.searchQuery = params['search'] || '';
        this.selectedTheme = params['theme'] || '';
        this.selectedSort = (params['sort'] as typeof this.selectedSort) || '';
        this.currentPage = params['page'] ? parseInt(params['page'], 10) : 1;
        this.loadAcademics();
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

  loadAcademics(): void {
    this.error$.next(null);
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
        error: (error) => {
          this.error$.next(error?.message || 'Erreur réseau ou serveur indisponible');
        },
      });
  }

  retryLoadAcademics(): void {
    this.loadAcademics();
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
    this.selectedTheme = '';
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
        theme: this.selectedTheme || null,
        sort: this.selectedSort || null,
        page: this.currentPage > 1 ? this.currentPage : null,
      },
      queryParamsHandling: 'replace',
    });
  }

  trackByAcademicId(index: number, academic: AcademicWork): string {
    return academic.id;
  }

  trackBySkeletonSlot(index: number, slot: number): number {
    return slot;
  }
}
