import { Component, ChangeDetectionStrategy } from '@angular/core';

/**
 * Contact Component
 */
@Component({
  selector: 'app-contact',
  standalone: true,
  template: `
    <div class="container mx-auto px-4 py-8">
      <h1 class="text-4xl font-bold mb-8">Contact</h1>
      <p class="text-lg text-gray-600">Contact form coming soon...</p>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactComponent {}

