import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { ReviewService } from '@features/reviews/services/review.service';
import { AcademicService } from '@features/academics/services/academic.service';
import { Review } from '@features/reviews/models/review.model';
import { AcademicWork } from '@features/academics/models/academic.model';
import { CardComponent } from '@shared/components/card/card.component';
import { ReviewCardSkeletonComponent } from '@shared/components/review-card-skeleton/review-card-skeleton.component';

/**
 * Home Page Component
 * Landing page: hero, featured reviews, featured academic works.
 */
@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [CommonModule, RouterLink, CardComponent, ReviewCardSkeletonComponent],
  templateUrl: './home-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePageComponent implements OnInit, OnDestroy {
  readonly skeletonSlots = [0, 1, 2] as const;

  featuredReviews: Review[] = [];
  featuredAcademics: AcademicWork[] = [];
  reviewsLoading = true;
  academicsLoading = true;

  private destroy$ = new Subject<void>();

  constructor(
    private reviewService: ReviewService,
    private academicService: AcademicService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.reviewService
      .getReviews({ featured: true, limit: 3 })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.featuredReviews = res.data;
          this.reviewsLoading = false;
          this.cdr.markForCheck();
        },
        error: () => {
          this.reviewsLoading = false;
          this.cdr.markForCheck();
        },
      });

    this.academicService
      .getAcademics({ featured: true, limit: 3 })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.featuredAcademics = res.data;
          this.academicsLoading = false;
          this.cdr.markForCheck();
        },
        error: () => {
          this.academicsLoading = false;
          this.cdr.markForCheck();
        },
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  trackByReviewId(index: number, review: Review): string {
    return review.id;
  }

  trackByAcademicId(index: number, academic: AcademicWork): string {
    return academic.id;
  }

  trackBySkeletonSlot(index: number, slot: number): number {
    return slot;
  }
}
