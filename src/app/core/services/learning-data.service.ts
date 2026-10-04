import { Injectable } from '@angular/core';

export interface LearningStat {
   value: string;
   label: string;
}

/** A Duolingo personal record, shown with its badge from the profile. */
export interface LearningRecord {
   value: string;
   label: string;
   date: string;
   image: string;
}

export interface LearningMonth {
   label: string;
   name: string;
   state: 'earned' | 'missed' | 'current';
   image: string;
}

export interface LearningAward {
   name: string;
   /** The tier number printed on the badge, e.g. 150 for Early Riser. */
   tier?: string;
   level?: number;
   levels?: number;
   note: string;
   image: string;
}

export interface LanguageJourney {
   language: string;
   platform: string;
   startedLabel: string;
   /** Every figure below is a snapshot from this date — update it with the numbers. */
   asOfIso: string;
   asOfLabel: string;
   headline: string;
   intro: string;
   streak: { days: number; label: string; image: string };
   stats: LearningStat[];
   records: LearningRecord[];
   months: LearningMonth[];
   awards: LearningAward[];
   words: string[];
}

/**
 * Akhigbe's French progress, centralised like project data so the home card, the projects panel
 * and the resume never disagree. Figures and badge artwork come from his own Duolingo profile
 * (3 Oct 2026). Only claims visible there are made — no CEFR level. Badge paths stay literal so
 * scripts/optimize-media.mjs can find and compress them.
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
         intro: 'I have practised French every day since March 2026, and the reason is practical. Francophone Africa — Abidjan, Dakar, Cotonou, Lomé — is building its banking and payment rails right now, and I want to help build them in French, not through a translator. It is the same habit that ships software: show up daily, fix the mistakes, protect the streak.',
         streak: { days: 94, label: 'day streak — my longest yet', image: '/assets/img/duolingo/record-streak.png' },
         stats: [
            { value: '15,031', label: 'Total XP' },
            { value: 'Obsidian', label: 'Current league' },
            { value: '5 of 7', label: 'Monthly badges' },
         ],
         records: [
            { value: '94', label: 'Longest streak', date: 'Oct 2026', image: '/assets/img/duolingo/record-streak.png' },
            { value: '#4', label: 'Highest league finish', date: 'Aug 2026', image: '/assets/img/duolingo/record-league.png' },
            { value: '634', label: 'Most XP in a day', date: 'Mar 2026', image: '/assets/img/duolingo/record-most-xp.png' },
            { value: '16', label: 'Perfect lessons in a day', date: 'Mar 2026', image: '/assets/img/duolingo/record-perfect-lessons.png' },
         ],
         months: [
            { label: 'Mar', name: 'March', state: 'earned', image: '/assets/img/duolingo/month-mar.png' },
            { label: 'Apr', name: 'April', state: 'earned', image: '/assets/img/duolingo/month-apr.png' },
            { label: 'May', name: 'May', state: 'missed', image: '/assets/img/duolingo/month-may.png' },
            { label: 'Jun', name: 'June', state: 'missed', image: '/assets/img/duolingo/month-jun.png' },
            { label: 'Jul', name: 'July', state: 'earned', image: '/assets/img/duolingo/month-jul.png' },
            { label: 'Aug', name: 'August', state: 'earned', image: '/assets/img/duolingo/month-aug.png' },
            { label: 'Sep', name: 'September', state: 'earned', image: '/assets/img/duolingo/month-sep.png' },
            { label: 'Oct', name: 'October', state: 'current', image: '/assets/img/duolingo/month-oct.png' },
         ],
         awards: [
            { name: 'Cheerleader', tier: '100', level: 5, levels: 5, note: 'Maxed out', image: '/assets/img/duolingo/award-cheerleader.png' },
            { name: 'Early Riser', tier: '150', level: 9, levels: 10, note: 'Morning lessons', image: '/assets/img/duolingo/award-early-riser.png' },
            { name: 'XP Olympian', tier: '12,500', level: 8, levels: 10, note: 'XP earned', image: '/assets/img/duolingo/award-xp-olympian.png' },
            { name: 'Speed Racer', tier: '1000', level: 4, levels: 5, note: 'Timed practice', image: '/assets/img/duolingo/award-speed-racer.png' },
            { name: 'Flawless Finisher', tier: '50', level: 4, levels: 5, note: 'Lessons with no mistakes', image: '/assets/img/duolingo/award-flawless-finisher.png' },
            { name: 'Sleepwalker', tier: '75', level: 7, levels: 10, note: 'Late-night lessons', image: '/assets/img/duolingo/award-sleepwalker.png' },
            { name: 'Perfect Week', tier: '15', level: 5, levels: 9, note: 'Practised every day of the week', image: '/assets/img/duolingo/award-perfect-week.png' },
            { name: 'Mistake Mechanic', tier: '100', level: 5, levels: 10, note: 'Mistakes reviewed and fixed', image: '/assets/img/duolingo/award-mistake-mechanic.png' },
            { name: 'Quest Explorer', tier: '100', level: 5, levels: 10, note: 'Quests completed', image: '/assets/img/duolingo/award-quest-explorer.png' },
            { name: 'Legend', tier: '25', level: 4, levels: 10, note: 'Legendary levels', image: '/assets/img/duolingo/award-legend.png' },
            { name: 'League MVP', note: 'League award', image: '/assets/img/duolingo/award-league-mvp.png' },
            { name: 'Social Butterfly', note: 'Friends & social', image: '/assets/img/duolingo/award-social-butterfly.png' },
         ],
         words: ['bien', 'très', 'cherche', 'viens', 'suis', 'oui', 'moi', 'toi'],
      };
   }
}
