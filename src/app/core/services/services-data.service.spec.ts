import { TestBed } from '@angular/core/testing';
import { ServicesDataService } from './services-data.service';

describe('ServicesDataService', () => {
   let service: ServicesDataService;

   beforeEach(() => {
      TestBed.configureTestingModule({});
      service = TestBed.inject(ServicesDataService);
   });

   describe('getServices()', () => {
      it('should return every offering with a non-empty title, promise and proof', () => {
         const services = service.getServices();

         expect(services.length).toBeGreaterThan(0);
         services.forEach(s => {
            expect(s.title.trim()).withContext(`title for ${s.key}`).not.toBe('');
            expect(s.promise.trim()).withContext(`promise for ${s.key}`).not.toBe('');
            expect(s.proof.trim()).withContext(`proof for ${s.key}`).not.toBe('');
            expect(s.deliverables.length).withContext(`deliverables for ${s.key}`).toBeGreaterThan(0);
         });
      });

      it('should expose unique keys, since they become schema.org @id fragments', () => {
         const keys = service.getServices().map(s => s.key);
         expect(new Set(keys).size).toBe(keys.length);
      });

      it('should give every offering an accentRgb parseable as an rgba() triplet', () => {
         service.getServices().forEach(s => {
            expect(s.accentRgb).withContext(`accentRgb for ${s.key}`).toMatch(/^\d{1,3},\s*\d{1,3},\s*\d{1,3}$/);
         });
      });

      it('should mark exactly one offering as featured', () => {
         const featured = service.getServices().filter(s => s.featured);
         expect(featured.length).toBe(1);
         expect(featured[0].key).toBe('ai-enablement');
      });
   });

   describe('getFaqs()', () => {
      it('should return questions and answers that are all populated', () => {
         const faqs = service.getFaqs();

         expect(faqs.length).toBeGreaterThan(0);
         faqs.forEach(f => {
            expect(f.question.trim()).not.toBe('');
            expect(f.answer.trim().length).toBeGreaterThan(20);
         });
      });

      it('should not publish a specific price, since pricing is scoped on the call', () => {
         const answers = service.getFaqs().map(f => f.answer).join(' ');
         expect(answers).not.toMatch(/₦\s?[\d,]+/);
         expect(answers).not.toMatch(/\$\s?[\d,]+/);
      });
   });

   describe('getIndustries()', () => {
      it('should give every sector at least one pain and a build description', () => {
         const industries = service.getIndustries();

         expect(industries.length).toBeGreaterThan(0);
         industries.forEach(i => {
            expect(i.sector.trim()).not.toBe('');
            expect(i.pains.length).toBeGreaterThan(0);
            expect(i.builds.trim()).not.toBe('');
         });
      });
   });

   describe('getAiArtifacts()', () => {
      it('should give every non-directory artifact a purpose', () => {
         service.getAiArtifacts()
            .filter(a => !a.dir)
            .forEach(a => expect(a.purpose.trim()).withContext(a.path).not.toBe(''));
      });

      it('should only use depths the template can indent', () => {
         service.getAiArtifacts().forEach(a => expect([0, 1]).toContain(a.depth));
      });
   });

   describe('getProcess()', () => {
      it('should return sequentially numbered steps', () => {
         const steps = service.getProcess();
         steps.forEach((s, i) => expect(s.step).toBe(String(i + 1).padStart(2, '0')));
      });
   });

   describe('getEngagementModels()', () => {
      it('should describe each model without quoting a figure', () => {
         const models = service.getEngagementModels();

         expect(models.length).toBe(3);
         models.forEach(m => {
            expect(m.bestFor.trim()).not.toBe('');
            expect(m.points.length).toBeGreaterThan(0);
            expect(m.points.join(' ')).not.toMatch(/₦|\$\d/);
         });
      });
   });
});
