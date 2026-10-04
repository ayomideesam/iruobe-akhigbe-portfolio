import { ResumeDataService } from './resume-data.service';

// The resume page, its visual PDF and the ATS PDF all read this service, so
// these are the contracts all three depend on.
describe('ResumeDataService', () => {
  const service = new ResumeDataService();

  describe('getEmploymentHistory()', () => {
    const jobs = service.getEmploymentHistory();

    it('should give every job a company, role, location and a "Mon YYYY — …" period', () => {
      for (const job of jobs) {
        expect(job.company.trim()).not.toBe('');
        expect(job.role.trim()).not.toBe('');
        expect(job.location.trim()).not.toBe('');
        expect(job.period).toMatch(/^[A-Z][a-z]{2,3} \d{4} — ([A-Z][a-z]{2,3} \d{4}|Present)$/);
      }
    });

    it('should list exactly one current role, first', () => {
      expect(jobs.filter(j => j.period.endsWith('Present')).length).toBe(1);
      expect(jobs[0].period).toContain('Present');
    });

    it('should keep the CV to two pages: at most 6 highlights for the current role and 4 for earlier ones', () => {
      expect(jobs[0].achievements!.length).toBeLessThanOrEqual(6);
      for (const job of jobs.slice(1)) expect(job.achievements!.length).toBeLessThanOrEqual(4);
    });

    it('should not reintroduce claims the code disproves (2026-10-04 review)', () => {
      const text = JSON.stringify(jobs) + service.getKeyTechnicalAchievements().join(' ');
      expect(text).not.toMatch(/committee voting|veto|quorum|WebSocket|SWIFT|velocity by|code quality by/i);
    });
  });

  describe('getSkills()', () => {
    it('should group skills into Expert, Proficient, Working and AI-augmented tiers, in that order', () => {
      expect(service.getSkills().map(t => t.tier)).toEqual(['Expert', 'Proficient', 'Working', 'AI-augmented delivery']);
    });

    it('should place React and Next.js as Proficient and Vue and Node as Working', () => {
      const tierOf = (name: string) => service.getSkills().find(t => t.skills.some(s => s.startsWith(name)))?.tier;
      expect(tierOf('React')).toBe('Proficient');
      expect(tierOf('Next.js')).toBe('Proficient');
      expect(tierOf('Vue.js')).toBe('Working');
      expect(tierOf('Node.js')).toBe('Working');
    });
  });

  describe('getReferences()', () => {
    it("should carry names and companies only, never a referee's contact details", () => {
      for (const ref of service.getReferences()) {
        expect(Object.keys(ref).sort()).toEqual(['company', 'name']);
      }
    });
  });

  describe('getProfile()', () => {
    it("should name the candidate's Angular depth and AI-augmented workflow in under 120 words per paragraph", () => {
      const { paragraphs, availability } = service.getProfile();
      expect(paragraphs.join(' ')).toMatch(/Angular/);
      expect(paragraphs.join(' ')).toMatch(/Claude Opus 5\.5/);
      for (const p of paragraphs) expect(p.split(/\s+/).length).toBeLessThan(120);
      expect(availability).toMatch(/Lagos/);
    });
  });
});
