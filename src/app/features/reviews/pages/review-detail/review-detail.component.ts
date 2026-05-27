import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MarkdownComponent } from 'ngx-markdown';
import { ReviewService } from '../../services/review.service';
import { Review } from '../../models/review.model';
import { LoadingSpinnerComponent } from '@shared/components/loading-spinner/loading-spinner.component';
import {
  BreadcrumbComponent,
  BreadcrumbItem,
} from '@shared/components/breadcrumb/breadcrumb.component';
import { AuthService } from '@core/services/auth.service';
import { Subject, takeUntil } from 'rxjs';

/**
 * Review Detail Component
 * Displays full review details
 */
@Component({
  selector: 'app-review-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, LoadingSpinnerComponent, MarkdownComponent, BreadcrumbComponent],
  template: `
    <div class="page-container">
      <app-breadcrumb [items]="reviewDetailBreadcrumbs()" />
      <a
        routerLink="/reviews"
        class="text-[var(--accent-strong)] hover:text-[var(--primary)] mb-4 inline-flex items-center gap-1 font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-strong)]"
      >
        ← Retour aux critiques
      </a>

      <app-loading-spinner *ngIf="isLoading"></app-loading-spinner>

      <!-- Message erreur : ressource introuvable -->
      <div
        *ngIf="!isLoading && notFound"
        class="pinterest-panel p-8 text-center"
        role="alert"
        aria-live="polite"
      >
        <p class="text-5xl mb-4" aria-hidden="true">📚</p>
        <h1 class="text-2xl font-semibold text-[var(--primary)] mb-3">Cette critique n'existe pas</h1>
        <p class="text-[var(--text-muted)] mb-6">L'identifiant demandé ne correspond à aucune critique enregistrée.</p>
        <a
          routerLink="/reviews"
          class="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[var(--accent-strong)] text-white font-semibold hover:brightness-95 transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-strong)]"
        >
          ← Retour aux critiques
        </a>
      </div>

      <div *ngIf="!isLoading && review" class="pinterest-panel p-8">
        <div class="mb-6">
          <div class="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 class="text-4xl font-semibold tracking-tight mb-2 text-[var(--primary)]">{{ review!.title }}</h1>
              <p class="text-lg text-[var(--text-muted)]">par {{ review!.author }}</p>
            </div>
            @if (auth.isAdmin()) {
              <a
                [routerLink]="['/reviews', review!.id, 'edit']"
                class="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[var(--accent-strong)] text-white font-semibold hover:brightness-95 transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-strong)]"
              >
                <span aria-hidden="true">✏️</span> Modifier
              </a>
            }
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div class="md:col-span-2">
            <div class="mb-6">
              <h2 class="text-2xl font-semibold tracking-tight mb-4 text-[var(--primary)]">{{ review!.bookTitle }}</h2>
              <p class="text-lg text-[var(--text-muted)] mb-4">Auteur du livre : {{ review!.bookAuthor }}</p>
              <div class="flex items-center gap-4 mb-4">
                <span class="text-3xl text-[var(--accent)]">★ {{ review!.rating }}/5</span>
                <span class="text-sm bg-[var(--surface-alt)] text-[var(--accent-strong)] px-4 py-1 rounded-full font-semibold">
                  {{ review!.genre }}
                </span>
              </div>
            </div>

            <div class="prose prose-sm md:prose max-w-none
                        prose-headings:font-semibold prose-headings:text-[var(--primary)]
                        prose-p:text-[var(--text-dark)] prose-p:leading-relaxed
                        prose-a:text-[var(--accent-strong)] prose-a:underline prose-a:underline-offset-2 hover:prose-a:text-[var(--primary)]
                        prose-strong:text-[var(--text-dark)]
                        prose-blockquote:border-l-[var(--accent-strong)] prose-blockquote:text-[var(--text-muted)]
                        prose-code:text-[var(--accent-strong)] prose-code:bg-[var(--surface-alt)] prose-code:px-1 prose-code:rounded
                        prose-hr:border-[var(--border-light)]">
              <markdown [data]="review!.content"></markdown>
            </div>
          </div>

          <div class="bg-[var(--surface-alt)] border border-[var(--border-light)] p-6 rounded-2xl h-fit">
            <div class="mb-6">
              <img
                *ngIf="review!.imageUrl"
                [src]="review!.imageUrl"
                [alt]="review!.bookTitle"
                class="w-full rounded-2xl mb-4 border border-[var(--border-light)]"
              />
              <div
                *ngIf="!review!.imageUrl"
                class="w-full h-64 bg-white rounded-2xl mb-4 flex items-center justify-center border border-[var(--border-light)]"
              >
                <span class="text-[var(--text-muted)]">Aucune image disponible</span>
              </div>
            </div>

            <div class="space-y-3 text-sm">
              <div>
                <span class="font-semibold">Genre :</span>
                <span class="text-[var(--text-muted)]">{{ review!.genre }}</span>
              </div>
              <div>
                <span class="font-semibold">Note :</span>
                <span class="text-[var(--accent)]">{{ review!.rating }}/5</span>
              </div>
              <div>
                <span class="font-semibold">Publié le :</span>
                <span class="text-[var(--text-muted)]">{{ review!.publishedAt | date: 'short' }}</span>
              </div>
              <div>
                <span class="font-semibold">Mis à jour le :</span>
                <span class="text-[var(--text-muted)]">{{ review!.updatedAt | date: 'short' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Section Critiques similaires -->
      <section
        *ngIf="!isLoading && review && relatedReviews.length > 0"
        class="mt-8"
        aria-labelledby="related-reviews-heading"
      >
        <h2
          id="related-reviews-heading"
          class="text-2xl font-semibold tracking-tight mb-4 text-[var(--primary)]"
        >
          Vous aimerez aussi
          <span class="text-sm font-normal text-[var(--text-muted)] ml-2">— genre « {{ review!.genre }} »</span>
        </h2>

        <div class="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory" role="list">
          <a
            *ngFor="let related of relatedReviews"
            [routerLink]="['/reviews', related.id]"
            role="listitem"
            class="snap-start shrink-0 w-64 bg-[var(--card-bg)] border border-[var(--border-light)] rounded-2xl shadow-[0_12px_24px_-24px_rgba(122,54,95,0.55)] p-5 hover:shadow-[0_20px_36px_-24px_rgba(122,54,95,0.75)] hover:scale-[1.02] transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-strong)]"
            [attr.aria-label]="'Lire la critique : ' + related.title"
          >
            <img
              *ngIf="related.imageUrl"
              [src]="related.imageUrl"
              [alt]="related.bookTitle"
              class="w-full h-36 object-cover rounded-xl mb-3 border border-[var(--border-light)]"
            />
            <div
              *ngIf="!related.imageUrl"
              class="w-full h-36 bg-[var(--surface-alt)] rounded-xl mb-3 flex items-center justify-center border border-[var(--border-light)]"
              aria-hidden="true"
            >
              <span class="text-3xl">📚</span>
            </div>
            <p class="text-xs text-[var(--accent-strong)] font-semibold uppercase tracking-wide mb-1">{{ related.genre }}</p>
            <h3 class="text-sm font-semibold text-[var(--primary)] mb-1 line-clamp-2 leading-snug">{{ related.title }}</h3>
            <p class="text-xs text-[var(--text-muted)] mb-2">{{ related.bookAuthor }}</p>
            <span class="text-xs text-[var(--accent)] font-semibold">★ {{ related.rating }}/5</span>
          </a>
        </div>
      </section>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReviewDetailComponent implements OnInit, OnDestroy {
  review: Review | null = null;
  isLoading = false;
  notFound = false;
  relatedReviews: Review[] = [];

  private destroy$ = new Subject<void>();

  constructor(
    private reviewService: ReviewService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    public auth: AuthService
  ) {}

  ngOnInit(): void {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      const id = params['id'];
      if (id) {
        this.isLoading = true;
        this.notFound = false;
        this.review = null;
        this.relatedReviews = [];
        this.cdr.markForCheck();

        this.reviewService.getReviewById(id)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (review) => {
              this.review = review;
              this.isLoading = false;
              this.notFound = false;
              this.cdr.markForCheck();
              this.loadRelatedReviews(review.genre, review.id);
            },
            error: () => {
              this.isLoading = false;
              this.notFound = true;
              this.cdr.markForCheck();
            },
          });
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /** Breadcrumb trail for review detail (loading, not found, or loaded). */
  reviewDetailBreadcrumbs(): BreadcrumbItem[] {
    const root: BreadcrumbItem[] = [
      { label: 'Accueil', routerLink: ['/'] },
      { label: 'Critiques', routerLink: ['/reviews'] },
    ];
    if (this.review) {
      return [...root, { label: this.review.title }];
    }
    if (this.notFound) {
      return [...root, { label: 'Critique introuvable' }];
    }
    return [...root, { label: 'Chargement…' }];
  }

  private loadRelatedReviews(genre: string, currentId: string): void {
    this.reviewService.getReviews({ genre })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.relatedReviews = response.data
            .filter((r) => r.id !== currentId)
            .slice(0, 4);
          this.cdr.markForCheck();
        },
      });
  }
}
