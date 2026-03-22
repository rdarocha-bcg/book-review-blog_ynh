import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

/**
 * Contribution Guide Component
 * Static page explaining how to contribute reviews to the blog
 */
@Component({
  selector: 'app-contribution-guide',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container mx-auto px-4 py-8 max-w-3xl">
      <a routerLink="/blog" class="text-blue-600 hover:text-blue-800 mb-6 inline-block">← Back to Blog</a>

      <h1 class="text-4xl font-bold mb-6">Contribution Guide</h1>
      <p class="text-lg text-gray-600 mb-8">
        We welcome book reviews from all readers. Here’s how to contribute.
      </p>

      <section class="space-y-6">
        <h2 class="text-2xl font-semibold">How to submit a review</h2>
        <ol class="list-decimal list-inside space-y-3 text-gray-700">
          <li>Create an account or log in.</li>
          <li>Go to <a routerLink="/reviews/new" class="text-blue-600 hover:underline">New Review</a>.</li>
          <li>Fill in the book title, author, genre, and your review text.</li>
          <li>Add a rating from 1 to 5 stars.</li>
          <li>Submit. Reviews may be moderated before publication.</li>
        </ol>
      </section>

      <section class="mt-8 space-y-4">
        <h2 class="text-2xl font-semibold">Guidelines</h2>
        <ul class="list-disc list-inside space-y-2 text-gray-700">
          <li>Be respectful and avoid spoilers without warning.</li>
          <li>Focus on the book: style, plot, characters, and your opinion.</li>
          <li>Original content only; do not copy from elsewhere.</li>
        </ul>
      </section>

      <section class="mt-8">
        <h2 class="text-2xl font-semibold mb-4">Questions?</h2>
        <p class="text-gray-700">
          <a routerLink="/blog/contact" class="text-blue-600 hover:underline">Contact us</a> for any questions about contributing.
        </p>
      </section>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContributionGuideComponent {}
