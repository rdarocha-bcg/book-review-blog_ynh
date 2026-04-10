import { Component, ChangeDetectionStrategy } from '@angular/core';

/**
 * Loading Spinner Component
 * Reusable loading indicator
 */
@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  template: `
    <div class="flex items-center justify-center py-8" role="status" aria-live="polite">
      <span class="sr-only">Loading</span>
      <div class="spinner-ring h-12 w-12 rounded-full border-b-2 border-[var(--accent)]"></div>
    </div>
  `,
  styles: [
    `
      @keyframes app-spinner-rotate {
        to {
          transform: rotate(360deg);
        }
      }
      .spinner-ring {
        animation: app-spinner-rotate 0.85s linear infinite;
      }
      @media (prefers-reduced-motion: reduce) {
        .spinner-ring {
          animation: none;
          border-width: 2px;
          border-style: solid;
          border-color: var(--accent);
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoadingSpinnerComponent {}

