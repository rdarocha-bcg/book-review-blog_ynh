import { Component, ChangeDetectionStrategy } from '@angular/core';

/**
 * Loading Spinner Component
 * Reusable loading indicator
 */
@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  template: `
    <div class="flex items-center justify-center py-8">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoadingSpinnerComponent {}

