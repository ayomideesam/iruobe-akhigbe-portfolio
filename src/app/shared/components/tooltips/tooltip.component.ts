import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { takeUntil } from 'rxjs';
import { SubscriptionManagementDirective } from 'src/app/core/directives/unsubscribe.directive';
import { ThemeService } from 'src/app/core/services/theme.service';

@Component({
    selector: 'app-tooltip',
    template: `
      <div class="tooltip-container" [ngClass]="{ 'show-tooltip': show, 'dark-theme': isDarkTheme }">
         <span>
            {{ text }}
         </span>
      </div>
   `,
    styleUrls: ['../../../styles/tooltip.css'],
    standalone: false
})
export class ToolTipComponent extends SubscriptionManagementDirective implements OnInit {
   isDarkTheme = false;
   @Input() text: string = '';
   @Input() show: boolean = false;

   constructor(
      private themeService: ThemeService
   ) {
      super();
   }

   ngOnInit(): void {
      this.themeService.isDarkTheme$.pipe(
         takeUntil(this.unSubscribe)
      ).subscribe(
         isDark => this.isDarkTheme = isDark
      )
   }


}
