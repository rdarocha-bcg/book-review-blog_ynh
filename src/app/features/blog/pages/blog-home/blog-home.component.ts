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
    <div class="page-container">
      <header class="mb-8">
        <h1 class="luxe-title text-4xl md:text-5xl font-bold text-[var(--primary)] mb-3">Blog</h1>
        <p class="text-lg text-[var(--text-muted)]">
          Discover our editorial world and join the community of readers.
        </p>
      </header>

      <div class="columns-1 md:columns-2 gap-6 [column-fill:_balance] space-y-6">
        <article class="break-inside-avoid mb-6 bg-white/95 border border-[var(--border-light)] rounded-3xl p-6 shadow-[0_18px_45px_-35px_rgba(122,54,95,0.7)]">
          <p class="text-xs uppercase tracking-[0.25em] text-[var(--text-muted)] mb-2">Who we are</p>
          <h2 class="text-2xl font-semibold text-[var(--primary)] mb-2">About</h2>
          <p class="text-[var(--text-muted)] mb-5">
            Learn the story behind this classy and minimalist review platform.
          </p>
          <a routerLink="/blog/about" class="font-semibold text-[var(--accent-strong)] hover:text-[var(--primary)]">
            Read more →
          </a>
        </article>

        <article class="break-inside-avoid mb-6 bg-white/95 border border-[var(--border-light)] rounded-3xl p-6 shadow-[0_18px_45px_-35px_rgba(122,54,95,0.7)]">
          <p class="text-xs uppercase tracking-[0.25em] text-[var(--text-muted)] mb-2">Contribute</p>
          <h2 class="text-2xl font-semibold text-[var(--primary)] mb-2">How to contribute</h2>
          <p class="text-[var(--text-muted)] mb-5">
            Share your literary perspective and publish refined reviews in a few steps.
          </p>
          <a routerLink="/blog/contribute" class="font-semibold text-[var(--accent-strong)] hover:text-[var(--primary)]">
            Open guide →
          </a>
        </article>

        <article class="break-inside-avoid mb-6 bg-white/95 border border-[var(--border-light)] rounded-3xl p-6 shadow-[0_18px_45px_-35px_rgba(122,54,95,0.7)]">
          <p class="text-xs uppercase tracking-[0.25em] text-[var(--text-muted)] mb-2">Get in touch</p>
          <h2 class="text-2xl font-semibold text-[var(--primary)] mb-2">Contact</h2>
          <p class="text-[var(--text-muted)] mb-5">
            Questions, ideas or partnerships? Reach out and we will answer quickly.
          </p>
          <a routerLink="/blog/contact" class="font-semibold text-[var(--accent-strong)] hover:text-[var(--primary)]">
            Contact us →
          </a>
        </article>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BlogHomeComponent {}

