import { ChangeDetectionStrategy, Component, Input, inject } from '@angular/core';
import { LanguageJourney, LearningDataService } from 'src/app/core/services/learning-data.service';

/**
 * Akhigbe's French learning journey, told in his own voice with the real badges from his Duolingo
 * profile. One component, two layouts, so the pages never drift apart:
 *   'card'  — home "Beyond the code": streak hero, personal records and the 2026 monthly badges
 *   'panel' — projects "Learning in public": streak hero, achievements with level progress, words
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
   readonly earnedMonths = this.journey.months.filter(m => m.state === 'earned').length;
   /** The streak already leads the card as the hero, so the records row skips it. */
   readonly records = this.journey.records.filter(r => r.label !== 'Longest streak');
}
