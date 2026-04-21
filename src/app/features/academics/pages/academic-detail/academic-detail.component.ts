import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AcademicService } from '../../services/academic.service';
import { AcademicWork } from '../../models/academic.model';
import { LoadingSpinnerComponent } from '@shared/components/loading-spinner/loading-spinner.component';
import { Subject, takeUntil } from 'rxjs';
import { MarkdownComponent } from 'ngx-markdown';

/**
 * Academic Detail Component
 * Displays full academic work details in a single-column reading layout.
 * The sidebar has been removed — metadata is presented inline under the
 * title so the full viewport width is available for long-form content.
 */
@Component({
  selector: 'app-academic-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, LoadingSpinnerComponent, MarkdownComponent],
  template: `
    <!-- Back navigation -->
    <div class="page-container page-container--narrow">
      <a
        routerLink="/academics"
        class="text-[var(--accent-strong)] hover:text-[var(--primary)] mb-6 inline-flex items-center gap-1 font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-strong)]"
      >
        ← Travaux académiques
      </a>

      <!-- Loading skeleton -->
      <div *ngIf="isLoading$ | async" class="animate-pulse space-y-4" aria-busy="true" aria-label="Chargement en cours">
        <div class="h-10 bg-[var(--surface-alt)] rounded-lg w-3/4"></div>
        <div class="h-5 bg-[var(--surface-alt)] rounded w-1/3"></div>
        <div class="h-4 bg-[var(--surface-alt)] rounded w-full mt-6"></div>
        <div class="h-4 bg-[var(--surface-alt)] rounded w-5/6"></div>
        <div class="h-4 bg-[var(--surface-alt)] rounded w-full"></div>
        <div class="h-4 bg-[var(--surface-alt)] rounded w-4/6"></div>
      </div>

      <!-- Article -->
      <article *ngIf="academic" class="pinterest-panel p-6 md:p-10">

        <!-- Header -->
        <header class="mb-8">
          <h1 class="text-4xl md:text-5xl font-semibold tracking-tight mb-4 text-[var(--primary)] leading-tight">
            {{ academic.title }}
          </h1>

          <!-- Inline metadata row -->
          <p class="text-sm font-medium tracking-widest uppercase text-[var(--text-muted)] flex flex-wrap gap-x-3 gap-y-1">
            <span>{{ academic.workType }}</span>
            <span aria-hidden="true" class="text-[var(--border-light)]">·</span>
            <span>{{ academic.year }}</span>
            <span aria-hidden="true" class="text-[var(--border-light)]">·</span>
            <span class="normal-case tracking-normal">{{ academic.publishedAt | date:'d MMMM yyyy':'':'fr' }}</span>
            <ng-container *ngIf="academic.theme">
              <span aria-hidden="true" class="text-[var(--border-light)]">·</span>
              <span>{{ academic.theme }}</span>
            </ng-container>
            <ng-container *ngIf="academic.sourceUrl">
              <span aria-hidden="true" class="text-[var(--border-light)]">·</span>
              <a
                [href]="academic.sourceUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="text-[var(--accent-strong)] hover:text-[var(--primary)] underline underline-offset-2 transition-colors normal-case tracking-normal"
              >Source</a>
            </ng-container>
          </p>
        </header>

        <!-- Summary — lead paragraph -->
        <div
          *ngIf="academic.summary"
          class="mb-8 pl-4 border-l-2 border-[var(--accent-strong)]"
          role="doc-abstract"
        >
          <p class="text-lg leading-relaxed text-[var(--text-muted)] italic">
            {{ academic.summary }}
          </p>
        </div>

        <!-- Full content rendered as Markdown -->
        <div class="prose prose-sm md:prose max-w-none
                    prose-headings:font-semibold prose-headings:text-[var(--primary)]
                    prose-p:text-[var(--text-dark)] prose-p:leading-relaxed
                    prose-a:text-[var(--accent-strong)] prose-a:underline prose-a:underline-offset-2 hover:prose-a:text-[var(--primary)]
                    prose-strong:text-[var(--text-dark)]
                    prose-blockquote:border-l-[var(--accent-strong)] prose-blockquote:text-[var(--text-muted)]
                    prose-code:text-[var(--accent-strong)] prose-code:bg-[var(--surface-alt)] prose-code:px-1 prose-code:rounded
                    prose-hr:border-[var(--border-light)]">
          <markdown [data]="academic.content"></markdown>
        </div>

        <!-- Edit button (admin action) -->
        <footer class="mt-10 pt-6 border-t border-[var(--border-light)] flex justify-end">
          <a
            [routerLink]="['/academics', academic.id, 'edit']"
            class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--surface-alt)] border border-[var(--border-light)] text-sm font-semibold text-[var(--accent-strong)] hover:bg-[var(--accent-strong)] hover:text-white hover:border-[var(--accent-strong)] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-strong)]"
          >
            Modifier
          </a>
        </footer>
      </article>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AcademicDetailComponent implements OnInit, OnDestroy {
  academic: AcademicWork | null = null;
  isLoading$ = this.academicService.getLoading$();

  private destroy$ = new Subject<void>();

  constructor(
    private academicService: AcademicService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      const id = params['id'];
      if (id) {
        this.academicService.getAcademicById(id)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (result) => {
              this.academic = result;
              this.cdr.markForCheck();
            },
            error: (error) => console.error('Error loading academic:', error),
          });
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
