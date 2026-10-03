/**
 * Shape of the manifest written by scripts/optimize-media.mjs. Keys are master paths as the app
 * references them, without a leading slash (e.g. `assets/img/nxp-overview.png`); values are the
 * content-hashed outputs under /assets/media.
 */
export interface ManifestImage {
   /** Intrinsic size of the master, for width/height attributes. */
   width: number;
   height: number;
   /** `srcset` strings, e.g. `/assets/media/img/x-640.<hash>.avif 640w, …`. */
   avif: string;
   webp: string;
   /** 1280 px (or smaller) JPEG for the `<img src>` inside `<picture>`. */
   fallback: string;
   /** Master hash + encoder settings; lets the pipeline skip unchanged media. */
   source: string;
}

export interface ManifestLogo {
   src: string;
   width: number;
   height: number;
   source: string;
}

export interface ManifestVideo {
   poster: string;
   h264_720: string;
   h264_480: string;
   av1_720: string;
   av1_480: string;
   source: string;
}

export interface MediaManifest {
   images: Record<string, ManifestImage>;
   logos: Record<string, ManifestLogo>;
   videos: Record<string, ManifestVideo>;
}
