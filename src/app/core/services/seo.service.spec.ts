import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { SeoService } from './seo.service';
import { ServicesDataService } from './services-data.service';

/** Reads back the single JSON-LD block the service is allowed to emit. */
function readJsonLd(): any {
   const blocks = document.querySelectorAll('script[type="application/ld+json"]');
   expect(blocks.length).withContext('exactly one JSON-LD block may exist').toBe(1);
   return JSON.parse(blocks[0].textContent || '{}');
}

describe('SeoService', () => {
   let seo: SeoService;
   let data: ServicesDataService;

   beforeEach(() => {
      TestBed.configureTestingModule({ imports: [RouterTestingModule] });
      seo = TestBed.inject(SeoService);
      data = TestBed.inject(ServicesDataService);
      document.getElementById('ld-json-dynamic')?.remove();
      document.getElementById('ld-json-static')?.remove();
   });

   afterEach(() => {
      document.getElementById('ld-json-dynamic')?.remove();
   });

   describe('setServicesSeo()', () => {
      beforeEach(() => seo.setServicesSeo(data.getServices(), data.getFaqs()));

      it('should emit a single JSON-LD block containing WebPage, OfferCatalog and FAQPage', () => {
         const graph = readJsonLd()['@graph'];
         const types = graph.map((node: any) => node['@type']);

         expect(types).toContain('WebPage');
         expect(types).toContain('OfferCatalog');
         expect(types).toContain('FAQPage');
      });

      it('should not stack a second block when another route is visited afterwards', () => {
         seo.setHomeSeo();
         expect(document.querySelectorAll('script[type="application/ld+json"]').length).toBe(1);
      });

      it('should attribute every Service to the shared Person @id', () => {
         const graph = readJsonLd()['@graph'];
         const catalogue = graph.find((n: any) => n['@type'] === 'OfferCatalog');

         expect(catalogue.itemListElement.length).toBe(data.getServices().length);
         catalogue.itemListElement.forEach((offer: any) => {
            expect(offer.itemOffered.provider['@id'])
               .toBe('https://iruobeakhigbe.netlify.app/#person');
         });
      });

      it('should emit one Question per FAQ with an accepted answer', () => {
         const graph = readJsonLd()['@graph'];
         const faqPage = graph.find((n: any) => n['@type'] === 'FAQPage');

         expect(faqPage.mainEntity.length).toBe(data.getFaqs().length);
         faqPage.mainEntity.forEach((q: any) => {
            expect(q['@type']).toBe('Question');
            expect(q.acceptedAnswer.text.length).toBeGreaterThan(0);
         });
      });

      it('should set the canonical link to the services route', () => {
         expect(document.querySelector('link[rel="canonical"]')?.getAttribute('href'))
            .toBe('https://iruobeakhigbe.netlify.app/services');
      });

      it('should set og:image dimensions, which LinkedIn requires to render a card', () => {
         expect(document.querySelector('meta[property="og:image:width"]')?.getAttribute('content')).toBe('1200');
         expect(document.querySelector('meta[property="og:image:height"]')?.getAttribute('content')).toBe('630');
      });

      it('should name Akhigbe Iruobe inside the first 60 characters of the description', () => {
         const description = document.querySelector('meta[name="description"]')?.getAttribute('content') || '';
         expect(description.slice(0, 60)).toContain('Akhigbe Iruobe');
      });

      it('should stay indexable', () => {
         const robots = document.querySelector('meta[name="robots"]')?.getAttribute('content') || '';
         expect(robots).toContain('index');
         expect(robots).not.toContain('noindex');
      });
   });

   describe('setHomeSeo()', () => {
      it('should emit ProfilePage schema with the Person @id on the home route', () => {
         seo.setHomeSeo();
         const schema = readJsonLd();

         expect(schema['@type']).toBe('ProfilePage');
         expect(schema.mainEntity['@id']).toBe('https://iruobeakhigbe.netlify.app/#person');
      });

      it('should include every alternateName variant used for disambiguation', () => {
         seo.setHomeSeo();
         const names = readJsonLd().mainEntity.alternateName;

         expect(names).toContain('Iruobe Akhigbe Ayomide');
         expect(names).toContain('Akhigbe Ayomide Iruobe');
         expect(names).toContain('Akhigbe Iruobe Ayomide');
      });
   });
});
