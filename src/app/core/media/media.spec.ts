import { imageEntry, pickVideoSource } from './media';
import { MediaManifest } from './media.types';
import { MediaPipe } from 'src/app/shared/pipes/media.pipe';
import { MEDIA_MANIFEST } from './media-manifest';
import { ProjectDataService } from '../services/project-data.service';

const manifest: MediaManifest = {
   images: {
      'assets/img/shot.png': {
         width: 2956, height: 1662,
         avif: '/assets/media/img/shot-640.a.avif 640w, /assets/media/img/shot-1280.b.avif 1280w',
         webp: '/assets/media/img/shot-640.c.webp 640w, /assets/media/img/shot-1280.d.webp 1280w',
         fallback: '/assets/media/img/shot-1280.e.jpg',
         source: 'x',
      },
   },
   logos: {},
   videos: {
      'assets/video/fp-x.mp4': {
         poster: '/p.webp', h264_720: '/h720.mp4', h264_480: '/h480.mp4', av1_720: '/a720.mp4', av1_480: '/a480.mp4', source: 'x',
      },
   },
};

describe('media', () => {
   describe('imageEntry()', () => {
      it('should resolve app paths with or without a leading slash', () => {
         expect(imageEntry('/assets/img/shot.png', manifest)).toBe(manifest.images['assets/img/shot.png']);
         expect(imageEntry('assets/img/shot.png', manifest)).toBe(manifest.images['assets/img/shot.png']);
      });

      it('should return null for media the pipeline has not seen', () => {
         expect(imageEntry('/assets/img/new.png', manifest)).toBeNull();
      });
   });

   describe('pickVideoSource()', () => {
      const path = 'assets/video/fp-x.mp4';

      it('should prefer AV1 where the browser decodes it', () => {
         expect(pickVideoSource(path, { small: false, av1: true }, manifest)).toBe('/a720.mp4');
         expect(pickVideoSource(path, { small: true, av1: true }, manifest)).toBe('/a480.mp4');
      });

      it('should fall back to H.264, 480p on phones and slow links', () => {
         expect(pickVideoSource(path, { small: false, av1: false }, manifest)).toBe('/h720.mp4');
         expect(pickVideoSource(path, { small: true, av1: false }, manifest)).toBe('/h480.mp4');
      });

      it('should play the master when the manifest has no entry yet', () => {
         expect(pickVideoSource('assets/video/new.mp4', { small: true, av1: true }, manifest)).toBe('assets/video/new.mp4');
      });
   });

   describe('MediaPipe', () => {
      const pipe = new MediaPipe();

      it('should degrade unknown images to the master and drop the <source> srcsets', () => {
         expect(pipe.transform('/assets/img/not-optimised.png', 'src')).toBe('/assets/img/not-optimised.png');
         expect(pipe.transform('/assets/img/not-optimised.png', 'avif')).toBeNull();
      });

      it('should use the poster fallback when a video is not in the manifest', () => {
         expect(pipe.transform('assets/video/none.mp4', 'poster', 'assets/video/none.jpg')).toBe('assets/video/none.jpg');
      });
   });

   // Guards the workflow: a screenshot added to project data without re-running
   // `npm run optimize:media` would silently ship the multi-MB master to phones.
   describe('generated manifest coverage', () => {
      it('should have optimised variants for every flagship preview image', () => {
         new ProjectDataService().getProjects().forEach(p => {
            (p.images as string[]).forEach(img => {
               const entry = imageEntry(img);
               expect(entry, `${img} — run npm run optimize:media`).not.toBeNull();
               expect(entry?.avif, img).toContain('w,');
            });
         });
      });

      it('should point every entry at a hashed file under /assets/media', () => {
         Object.values(MEDIA_MANIFEST.images).forEach(e => {
            expect(e.fallback).toMatch(/^\/assets\/media\/img\/.+\.[0-9a-f]{10}\.(jpg|png)$/);
         });
      });
   });
});
