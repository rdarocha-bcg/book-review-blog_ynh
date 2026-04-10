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
    <footer class="mt-16 border-t border-[var(--border-light)] bg-[color:var(--surface-alt)] backdrop-blur-sm" role="contentinfo">
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
              <li><span class="text-[var(--text-muted)] cursor-not-allowed" aria-disabled="true">FAQ</span></li>
            </ul>
          </div>
          <div>
            <h3 class="font-bold mb-4 text-[var(--primary)]">Legal</h3>
            <ul class="space-y-2">
              <li><span class="text-[var(--text-muted)] cursor-not-allowed" aria-disabled="true">Privacy Policy</span></li>
              <li><span class="text-[var(--text-muted)] cursor-not-allowed" aria-disabled="true">Terms of Service</span></li>
            </ul>
          </div>
          <div>
            <h3 class="font-bold mb-4 text-[var(--primary)]">Follow Us</h3>
            <ul class="space-y-2">
              <li><span class="text-[var(--text-muted)] cursor-not-allowed" aria-disabled="true">Twitter</span></li>
              <li><span class="text-[var(--text-muted)] cursor-not-allowed" aria-disabled="true">Facebook</span></li>
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

