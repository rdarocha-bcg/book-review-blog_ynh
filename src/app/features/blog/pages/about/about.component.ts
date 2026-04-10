import { Component, ChangeDetectionStrategy } from '@angular/core';

/**
 * About Component
 */
@Component({
  selector: 'app-about',
  standalone: true,
  template: `
    <div class="page-container">
      <div class="pinterest-panel p-8 md:p-10">
        <h1 class="text-4xl font-semibold mb-5 text-[var(--text-dark)]">About us</h1>
        <p class="text-lg text-[var(--text-muted)] leading-relaxed">
          We created this space for readers who love sharing thoughtful book reviews in a clean, inspiring
          environment.
        </p>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AboutComponent {}

