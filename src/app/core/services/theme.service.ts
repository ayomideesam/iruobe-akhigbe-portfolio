import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private _isDarkTheme = signal(false);
  readonly isDarkTheme = this._isDarkTheme.asReadonly();

  constructor() {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      this.applyTheme(true);
    }
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
      this.applyTheme(e.matches);
    });
  }

  toggleTheme(isDark?: boolean): void {
    const next = isDark !== undefined ? isDark : !this._isDarkTheme();
    this.applyTheme(next);
  }

  private applyTheme(isDark: boolean): void {
    this._isDarkTheme.set(isDark);
    document.documentElement.classList.toggle('dark-theme', isDark);
  }
}
