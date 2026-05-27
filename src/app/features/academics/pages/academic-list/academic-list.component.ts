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
import { AcademicService } from '../../services/academic.service';
import { AcademicWork } from '../../models/academic.model';
import { CardComponent } from '@shared/components/card/card.component';
import { ListPageShellComponent } from '@shared/components/list-page-shell/list-page-shell.component';
import { Subject, takeUntil, BehaviorSubject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { mapErrorToUserMessage } from '@core/utils/http-error.utils';

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
    ListPageShellComponent,
  ],
  template: `
    <div class="page-container">
      <div class="mb-6">
        <h1 class="mb-1 text-3xl font-bold text-[var(--primary)]">Travaux Académiques</h1>
      </div>

      <app-list-page-shell
        [loading]="(isLoading$ | async) ?? false"
        [error]="(error$ | async) ?? null"
        errorTitle="Erreur lors du chargement des travaux académiques"
        [isEmpty]="((academics$ | async)?.length ?? 0) === 0"
        emptyMessage="Aucun travail académique trouvé. Essayez d'ajuster vos filtres."
        [currentPage]="currentPage"
        [totalPages]="totalPages"
        [total]="totalItems"
        [limit]="pageSize"
        (retryClick)="retryLoadAcademics()"
        (pageChange)="onPaginationChange($event)"
      >
        <!-- Filters -->
        <div filters class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Rechercher un travail académique..."
            [(ngModel)]="searchQuery"
            (ngModelChange)="onSearchQueryInput()"
            class="border border-[var(--border-light)] rounded-xl px-3 py-2 bg-[var(--input-bg)]"
            aria-label="Rechercher un travail académique"
          />
          <select
            [(ngModel)]="selectedTheme"
            (change)="onFilterChange()"
            class="border border-[var(--border-light)] rounded-xl px-3 py-2 bg-[var(--input-bg)]"
            aria-label="Filtrer par thème"
          >
            <option value="">Tous les thèmes</option>
            <option value="literature">Littérature</option>
            <option value="philosophy">Philosophie</option>
            <option value="history">Histoire</option>
            <option value="linguistics">Linguistique</option>
          </select>
          <select
            [(ngModel)]="selectedSort"
            (change)="onFilterChange()"
            class="border border-[var(--border-light)] rounded-xl px-3 py-2 bg-[var(--input-bg)]"
            aria-label="Trier les travaux académiques"
          >
            <option value="">Trier par</option>
            <option value="newest">Plus récents</option>
            <option value="oldest">Plus anciens</option>
          </select>
          <button
            (click)="resetFilters()"
            class="bg-[var(--input-bg)] text-[var(--primary)] border border-[var(--border-light)] rounded-full px-3 py-2 hover:bg-[var(--surface-alt)]"
          >
            Réinitialiser
          </button>
        </div>

        <!-- Academic cards -->
        <app-card
          items
          *ngFor="let academic of academics$ | async; trackBy: trackByAcademicId"
          [hoverable]="true"
          class="break-inside-avoid block mb-6"
        >
          <a
            [routerLink]="['\/academics', academic.id]"
            class="group -m-1 block rounded-xl p-1 no-underline outline-none ring-[var(--accent)] transition focus-visible:ring-2"
            [attr.aria-label]="'Ouvrir le travail : ' + academic.title"
          >
            <h3 class="text-xl font-semibold mb-2 text-[var(--primary)] group-hover:text-[var(--accent-strong)]">
              {{ academic.title }}
            </h3>
            <p class="text-sm text-[var(--text-muted)] mb-3">{{ academic.workType }} ({{ academic.year }})</p>
            <p class="text-sm mb-2 text-[var(--text-dark)]">
              <strong class="text-[var(--primary)]">Thème :</strong>
              <span class="inline-block px-2 py-1 rounded-full bg-[var(--surface-alt)] text-[var(--accent-strong)]">
                {{ academic.theme }}
              </span>
            </p>
            <p class="text-sm text-[var(--text-dark)] line-clamp-3 mb-3">{{ academic.summary }}</p>
            <span class="font-semibold text-[var(--accent-strong)] group-hover:text-[var(--primary)]">Lire →</span>
          </a>
        </app-card>
      </app-list-page-shell>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AcademicListComponent implements OnInit, OnDestroy {
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
    private cdr: ChangeDetectorRef,
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
          this.error$.next(mapErrorToUserMessage(error));
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
      queryParamsHandling: 'merge',
    });
  }

  trackByAcademicId(index: number, academic: AcademicWork): string {
    return academic.id;
  }

}
