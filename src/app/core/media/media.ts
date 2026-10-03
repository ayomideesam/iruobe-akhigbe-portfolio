import { MEDIA_MANIFEST } from './media-manifest';
import { ManifestImage, ManifestLogo, ManifestVideo, MediaManifest } from './media.types';

/** Manifest keys carry no leading slash; app code uses both `/assets/…` and `assets/…`. */
const key = (path: string): string => path.replace(/^\/+/, '');

export const imageEntry = (path: string, manifest: MediaManifest = MEDIA_MANIFEST): ManifestImage | null =>
   manifest.images[key(path)] ?? null;

export const logoEntry = (path: string, manifest: MediaManifest = MEDIA_MANIFEST): ManifestLogo | null =>
   manifest.logos[key(path)] ?? null;

export const videoEntry = (path: string, manifest: MediaManifest = MEDIA_MANIFEST): ManifestVideo | null =>
   manifest.videos[key(path)] ?? null;

/** What the visitor's browser and connection can comfortably take. */
export interface VideoCapabilities {
   /** Phone-sized viewport, Data Saver on, or a 2G/3G-class connection. */
   small: boolean;
   /** The browser reports it can decode AV1 in MP4. */
   av1: boolean;
}

/**
 * Picks the lightest ambient-film file that still looks right: AV1 where it decodes (about half the
 * bytes of H.264 at the same quality), 480p on phones and slow links. Falls back to the master when
 * the manifest has no entry, so a newly added video still plays before the pipeline is re-run.
 */
export function pickVideoSource(path: string, caps: VideoCapabilities, manifest: MediaManifest = MEDIA_MANIFEST): string {
   const entry = videoEntry(path, manifest);
   if (!entry) return path;
   if (caps.av1) return caps.small ? entry.av1_480 : entry.av1_720;
   return caps.small ? entry.h264_480 : entry.h264_720;
}

interface NetworkInformationLike { saveData?: boolean; effectiveType?: string; }

/** Browser probe for {@link pickVideoSource}; the Network Information API is Chromium-only, so it's optional. */
export function detectVideoCapabilities(probe: HTMLVideoElement): VideoCapabilities {
   const connection = (navigator as Navigator & { connection?: NetworkInformationLike }).connection;
   const slowLink = !!connection && (connection.saveData === true || /(^|-)(2g|3g)$/.test(connection.effectiveType ?? ''));
   return {
      small: slowLink || window.matchMedia('(max-width: 768px)').matches,
      av1: probe.canPlayType('video/mp4; codecs="av01.0.05M.08"') !== '',
   };
}
