import { Component, input, inject } from '@angular/core';
import { ThemeService } from 'src/app/core/services/theme.service';

@Component({
  selector: 'app-tooltip',
  template: `
    <div class="tooltip-container" [ngClass]="{ 'show-tooltip': show(), 'dark-theme': themeService.isDarkTheme() }">
      <span>{{ text() }}</span>
    </div>
  `,
  styleUrls: ['../../../styles/tooltip.css'],
  standalone: false
})
export class ToolTipComponent {
  readonly text = input('');
  readonly show = input(false);

  protected themeService = inject(ThemeService);
}
