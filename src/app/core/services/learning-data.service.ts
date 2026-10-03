import { Injectable } from '@angular/core';

export interface LearningStat {
   value: string;
   label: string;
   detail?: string;
}

export interface LearningMonth {
   label: string;
   state: 'earned' | 'missed' | 'current';
}

export interface LearningAchievement {
   name: string;
   progress: string;
   note: string;
}

export interface LanguageJourney {
   language: string;
   platform: string;
   startedLabel: string;
   /** Every figure below is a snapshot from this date — update it with the numbers. */
   asOfIso: string;
   asOfLabel: string;
   headline: string;
   why: string;
   stats: LearningStat[];
   months: LearningMonth[];
   achievements: LearningAchievement[];
   words: string[];
}

/**
 * Akhigbe's French progress, centralised like project data so the home card, the projects panel
 * and the resume never disagree. Figures come from his Duolingo profile on 3 Oct 2026; only
 * claims visible there are made (no CEFR level).
 */
@Injectable({ providedIn: 'root' })
export class LearningDataService {
   getFrenchJourney(): LanguageJourney {
      return {
         language: 'French',
         platform: 'Duolingo',
         startedLabel: 'March 2026',
         asOfIso: '2026-10-03',
         asOfLabel: '3 Oct 2026',
         headline: 'Learning French, one day at a time',
         why: 'Akhigbe Iruobe has studied French every day since March 2026. The reason is practical: Francophone Africa — Abidjan, Dakar, Cotonou, Lomé — is building its banking and payments rails right now, and he wants to work on them in French, not through a translator. It is the same habit that ships software: show up daily, fix the mistakes, protect the streak.',
         stats: [
            { value: '94', label: 'Day streak', detail: 'Longest so far' },
            { value: '15,031', label: 'Total XP' },
            { value: 'Obsidian', label: 'League', detail: 'Second-highest tier' },
            { value: '#4', label: 'Best league finish', detail: 'Aug 2026' },
            { value: '634', label: 'XP in one day', detail: 'Personal best' },
            { value: '5 of 7', label: 'Monthly badges', detail: 'Mar – Sep 2026' },
         ],
         months: [
            { label: 'Mar', state: 'earned' },
            { label: 'Apr', state: 'earned' },
            { label: 'May', state: 'missed' },
            { label: 'Jun', state: 'missed' },
            { label: 'Jul', state: 'earned' },
            { label: 'Aug', state: 'earned' },
            { label: 'Sep', state: 'earned' },
            { label: 'Oct', state: 'current' },
         ],
         achievements: [
            { name: 'Cheerleader', progress: '5 of 5', note: 'Maxed — cheering on friends' },
            { name: 'Early Riser', progress: '9 of 10', note: 'Morning lessons' },
            { name: 'XP Olympian', progress: '8 of 10', note: '12,500 XP tier' },
            { name: 'Flawless Finisher', progress: '4 of 5', note: 'Lessons with no mistakes' },
         ],
         words: ['bien', 'très', 'cherche', 'viens', 'suis', 'oui', 'moi', 'toi'],
      };
   }
}
