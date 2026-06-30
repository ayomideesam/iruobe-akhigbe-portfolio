import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private isDarkThemeSubject = new BehaviorSubject<boolean>(false);
  isDarkTheme$ = this.isDarkThemeSubject.asObservable();

  constructor() {
    // Check user's preferred color scheme
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      this.toggleTheme(true);
    }
    
    // Listen for changes in system theme
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
      this.toggleTheme(e.matches);
    });
  }

  toggleTheme(isDark?: boolean) {
    const newTheme = isDark !== undefined ? isDark : !this.isDarkThemeSubject.value;
    this.isDarkThemeSubject.next(newTheme);
    
    if (newTheme) {
      document.documentElement.classList.add('dark-theme');
    } else {
      document.documentElement.classList.remove('dark-theme');
    }
  }
}