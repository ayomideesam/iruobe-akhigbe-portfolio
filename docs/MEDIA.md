# Media pipeline

Every image, heavy logo and ambient film the site references is compressed by
`scripts/optimize-media.mjs` and served from `src/assets/media/` under content-hashed names. The goal
is a portfolio that stays usable on slow networks anywhere, without visibly softening screenshots.

## Adding or replacing media

1. Put the **master** where it has always lived — `src/assets/img/`, `src/assets/logos/` or
   `src/assets/video/` (a video's poster is the `.jpg` with the same name next to it).
2. Reference the master path from code as usual (`project-data.service.ts`, `sceneMeta`, …).
3. Run:

   ```bash
   npm run optimize:media
   ```

4. Commit the master, the new files in `src/assets/media/` and `src/app/core/media/media-manifest.ts`.

`npm test` fails if a flagship preview image or scene film has no manifest entry, so a forgotten run
is caught before it ships a multi-MB master to phones. Until the script runs, new media still renders
(the `media` pipe falls back to the master) — it just isn't optimised.

Videos need ffmpeg with the SVT-AV1 encoder: `brew install ffmpeg`, or point `FFMPEG_PATH` at a
binary. `npm run optimize:media -- --skip-video` handles images and logos without it.

## What it produces

| Input | Output | Why |
|---|---|---|
| Screenshots and photos (`.png`, `.jpg`, `.avif`) | AVIF + WebP at 640 / 1280 / 1920 px (never upscaled) and a ≤1280 px JPEG fallback | Phones download a ~20–40 KB file instead of a 0.5–2.3 MB PNG. AVIF keeps 4:4:4 chroma so UI text stays crisp |
| SVG logos over 20 KB | One WebP at 144 px tall (3× the 48 px display) | Traced-bitmap SVGs were 40–211 KB each for a 48 px logo |
| Ambient films (`fp-*.mp4`) | AV1 720p + 480p, H.264 480p, the H.264 master remuxed for fast start, and a 960 px WebP poster | AV1 is roughly half the bytes of H.264 at the same quality |

Only media referenced from `src/app` is processed (`og-default.jpg` is excluded: social crawlers fetch
it by its fixed URL). Unchanged masters are skipped on re-runs, and outputs nothing points at any more
are deleted.

## How the app picks a file

- **Images** — `<picture>` with AVIF and WebP `srcset`s plus a `sizes` hint, through the `media` pipe
  (`shared/pipes/media.pipe.ts`). The browser downloads only the width it needs for the slot and the
  screen density. Off-screen images are `loading="lazy"`.
- **Films** — `pickVideoSource()` (`core/media/media.ts`) chooses AV1 when the browser can decode it,
  H.264 otherwise, and 480p on phones (≤768 px), with Data Saver on, or on a 2G/3G-class connection.
  Films still only load when their scene scrolls into view, and never under `prefers-reduced-motion`.

## Caching

`src/_headers` (copied to the build root) caches `/assets/media/*` and the hashed JS/CSS bundles for a
year as `immutable`; a changed file gets a new name, so visitors never see a stale copy. Un-hashed
masters get a day plus background revalidation. `index.html` keeps Netlify's default (always
revalidate), so a new deploy is picked up straight away.

## Settings

Encoder settings live at the top of the script (`IMAGE_SETTINGS`, `LOGO_SETTINGS`,
`VIDEO_SETTINGS`). They are part of each output's cache key: change a setting, bump its version
string, and the next run re-encodes that media type.
