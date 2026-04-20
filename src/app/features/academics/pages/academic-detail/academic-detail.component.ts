import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AcademicService } from '../../services/academic.service';
import { LoadingSpinnerComponent } from '@shared/components/loading-spinner/loading-spinner.component';
import { Subject, takeUntil } from 'rxjs';

/**
 * Academic Detail Component
 * Displays full academic work details
 */
@Component({
  selector: 'app-academic-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, LoadingSpinnerComponent],
  template: `
    <div class=\"page-container\">
      <a routerLink=\"/academics\" class=\"text-[var(--accent-strong)] hover:text-[var(--primary)] mb-4 inline-block font-semibold\">
        ← Back to Academics
      </a>

      <app-loading-spinner *ngIf=\"isLoading$ | async\"></app-loading-spinner>

      <div *ngIf=\"academic$ | async as academic\" class=\"pinterest-panel p-8\">
        <div class=\"mb-6\">
          <h1 class=\"text-4xl font-semibold tracking-tight mb-2 text-[var(--primary)]\">{{ academic.title }}</h1>
          <p class=\"text-lg text-[var(--text-muted)]\">{{ academic.workType }} ({{ academic.year }})</p>
        </div>

        <div class=\"grid grid-cols-1 md:grid-cols-3 gap-8 mb-8\">
          <div class=\"md:col-span-2\">
            <div class=\"mb-6\">
              <h2 class=\"text-2xl font-semibold tracking-tight mb-4 text-[var(--primary)]\">{{ academic.context }}</h2>
              <div class=\"flex items-center gap-4 mb-4\">
                <span class=\"inline-block px-3 py-1 rounded-full bg-[var(--surface-alt)] text-[var(--accent-strong)] font-semibold\">
                  {{ academic.theme }}
                </span>
              </div>
            </div>

            <div class=\"prose max-w-none\">
              <p class=\"text-[var(--text-dark)] whitespace-pre-wrap\">{{ academic.content }}</p>
            </div>
          </div>

          <div class=\"bg-[var(--surface-alt)] border border-[var(--border-light)] p-6 rounded-2xl h-fit\">
            <div class=\"mb-6\">
              <img
                *ngIf=\"academic.imageUrl\"
                [src]=\"academic.imageUrl\"
                [alt]=\"academic.title\"
                class=\"w-full rounded-2xl mb-4 border border-[var(--border-light)]\"
              />
              <div
                *ngIf=\"!academic.imageUrl\"
                class=\"w-full h-64 bg-white rounded-2xl mb-4 flex items-center justify-center border border-[var(--border-light)]\"
              >
                <span class=\"text-[var(--text-muted)]\">No image available</span>
              </div>
            </div>

            <div class=\"space-y-3 text-sm\">
              <div>
                <span class=\"font-semibold\">Work Type:</span>
                <span class=\"text-[var(--text-muted)]\">{{ academic.workType }}</span>
              </div>
              <div>
                <span class=\"font-semibold\">Theme:</span>
                <span class=\"text-[var(--text-muted)]\">{{ academic.theme }}</span>
              </div>
              <div>
                <span class=\"font-semibold\">Year:</span>
                <span class=\"text-[var(--text-muted)]\">{{ academic.year }}</span>
              </div>
              <div *ngIf=\"academic.sourceUrl\">
                <span class=\"font-semibold\">Source:</span>
                <a [href]=\"academic.sourceUrl\" class=\"text-[var(--accent-strong)] hover:underline\" target=\"_blank\">{{ academic.sourceUrl }}</a>
              </div>
              <div>
                <span class=\"font-semibold\">Published:</span>
                <span class=\"text-[var(--text-muted)]\">{{ academic.publishedAt | date: 'short' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AcademicDetailComponent implements OnInit, OnDestroy {
  academic$ = this.academicService.getSelectedAcademic$();
  isLoading$ = this.academicService.getLoading$();

  private destroy$ = new Subject<void>();

  constructor(
    private academicService: AcademicService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      const id = params['id'];
      if (id) {
        this.academicService.getAcademicById(id)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
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
