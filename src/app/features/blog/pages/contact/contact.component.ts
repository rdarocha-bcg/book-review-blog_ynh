import { Component, ChangeDetectionStrategy } from '@angular/core';

/**
 * Contact Component
 */
@Component({
  selector: 'app-contact',
  standalone: true,
  template: `
    <div class="container mx-auto px-4 py-10">
      <section class="max-w-3xl mx-auto pinterest-panel p-8 md:p-10">
        <h1 class="text-4xl font-bold mb-4 text-[var(--text-dark)]">Contact</h1>
        <p class="text-base md:text-lg text-[var(--text-muted)]">
          Contact form coming soon...
        </p>
      </section>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactComponent {}

