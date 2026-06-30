import { Component, inject } from '@angular/core';
import { ThemeService } from 'src/app/core/services/theme.service';
import { trigger, state, style, animate, transition } from '@angular/animations';

@Component({
  selector: 'app-theme-toggle',
  template: `
    <button
      class="theme-toggle"
      (click)="toggleTheme()"
      [@themeSwitch]="themeService.isDarkTheme() ? 'dark' : 'light'"
      [attr.aria-label]="themeService.isDarkTheme() ? 'Switch to light theme' : 'Switch to dark theme'">
      <svg class="sun-and-moon" viewBox="0 0 24 24">
        <mask class="moon" id="moon-mask">
          <rect x="0" y="0" width="100%" height="100%" fill="white" />
          <circle cx="24" cy="10" r="6" fill="black" />
        </mask>
        <circle class="sun" cx="12" cy="12" r="6" mask="url(#moon-mask)" />
        <g class="sun-beams">
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </g>
      </svg>
    </button>
  `,
  styleUrls: ['./theme-toggle.component.css'],
  animations: [
    trigger('themeSwitch', [
      state('light', style({ transform: 'rotate(0)' })),
      state('dark', style({ transform: 'rotate(360deg)' })),
      transition('light <=> dark', [animate('1s cubic-bezier(0.4, 0, 0.2, 1)')])
    ])
  ],
  standalone: false
})
export class ThemeToggleComponent {
  protected themeService = inject(ThemeService);

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }
}
