import { Component, ChangeDetectionStrategy } from '@angular/core';

/**
 * About Component
 */
@Component({
  selector: 'app-about',
  standalone: true,
  template: `
    <div class="container mx-auto px-4 py-8">
      <h1 class="text-4xl font-bold mb-8">About Us</h1>
      <p class="text-lg text-gray-600">About content coming soon...</p>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AboutComponent {}

