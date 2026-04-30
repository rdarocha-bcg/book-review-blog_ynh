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
import { AuthService } from '@core/services/auth.service';
import { Subject, takeUntil } from 'rxjs';

/**
 * Review Detail Component
 * Displays full review details
 */
@Component({
  selector: 'app-review-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, LoadingSpinnerComponent, MarkdownComponent],
  template: `
    <div class="page-container">
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
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReviewDetailComponent implements OnInit, OnDestroy {
  review: Review | null = null;
  isLoading = false;
  notFound = false;

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
        this.cdr.markForCheck();

        this.reviewService.getReviewById(id)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (review) => {
              this.review = review;
              this.isLoading = false;
              this.notFound = false;
              this.cdr.markForCheck();
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
}

