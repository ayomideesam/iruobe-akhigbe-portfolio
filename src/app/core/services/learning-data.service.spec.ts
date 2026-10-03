import { LearningDataService } from './learning-data.service';

describe('LearningDataService', () => {
   const journey = new LearningDataService().getFrenchJourney();

   it('should date every figure with a valid as-of date', () => {
      expect(Number.isNaN(Date.parse(journey.asOfIso))).toBeFalse();
      expect(journey.asOfLabel.trim()).not.toBe('');
   });

   it('should name Akhigbe Iruobe in the copy, per the portfolio SEO content rules', () => {
      expect(journey.why).toContain('Akhigbe Iruobe');
   });

   // The badge tile and the month strip are written separately; this keeps them telling the same story.
   it('should report the same monthly-badge count in the stat tile and the month strip', () => {
      const earned = journey.months.filter(m => m.state === 'earned').length;
      const settled = journey.months.filter(m => m.state !== 'current').length;
      const tile = journey.stats.find(s => s.label === 'Monthly badges');
      expect(tile?.value).toBe(`${earned} of ${settled}`);
   });

   it('should expose the three stats the compact panel relies on', () => {
      const labels = journey.stats.map(s => s.label);
      ['Day streak', 'Total XP', 'League'].forEach(l => expect(labels).toContain(l));
   });

   it('should have at most one in-progress month, and it should be the last', () => {
      const current = journey.months.filter(m => m.state === 'current');
      expect(current.length).toBeLessThanOrEqual(1);
      if (current.length) expect(journey.months.at(-1)?.state).toBe('current');
   });
});
