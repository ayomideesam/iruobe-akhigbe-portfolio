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

      it('should list Trade Export and Trade Import as separate, adjacent flagships', () => {
         const ids = service.getProjects().map(p => p.id);
         const exportIdx = ids.indexOf(7);
         const importIdx = ids.indexOf(2);
         expect(exportIdx).toBeGreaterThanOrEqual(0);
         expect(importIdx).toBe(exportIdx + 1);
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
