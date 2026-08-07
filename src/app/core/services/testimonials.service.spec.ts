import { TestBed } from '@angular/core/testing';
import { TestimonialsService } from './testimonials.service';

describe('TestimonialsService', () => {
   let service: TestimonialsService;

   beforeEach(() => {
      TestBed.configureTestingModule({});
      service = TestBed.inject(TestimonialsService);
   });

   describe('getTestimonials()', () => {
      it('should return recommendations with every display field populated', () => {
         const testimonials = service.getTestimonials();

         expect(testimonials.length).toBeGreaterThan(0);
         testimonials.forEach(t => {
            expect(t.quote.trim().length).withContext(`quote for ${t.author}`).toBeGreaterThan(40);
            expect(t.author.trim()).not.toBe('');
            expect(t.role.trim()).not.toBe('');
            expect(t.company.trim()).not.toBe('');
            expect(t.relationship.trim()).not.toBe('');
         });
      });

      it('should derive initials that match the author name', () => {
         service.getTestimonials().forEach(t => {
            expect(t.initials.length).withContext(t.author).toBe(2);
            expect(t.initials[0]).toBe(t.author[0]);
         });
      });

      it('should not contain duplicate authors', () => {
         const authors = service.getTestimonials().map(t => t.author);
         expect(new Set(authors).size).toBe(authors.length);
      });
   });

   describe('getGradient()', () => {
      it('should wrap around rather than return undefined past the palette length', () => {
         const first = service.getGradient(0);
         expect(service.getGradient(5)).toBe(first);
         expect(service.getGradient(10)).toBe(first);
      });

      it('should return a gradient for every testimonial index', () => {
         service.getTestimonials().forEach((_, i) => {
            expect(service.getGradient(i)).toMatch(/^linear-gradient\(/);
         });
      });
   });
});
