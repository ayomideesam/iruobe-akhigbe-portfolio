import { Component, Input, inject } from '@angular/core';
import { ThemeService } from 'src/app/core/services/theme.service';

@Component({
  selector: 'app-tooltip',
  template: `
    <div class="tooltip-container" [ngClass]="{ 'show-tooltip': show, 'dark-theme': themeService.isDarkTheme() }">
      <span>{{ text }}</span>
    </div>
  `,
  styleUrls: ['../../../styles/tooltip.css'],
  standalone: false
})
export class ToolTipComponent {
  @Input() text = '';
  @Input() show = false;

  protected themeService = inject(ThemeService);
}
