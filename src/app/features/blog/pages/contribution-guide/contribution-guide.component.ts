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
    <div class="page-container page-container--narrow">
      <a
        routerLink="/blog"
        class="inline-flex items-center rounded-full border border-[var(--border-light)] bg-white px-4 py-2 text-sm font-semibold text-[var(--accent-strong)] shadow-sm transition hover:border-[var(--secondary)]"
      >
        ← Back to Blog
      </a>

      <div class="pinterest-panel mt-6 p-8">
        <h1 class="text-4xl font-bold text-[var(--text-dark)]">Contribution Guide</h1>
        <p class="mt-4 text-lg text-[var(--text-muted)]">
          We welcome book reviews from all readers. Here is how to contribute in a clean and consistent way.
        </p>

        <section class="mt-8 space-y-4">
          <h2 class="text-2xl font-semibold text-[var(--text-dark)]">How to submit a review</h2>
          <ol class="list-decimal list-inside space-y-3 text-[var(--text-muted)]">
            <li>Create an account or log in.</li>
            <li>
              Go to
              <a routerLink="/reviews/new" class="font-semibold text-[var(--accent-strong)] hover:underline">New Review</a>.
            </li>
            <li>Fill in the book title, author, genre, and your review text.</li>
            <li>Add a rating from 1 to 5 stars.</li>
            <li>Submit. Reviews may be moderated before publication.</li>
          </ol>
        </section>

        <section class="mt-8 space-y-4">
          <h2 class="text-2xl font-semibold text-[var(--text-dark)]">Guidelines</h2>
          <ul class="list-disc list-inside space-y-2 text-[var(--text-muted)]">
            <li>Be respectful and avoid spoilers without warning.</li>
            <li>Focus on the book: style, plot, characters, and your opinion.</li>
            <li>Original content only; do not copy from elsewhere.</li>
          </ul>
        </section>

        <section class="mt-8">
          <h2 class="text-2xl font-semibold text-[var(--text-dark)]">Questions?</h2>
          <p class="mt-3 text-[var(--text-muted)]">
            <a routerLink="/blog/contact" class="font-semibold text-[var(--accent-strong)] hover:underline">Contact us</a>
            for any questions about contributing.
          </p>
        </section>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContributionGuideComponent {}
