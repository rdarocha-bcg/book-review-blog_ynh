import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

/**
 * Blog Home Component
 */
@Component({
  selector: 'app-blog-home',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="container mx-auto px-4 py-8">
      <h1 class="text-4xl font-bold mb-8">Blog</h1>
      <p class="text-lg text-gray-600 mb-6">Welcome to our blog. Find out more about us and how to contribute.</p>
      <ul class="space-y-2">
        <li><a routerLink="/blog/about" class="text-blue-600 hover:underline">About</a></li>
        <li><a routerLink="/blog/contribute" class="text-blue-600 hover:underline">How to contribute</a></li>
        <li><a routerLink="/blog/contact" class="text-blue-600 hover:underline">Contact</a></li>
      </ul>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BlogHomeComponent {}

