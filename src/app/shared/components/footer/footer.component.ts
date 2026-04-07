import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SiteConfigService } from '@core/services/site-config.service';

/**
 * Footer Component
 * Footer with links and information
 */
@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  template: `
    <footer class="mt-16 border-t border-[var(--border-light)] bg-[var(--surface-alt)]/80 backdrop-blur-sm" role="contentinfo">
      <div class="container mx-auto px-4 py-12 text-[var(--text-dark)]">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 class="font-bold mb-4 text-[var(--primary)]">About</h3>
            <ul class="space-y-2">
              <li><a routerLink="/blog/about" class="hover:text-[var(--primary)] transition">About Us</a></li>
              <li><a routerLink="/blog/contact" class="hover:text-[var(--primary)] transition">Contact</a></li>
              <li><a routerLink="/blog/contribute" class="hover:text-[var(--primary)] transition">Contribute</a></li>
            </ul>
          </div>
          <div>
            <h3 class="font-bold mb-4 text-[var(--primary)]">Resources</h3>
            <ul class="space-y-2">
              <li><a routerLink="/blog" class="hover:text-[var(--primary)] transition">Blog</a></li>
              <li><a href="#" class="hover:text-[var(--primary)] transition">FAQ</a></li>
            </ul>
          </div>
          <div>
            <h3 class="font-bold mb-4 text-[var(--primary)]">Legal</h3>
            <ul class="space-y-2">
              <li><a href="#" class="hover:text-[var(--primary)] transition">Privacy Policy</a></li>
              <li><a href="#" class="hover:text-[var(--primary)] transition">Terms of Service</a></li>
            </ul>
          </div>
          <div>
            <h3 class="font-bold mb-4 text-[var(--primary)]">Follow Us</h3>
            <ul class="space-y-2">
              <li><a href="#" class="hover:text-[var(--primary)] transition">Twitter</a></li>
              <li><a href="#" class="hover:text-[var(--primary)] transition">Facebook</a></li>
            </ul>
          </div>
        </div>
        <div class="border-t border-[var(--border-light)] pt-8 text-center text-sm text-[var(--text-muted)]">
          <p>&copy; {{ site.config().copyrightYear }} {{ site.config().siteName }}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FooterComponent {
  readonly site = inject(SiteConfigService);
}

