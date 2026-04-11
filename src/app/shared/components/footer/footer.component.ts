import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { SiteConfigService } from '@core/services/site-config.service';

/**
 * Minimal footer: copyright only.
 */
@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [],
  template: `
    <footer
      class="mt-12 border-t border-[var(--border-light)] py-8 text-center text-sm text-[var(--text-muted)]"
      role="contentinfo"
    >
      <p>&copy; {{ site.config().copyrightYear }} {{ site.config().siteName }}</p>
    </footer>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FooterComponent {
  readonly site = inject(SiteConfigService);
}
