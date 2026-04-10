import { Injectable, Inject, signal } from '@angular/core';
import { DOCUMENT } from '@angular/common';

export type ThemePreference = 'system' | 'light' | 'dark';

const STORAGE_KEY = 'app-color-scheme';

/**
 * Applies light/dark appearance on <html> and persists user choice in localStorage.
 * Initial paint is handled by a small inline script in index.html (same key).
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly preference = signal<ThemePreference>(this.readStored());

  private mediaQuery: MediaQueryList | null = null;

  constructor(@Inject(DOCUMENT) private document: Document) {
    const win = this.document.defaultView;
    if (win?.matchMedia) {
      this.mediaQuery = win.matchMedia('(prefers-color-scheme: dark)');
      this.mediaQuery.addEventListener('change', () => {
        if (this.preference() === 'system') {
          this.applyToDocument('system');
        }
      });
    }
    this.applyToDocument(this.preference());
  }

  cyclePreference(): void {
    const order: ThemePreference[] = ['system', 'light', 'dark'];
    const idx = order.indexOf(this.preference());
    const next = order[(idx + 1) % order.length];
    this.setPreference(next);
  }

  setPreference(value: ThemePreference): void {
    this.preference.set(value);
    try {
      this.document.defaultView?.localStorage?.setItem(STORAGE_KEY, value);
    } catch {
      /* ignore private mode */
    }
    this.applyToDocument(value);
  }

  labelForPreference(): string {
    switch (this.preference()) {
      case 'light':
        return 'Light theme';
      case 'dark':
        return 'Dark theme';
      default:
        return 'System theme';
    }
  }

  private readStored(): ThemePreference {
    try {
      const raw = this.document.defaultView?.localStorage?.getItem(STORAGE_KEY);
      if (raw === 'light' || raw === 'dark' || raw === 'system') {
        return raw;
      }
    } catch {
      /* ignore */
    }
    return 'system';
  }

  private prefersDarkScheme(): boolean {
    return this.mediaQuery?.matches ?? false;
  }

  private applyToDocument(pref: ThemePreference): void {
    const root = this.document.documentElement;
    let dark = false;
    if (pref === 'dark') {
      dark = true;
    } else if (pref === 'light') {
      dark = false;
    } else {
      dark = this.prefersDarkScheme();
    }
    root.classList.toggle('theme-dark', dark);
    root.style.colorScheme = dark ? 'dark' : 'light';
  }
}
