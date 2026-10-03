import { ChangeDetectionStrategy, Component, Input, inject } from '@angular/core';
import { LanguageJourney, LearningDataService } from 'src/app/core/services/learning-data.service';

/**
 * Akhigbe's French learning journey. One component, two layouts, so the home page and the projects
 * page never drift apart:
 *   'card'  — home "Beyond the code": headline stats and the month-by-month badge strip
 *   'panel' — projects "Learning in public": compact stats, achievements and practised words
 */
@Component({
   selector: 'app-learning-journey',
   templateUrl: './learning-journey.component.html',
   styleUrls: ['./learning-journey.component.css'],
   changeDetection: ChangeDetectionStrategy.OnPush,
   standalone: false
})
export class LearningJourneyComponent {
   @Input() variant: 'card' | 'panel' = 'card';

   readonly journey: LanguageJourney = inject(LearningDataService).getFrenchJourney();

   /** The panel keeps to the three figures that read without Duolingo context. */
   get panelStats() {
      return this.journey.stats.filter(s => ['Day streak', 'Total XP', 'League'].includes(s.label));
   }

   get earnedMonths(): number {
      return this.journey.months.filter(m => m.state === 'earned').length;
   }
}
