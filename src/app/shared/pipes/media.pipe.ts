import { Pipe, PipeTransform } from '@angular/core';
import { imageEntry, logoEntry, videoEntry } from 'src/app/core/media/media';

export type MediaKind = 'avif' | 'webp' | 'src' | 'logo' | 'poster';

/**
 * Resolves a master asset path to its optimised output from the media manifest
 * (scripts/optimize-media.mjs). Pure, so each binding is computed once per input.
 *
 *   'avif' | 'webp'  → a `srcset` string, or null so the `<source>` drops out
 *   'src'            → the JPEG fallback for `<img src>`, or the master itself
 *   'logo'           → the rasterised WebP for a heavy SVG logo, or the master SVG
 *   'poster'         → a video's WebP poster, or `fallback`
 *
 * Unknown paths degrade to the master, so new media still renders before the pipeline is re-run.
 */
@Pipe({ name: 'media', standalone: false })
export class MediaPipe implements PipeTransform {
   transform(path: string | null | undefined, kind: MediaKind, fallback?: string): string | null {
      if (!path) return fallback ?? null;
      switch (kind) {
         case 'avif': return imageEntry(path)?.avif ?? null;
         case 'webp': return imageEntry(path)?.webp ?? null;
         case 'src': return imageEntry(path)?.fallback ?? path;
         case 'logo': return logoEntry(path)?.src ?? path;
         case 'poster': return videoEntry(path)?.poster ?? fallback ?? null;
      }
   }
}
