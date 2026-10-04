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

    it('should stay readable: at most 5 highlights and 10 bullets in all per role', () => {
      for (const job of jobs) {
        expect(job.achievements!.length, job.role).toBeLessThanOrEqual(5);
        const total = (job.achievements?.length ?? 0) + (job.technicalAchievements?.length ?? 0) + (job.technicalLeadership?.length ?? 0);
        expect(total, job.role).toBeLessThanOrEqual(10);
      }
    });

    it('should show each promotion as its own role, newest first', () => {
      const roles = (company: string) => jobs.filter(j => j.company.startsWith(company)).map(j => j.role);
      expect(roles('Globus')).toEqual(['Senior Frontend Engineer (A.B.O grade)', 'Senior Frontend Engineer (S.E.A grade)']);
      expect(roles('Zenith')).toEqual(['Frontend Team Lead', 'Senior Frontend Engineer']);
    });

    it('should not reintroduce claims the code or the proof disproves', () => {
      const text = JSON.stringify(jobs) + service.getKeyTechnicalAchievements().join(' ');
      expect(text).not.toMatch(/committee voting|veto|quorum|WebSocket|SWIFT|velocity by|code quality by|19% to 85/i);
      // The Zenith PMO slides: velocity 8 → 28 points, completion 19% → 69%.
      expect(text).toMatch(/8 to 28 points/);
      expect(text).toMatch(/19% to 69%/);
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

  describe('getLanguages() and getHobbies()', () => {
    it('should rate French 3.5 of 5 and keep every level within 0–5 in half steps', () => {
      const langs = service.getLanguages();
      expect(langs.find(l => l.name === 'French')?.level).toBe(3.5);
      for (const l of langs) {
        expect(l.level).toBeGreaterThanOrEqual(0);
        expect(l.level).toBeLessThanOrEqual(5);
        expect(l.level * 2 % 1).toBe(0);
      }
    });

    it('should list hobbies for both PDFs and the page', () => {
      expect(service.getHobbies().length).toBeGreaterThan(0);
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
