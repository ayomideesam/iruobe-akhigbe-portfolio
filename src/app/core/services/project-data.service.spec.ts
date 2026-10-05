import { ChangeDetectorRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ProjectDataService } from './project-data.service';
import { ProjectsComponent } from 'src/app/pages/projects/components/projects.component';
import { videoEntry } from 'src/app/core/media/media';

describe('ProjectDataService', () => {
   let service: ProjectDataService;

   beforeEach(() => {
      TestBed.configureTestingModule({
         providers: [
            provideRouter([]),
            // ProjectsComponent is built outside a view below; it only needs CD for the lightbox.
            { provide: ChangeDetectorRef, useValue: { detectChanges: () => undefined } },
         ],
      });
      service = TestBed.inject(ProjectDataService);
   });

   describe('getProjects()', () => {
      it('should expose unique ids, since they become #project-{id} anchors', () => {
         const ids = service.getProjects().map(p => p.id);
         expect(new Set(ids).size).toBe(ids.length);
      });

      it('should give every project a title, a description naming Akhigbe Iruobe, and achievements', () => {
         service.getProjects().forEach(p => {
            expect(p.title.trim(), `title for ${p.id}`).not.toBe('');
            expect(p.description, `description for ${p.id}`).toContain('Akhigbe Iruobe');
            expect(p.achievements.length, `achievements for ${p.id}`).toBeGreaterThan(0);
         });
      });

      // The scene template reads images[0] and images[1] unconditionally.
      it('should give every project at least two preview images', () => {
         service.getProjects().forEach(p => {
            expect(p.images?.length ?? 0, `images for ${p.id}`).toBeGreaterThanOrEqual(2);
         });
      });

      it('should give every project stats and a pipeline for the scene rail', () => {
         service.getProjects().forEach(p => {
            expect(p.stats?.length ?? 0, `stats for ${p.id}`).toBeGreaterThan(0);
            expect(p.pipeline?.length ?? 0, `pipeline for ${p.id}`).toBeGreaterThan(0);
         });
      });

      // Akhigbe's own ordering: most recent first (set 2026-10-04).
      it('should give every project an "Under the hood" panel: codebase facts and grouped engineering detail', () => {
         for (const p of service.getProjects()) {
            expect(p.codebase?.length, p.title).toBeGreaterThan(0);
            expect(p.engineering?.length, p.title).toBeGreaterThan(0);
            for (const group of p.engineering!) {
               expect(group.area.trim(), p.title).not.toBe('');
               expect(group.points.length, `${p.title} / ${group.area}`).toBeGreaterThan(0);
            }
         }
      });

      it('should not reintroduce figures that could not be backed (2026-10-05 clean-up)', () => {
         const text = JSON.stringify(service.getProjects());
         for (const banned of ['Angular Universal', '99.9%', '10,000+', '8 Middle Eastern', '90%+', 'by 60%', 'by 65%', 'average of 50%', 'NestJS', 'zero post-launch', '11 vulnerability']) {
            expect(text, banned).not.toContain(banned);
         }
      });

      it('should quote the Zenith sprint figures from the PMO slides (19% → 69%), never 85%', () => {
         const text = JSON.stringify(service.getProjects());
         expect(text).not.toMatch(/19% to 85|19→85/);
         expect(text).toMatch(/19% to 69%/);
      });

      it('should list the flagships in the order Akhigbe set, most recent first', () => {
         expect(service.getProjects().map(p => p.id)).toEqual([7, 6, 3, 2, 1, 4, 5]);
      });
   });

   describe('ProjectsComponent scene metadata', () => {
      // A project without a sceneMeta entry silently falls back to an empty
      // video/poster, leaving its scene without the ambient film.
      it('should map every project id to its own ambient film and poster', () => {
         const component = TestBed.runInInjectionContext(() => new ProjectsComponent());
         service.getProjects().forEach(p => {
            const meta = component.getSceneMeta(p.id);
            expect(meta.video, `video for ${p.id}`).toMatch(/^assets\/video\/fp-[a-z]+\.mp4$/);
            expect(meta.poster, `poster for ${p.id}`).toMatch(/^assets\/video\/fp-[a-z]+\.jpg$/);
            expect(videoEntry(meta.video), `${meta.video} — run npm run optimize:media`).not.toBeNull();
         });
      });
   });
});
