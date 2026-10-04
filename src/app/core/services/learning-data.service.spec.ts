import { LearningDataService } from './learning-data.service';

describe('LearningDataService', () => {
   const journey = new LearningDataService().getFrenchJourney();

   it('should date every figure with a valid as-of date', () => {
      expect(Number.isNaN(Date.parse(journey.asOfIso))).toBeFalse();
      expect(journey.asOfLabel.trim()).not.toBe('');
   });

   it('should speak in the first person — the card is Akhigbe talking about himself', () => {
      expect(journey.intro.startsWith('I ')).toBeTrue();
      expect(journey.intro).not.toContain('Akhigbe Iruobe has');
   });

   // The stat chip and the badge strip are written separately; this keeps them telling the same story.
   it('should report the same monthly-badge count in the stat and the badge strip', () => {
      const earned = journey.months.filter(m => m.state === 'earned').length;
      const settled = journey.months.filter(m => m.state !== 'current').length;
      expect(journey.stats.find(s => s.label === 'Monthly badges')?.value).toBe(`${earned} of ${settled}`);
   });

   it('should keep the hero streak and the longest-streak record in agreement', () => {
      expect(journey.records.find(r => r.label === 'Longest streak')?.value).toBe(String(journey.streak.days));
   });

   it('should have at most one in-progress month, and it should be the last', () => {
      const current = journey.months.filter(m => m.state === 'current');
      expect(current.length).toBeLessThanOrEqual(1);
      if (current.length) expect(journey.months.at(-1)?.state).toBe('current');
   });

   it('should point every badge at the cut-outs in assets/img/duolingo', () => {
      const images = [journey.streak.image, ...journey.records.map(r => r.image), ...journey.months.map(m => m.image), ...journey.awards.map(a => a.image)];
      images.forEach(src => expect(src).toMatch(/^\/assets\/img\/duolingo\/[a-z-]+\.png$/));
   });

   it('should never show a level above its maximum', () => {
      journey.awards.filter(a => a.level !== undefined).forEach(a => {
         expect(a.level!).withContext(a.name).toBeLessThanOrEqual(a.levels!);
      });
   });
});
