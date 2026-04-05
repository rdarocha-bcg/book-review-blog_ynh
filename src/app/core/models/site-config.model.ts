/**
 * Runtime site branding loaded from assets/site.config.json (YunoHost: same file bound in config_panel.toml).
 */
export interface SiteColorPalette {
  primary: string;
  secondary: string;
  accent: string;
}

export interface SiteConfig {
  siteName: string;
  siteNameShort: string;
  copyrightYear: number;
  colors: SiteColorPalette;
}

export const DEFAULT_SITE_CONFIG: SiteConfig = {
  siteName: 'Book Review Blog',
  siteNameShort: 'BookReview',
  copyrightYear: 2026,
  colors: {
    primary: '#1f2937',
    secondary: '#059669',
    accent: '#f59e0b',
  },
};
