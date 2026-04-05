import { Injectable, Inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Title } from '@angular/platform-browser';
import { APP_BASE_HREF } from '@angular/common';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { DEFAULT_SITE_CONFIG, SiteConfig } from '@core/models/site-config.model';

@Injectable({ providedIn: 'root' })
export class SiteConfigService {
  private readonly branding = signal<SiteConfig>(DEFAULT_SITE_CONFIG);

  /** Effective branding (from JSON or defaults if load fails). */
  readonly config = this.branding.asReadonly();

  constructor(
    private readonly http: HttpClient,
    private readonly title: Title,
    @Inject(APP_BASE_HREF) private readonly baseHref: string,
  ) {
    this.applyTheme({});
  }

  /**
   * Fetches site.config.json and applies CSS variables + document title.
   */
  load(): Observable<SiteConfig> {
    const url = this.resolveConfigUrl();
    return this.http.get<SiteConfig>(url).pipe(
      tap((raw) => this.applyTheme(raw)),
      map(() => this.branding()),
      catchError(() => {
        this.applyTheme({});
        return of(this.branding());
      }),
    );
  }

  private resolveConfigUrl(): string {
    const base = this.baseHref.endsWith('/') ? this.baseHref : `${this.baseHref}/`;
    return `${base}assets/site.config.json`;
  }

  private applyTheme(raw: Partial<SiteConfig>): void {
    const merged: SiteConfig = {
      siteName: raw.siteName ?? DEFAULT_SITE_CONFIG.siteName,
      siteNameShort: raw.siteNameShort ?? DEFAULT_SITE_CONFIG.siteNameShort,
      copyrightYear: raw.copyrightYear ?? DEFAULT_SITE_CONFIG.copyrightYear,
      colors: {
        ...DEFAULT_SITE_CONFIG.colors,
        ...raw.colors,
      },
    };
    this.branding.set(merged);
    const root = document.documentElement;
    root.style.setProperty('--primary', merged.colors.primary);
    root.style.setProperty('--secondary', merged.colors.secondary);
    root.style.setProperty('--accent', merged.colors.accent);
    root.style.setProperty('--text-dark', merged.colors.primary);
    this.title.setTitle(merged.siteName);
  }
}
