import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CardComponent } from '@shared/components/card/card.component';

/**
 * Placeholder card matching review list layout while data loads.
 */
@Component({
  selector: 'app-review-card-skeleton',
  standalone: true,
  imports: [CardComponent],
  template: `
    <app-card [hoverable]="false" class="block break-inside-avoid mb-6">
      <div class="review-card-skeleton space-y-3" aria-hidden="true">
        <div class="h-6 w-[85%] rounded-lg bg-[var(--surface-alt)]"></div>
        <div class="h-4 w-1/3 rounded bg-[var(--surface-alt)]"></div>
        <div class="h-4 w-full rounded bg-[var(--surface-alt)]"></div>
        <div class="h-4 w-[90%] rounded bg-[var(--surface-alt)]"></div>
        <div class="h-6 w-24 rounded-full bg-[var(--surface-alt)]"></div>
        <div class="h-3 w-full rounded bg-[var(--surface-alt)]"></div>
        <div class="h-3 w-[95%] rounded bg-[var(--surface-alt)]"></div>
        <div class="h-3 w-2/3 rounded bg-[var(--surface-alt)]"></div>
        <div class="h-4 w-40 rounded bg-[var(--surface-alt)] mt-2"></div>
      </div>
    </app-card>
  `,
  styles: [
    `
      .review-card-skeleton > div {
        animation: review-card-skeleton-pulse 1.35s ease-in-out infinite;
      }
      .review-card-skeleton > div:nth-child(2) {
        animation-delay: 0.08s;
      }
      .review-card-skeleton > div:nth-child(3) {
        animation-delay: 0.16s;
      }
      .review-card-skeleton > div:nth-child(4) {
        animation-delay: 0.24s;
      }
      .review-card-skeleton > div:nth-child(5) {
        animation-delay: 0.32s;
      }
      .review-card-skeleton > div:nth-child(6) {
        animation-delay: 0.4s;
      }
      .review-card-skeleton > div:nth-child(7) {
        animation-delay: 0.48s;
      }
      .review-card-skeleton > div:nth-child(8) {
        animation-delay: 0.56s;
      }
      .review-card-skeleton > div:nth-child(9) {
        animation-delay: 0.64s;
      }
      @keyframes review-card-skeleton-pulse {
        0%,
        100% {
          opacity: 0.55;
        }
        50% {
          opacity: 1;
        }
      }
      @media (prefers-reduced-motion: reduce) {
        .review-card-skeleton > div {
          animation: none;
          opacity: 0.75;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReviewCardSkeletonComponent {}
