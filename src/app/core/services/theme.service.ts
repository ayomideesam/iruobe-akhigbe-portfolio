import { Injectable, signal } from '@angular/core';

type Theme = 'dark' | 'light';

/**
 * Home v2 theme model (adopted from the design prototype):
 * - Default DARK, ignore prefers-color-scheme.
 * - Persist choice to localStorage key `iru-v2-theme`.
 * - Apply `.thm-dark` (+ legacy `.dark-theme`) or `.thm-light` on <html> so
 *   BOTH the new design tokens (--bg/--tx/--pr…) and the legacy tokens
 *   (--primary-color…) resolve correctly across every page.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private static readonly STORAGE_KEY = 'iru-v2-theme';

  private _isDarkTheme = signal(true);
  readonly isDarkTheme = this._isDarkTheme.asReadonly();

  constructor() {
    this.applyTheme(this.readStoredTheme() === 'light' ? false : true);
  }

  toggleTheme(isDark?: boolean): void {
    const next = isDark !== undefined ? isDark : !this._isDarkTheme();
    this.applyTheme(next);
  }

  private readStoredTheme(): Theme | null {
    try {
      const v = localStorage.getItem(ThemeService.STORAGE_KEY);
      return v === 'dark' || v === 'light' ? v : null;
    } catch {
      return null;
    }
  }

  private applyTheme(isDark: boolean): void {
    this._isDarkTheme.set(isDark);
    const root = document.documentElement.classList;
    // New design tokens: dark = :root/.thm-dark, light = .thm-light
    root.toggle('thm-dark', isDark);
    root.toggle('thm-light', !isDark);
    // Legacy tokens (--primary-color set): dark overrides live under .dark-theme
    root.toggle('dark-theme', isDark);
    try {
      localStorage.setItem(ThemeService.STORAGE_KEY, isDark ? 'dark' : 'light');
    } catch {
      /* storage unavailable — non-fatal */
    }
  }
}
