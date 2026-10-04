#!/usr/bin/env node
/**
 * Media pipeline — compresses every image, logo and ambient film the site references, so the
 * portfolio stays usable on slow networks without giving up sharpness.
 *
 *   npm run optimize:media                 images + logos + posters + videos
 *   npm run optimize:media -- --skip-video images only (no ffmpeg needed)
 *
 * What it produces (all under src/assets/media/, content-hashed so Netlify can cache them forever):
 *   images  → AVIF + WebP at 640 / 1280 / 1920 px (capped at the source width) and a 1280 px JPEG
 *             fallback. AVIF keeps 4:4:4 chroma so UI text in screenshots stays crisp.
 *   logos   → heavy traced-bitmap SVGs (> 20 KB) rasterised to a small WebP at 3× display size.
 *   videos  → AV1 720p/480p + H.264 480p re-encodes, plus a faststart remux of the H.264 master and
 *             a WebP poster. The page picks AV1 when the browser can decode it, 480p on phones and
 *             slow connections.
 *
 * Masters stay where they are (src/assets/img, src/assets/logos, src/assets/video) and stay the
 * keys the app uses, so project data never has to change. The generated manifest
 * (src/app/core/media/media-manifest.ts) maps each master path to its optimised files; the `media`
 * pipe reads it. Unchanged masters are skipped on re-runs (keyed on a hash of the master and the
 * encoder settings), so only new or edited media is re-encoded.
 *
 * ffmpeg is needed for videos: on PATH (`brew install ffmpeg`) or via FFMPEG_PATH=/path/to/ffmpeg.
 */
import sharp from 'sharp';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const OUT_DIR = 'src/assets/media';
const MANIFEST_PATH = 'src/app/core/media/media-manifest.ts';
const SCAN_DIRS = ['src/app'];

/** Social crawlers fetch this by its fixed URL; it must stay a plain JPEG. */
const EXCLUDE = new Set(['assets/img/og-default.jpg']);

const IMAGE_WIDTHS = [640, 1280, 1920];
const FALLBACK_WIDTH = 1280;
const LOGO_MIN_BYTES = 20 * 1024;
const LOGO_HEIGHT = 144; // 3× the 48 px the company scroller renders

// Bump a version string to force a re-encode of that media type after changing its settings.
const IMAGE_SETTINGS = 'v1|avif q60 e6 444|webp q80 e6 smart|jpeg mozjpeg q80';
const LOGO_SETTINGS = 'v1|webp q90 a100 h144';
// Films sit under a dark scrim and grain overlay, so they tolerate more compression than a
// full-screen video would: CRF 48/50 AV1 and CRF 30 H.264 were indistinguishable from the masters at
// 1:1 in frame comparisons (2026-10-03) and roughly halve the bytes.
const VIDEO_SETTINGS = 'v2|av1 svt p6 crf48/50|h264 crf30 slow 480|copy 720|poster webp q72 960';
// The poster master (fp-x.jpg next to fp-x.mp4) is part of the video's cache key too.
const videoSourceHash = (key) => {
  const poster = `src/${key}`.replace(/\.mp4$/, '.jpg');
  return `${fileHash(`src/${key}`)}${fs.existsSync(abs(poster)) ? `+${fileHash(poster)}` : ''}|${VIDEO_SETTINGS}`;
};

const skipVideo = process.argv.includes('--skip-video');

const abs = (p) => path.join(ROOT, p);
const rel = (p) => path.relative(ROOT, p).split(path.sep).join('/');
const shortHash = (buf) => createHash('sha256').update(buf).digest('hex').slice(0, 10);
const fileHash = (p) => shortHash(fs.readFileSync(abs(p)));
const kb = (n) => `${(n / 1024).toFixed(0)} KB`;

/** Every `assets/...` path referenced from app code, minus specs and stale `.old` backups. */
function referencedPaths(pattern) {
  const found = new Set();
  const walk = (dir) => {
    for (const entry of fs.readdirSync(abs(dir), { withFileTypes: true })) {
      const p = `${dir}/${entry.name}`;
      if (entry.isDirectory()) walk(p);
      else if (/\.(ts|html)$/.test(entry.name) && !/\.spec\.ts$/.test(entry.name) && p !== MANIFEST_PATH) {
        for (const m of fs.readFileSync(abs(p), 'utf8').matchAll(pattern)) found.add(m[1]);
      }
    }
  };
  SCAN_DIRS.forEach(walk);
  return [...found].filter((p) => !EXCLUDE.has(p) && fs.existsSync(abs(`src/${p}`))).sort();
}

function readManifest() {
  if (!fs.existsSync(abs(MANIFEST_PATH))) return { images: {}, logos: {}, videos: {} };
  const text = fs.readFileSync(abs(MANIFEST_PATH), 'utf8');
  const json = text.slice(text.indexOf('= {') + 2, text.lastIndexOf('};') + 1);
  return JSON.parse(json);
}

/** Write `buf` under OUT_DIR with a content hash in its name; returns the public URL. */
function emit(subdir, base, suffix, ext, buf) {
  const name = `${base}${suffix}.${shortHash(buf)}.${ext}`;
  const dir = abs(`${OUT_DIR}/${subdir}`);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, name), buf);
  return `/${OUT_DIR.replace(/^src\//, '')}/${subdir}/${name}`;
}

const urlToFile = (url) => abs(`src${url}`);
const outputsExist = (urls) => urls.every((u) => fs.existsSync(urlToFile(u)));

async function processImage(key, prev) {
  const sourceKey = `${fileHash(`src/${key}`)}|${IMAGE_SETTINGS}`;
  const urls = prev ? [prev.fallback, ...[prev.avif, prev.webp].flatMap((s) => s.split(', ').map((x) => x.split(' ')[0]))] : [];
  if (prev?.source === sourceKey && outputsExist(urls)) return { entry: prev, cached: true };

  const input = abs(`src/${key}`);
  const meta = await sharp(input).metadata();
  const base = path.basename(key).replace(/\.[^.]+$/, '');
  const widths = [...new Set([...IMAGE_WIDTHS.filter((w) => w < meta.width), Math.min(meta.width, IMAGE_WIDTHS.at(-1))])];

  const avif = [];
  const webp = [];
  let bytes = 0;
  for (const w of widths) {
    const resized = () => sharp(input).resize({ width: w, withoutEnlargement: true });
    const a = await resized().avif({ quality: 60, effort: 6, chromaSubsampling: '4:4:4' }).toBuffer();
    const b = await resized().webp({ quality: 80, effort: 6, smartSubsample: true }).toBuffer();
    avif.push(`${emit('img', base, `-${w}`, 'avif', a)} ${w}w`);
    webp.push(`${emit('img', base, `-${w}`, 'webp', b)} ${w}w`);
    if (w === widths[Math.min(1, widths.length - 1)]) bytes = a.length; // report the ~1280 AVIF
  }
  // Legacy fallback: JPEG for opaque screenshots; a palette PNG for transparent artwork (badges),
  // which a white-flattened JPEG would put on a white box in dark mode.
  const fw = Math.min(FALLBACK_WIDTH, meta.width);
  const fallbackExt = meta.hasAlpha ? 'png' : 'jpg';
  const fallback = meta.hasAlpha
    ? await sharp(input).resize({ width: fw, withoutEnlargement: true }).png({ palette: true, quality: 85, compressionLevel: 9 }).toBuffer()
    : await sharp(input).resize({ width: fw, withoutEnlargement: true }).flatten({ background: '#ffffff' }).jpeg({ quality: 80, mozjpeg: true }).toBuffer();

  return {
    cached: false,
    bytes,
    entry: {
      width: meta.width,
      height: meta.height,
      avif: avif.join(', '),
      webp: webp.join(', '),
      fallback: emit('img', base, `-${fw}`, fallbackExt, fallback),
      source: sourceKey,
    },
  };
}

async function processLogo(key, prev) {
  const sourceKey = `${fileHash(`src/${key}`)}|${LOGO_SETTINGS}`;
  if (prev?.source === sourceKey && outputsExist([prev.src])) return { entry: prev, cached: true };
  const buf = await sharp(abs(`src/${key}`), { density: 300 }).resize({ height: LOGO_HEIGHT })
    .webp({ quality: 90, alphaQuality: 100, effort: 6 }).toBuffer();
  const meta = await sharp(buf).metadata();
  const base = path.basename(key).replace(/\.svg$/, '');
  return { cached: false, bytes: buf.length, entry: { src: emit('logos', base, '', 'webp', buf), width: meta.width, height: meta.height, source: sourceKey } };
}

function findFfmpeg() {
  const candidates = [process.env.FFMPEG_PATH, 'ffmpeg'].filter(Boolean);
  for (const bin of candidates) {
    const r = spawnSync(bin, ['-hide_banner', '-encoders'], { encoding: 'utf8' });
    if (r.status === 0) return { bin, av1: /libsvtav1/.test(r.stdout) };
  }
  return null;
}

function ffmpeg(bin, args) {
  const r = spawnSync(bin, ['-hide_banner', '-loglevel', 'error', '-y', ...args], { encoding: 'utf8' });
  if (r.status !== 0) throw new Error(`ffmpeg failed: ${r.stderr}`);
}

async function processVideo(key, prev, ff) {
  const sourceKey = videoSourceHash(key);
  if (prev?.source === sourceKey && outputsExist([prev.poster, prev.h264_720, prev.h264_480, prev.av1_720, prev.av1_480])) {
    return { entry: prev, cached: true };
  }
  const input = abs(`src/${key}`);
  const base = path.basename(key).replace(/\.mp4$/, '');
  const tmp = fs.mkdtempSync(path.join(abs('node_modules/.cache'), 'media-'));
  const out = (name) => path.join(tmp, name);
  const common = ['-an', '-pix_fmt', 'yuv420p', '-movflags', '+faststart'];

  ffmpeg(ff.bin, ['-i', input, '-c', 'copy', '-an', '-movflags', '+faststart', out('720.mp4')]);
  ffmpeg(ff.bin, ['-i', input, '-vf', 'scale=-2:480', '-c:v', 'libx264', '-preset', 'slow', '-crf', '30', '-profile:v', 'high', ...common, out('480.mp4')]);
  ffmpeg(ff.bin, ['-i', input, '-c:v', 'libsvtav1', '-preset', '6', '-crf', '48', '-g', '240', ...common, out('av1-720.mp4')]);
  ffmpeg(ff.bin, ['-i', input, '-vf', 'scale=-2:480', '-c:v', 'libsvtav1', '-preset', '6', '-crf', '50', '-g', '240', ...common, out('av1-480.mp4')]);
  // Prefer the hand-picked poster that sits next to the master; fall back to the first frame.
  const posterMaster = input.replace(/\.mp4$/, '.jpg');
  if (!fs.existsSync(posterMaster)) ffmpeg(ff.bin, ['-i', input, '-vf', 'select=eq(n\\,0)', '-frames:v', '1', out('poster.png')]);
  const poster = await sharp(fs.existsSync(posterMaster) ? posterMaster : out('poster.png'))
    .resize({ width: 960 }).webp({ quality: 72, effort: 6 }).toBuffer();
  const read = (n) => fs.readFileSync(out(n));
  const entry = {
    poster: emit('video', base, '-poster', 'webp', poster),
    h264_720: emit('video', base, '-720', 'mp4', read('720.mp4')),
    h264_480: emit('video', base, '-480', 'mp4', read('480.mp4')),
    av1_720: emit('video', base, '-av1-720', 'mp4', read('av1-720.mp4')),
    av1_480: emit('video', base, '-av1-480', 'mp4', read('av1-480.mp4')),
    source: sourceKey,
  };
  fs.rmSync(tmp, { recursive: true, force: true });
  return { cached: false, entry };
}

/** Delete pipeline outputs that no manifest entry points at any more. */
function prune(manifest) {
  const keep = new Set();
  for (const e of Object.values(manifest.images)) {
    keep.add(e.fallback);
    [e.avif, e.webp].forEach((s) => s.split(', ').forEach((x) => keep.add(x.split(' ')[0])));
  }
  Object.values(manifest.logos).forEach((e) => keep.add(e.src));
  for (const e of Object.values(manifest.videos)) [e.poster, e.h264_720, e.h264_480, e.av1_720, e.av1_480].forEach((u) => keep.add(u));
  let removed = 0;
  const walk = (dir) => {
    if (!fs.existsSync(dir)) return;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(p);
      else if (!keep.has(`/${rel(p).replace(/^src\//, '')}`)) { fs.rmSync(p); removed++; }
    }
  };
  walk(abs(OUT_DIR));
  return removed;
}

function writeManifest(manifest) {
  const sortKeys = (o) => Object.fromEntries(Object.entries(o).sort(([a], [b]) => a.localeCompare(b)));
  const data = { images: sortKeys(manifest.images), logos: sortKeys(manifest.logos), videos: sortKeys(manifest.videos) };
  const ts = `// AUTO-GENERATED by scripts/optimize-media.mjs — do not edit by hand.
// Re-run \`npm run optimize:media\` after adding or replacing any image, logo or video.
import type { MediaManifest } from './media.types';

export const MEDIA_MANIFEST: MediaManifest = ${JSON.stringify(data, null, 2)};
`;
  fs.mkdirSync(path.dirname(abs(MANIFEST_PATH)), { recursive: true });
  fs.writeFileSync(abs(MANIFEST_PATH), ts);
}

async function main() {
  fs.mkdirSync(abs('node_modules/.cache'), { recursive: true });
  const prev = readManifest();
  const next = { images: {}, logos: {}, videos: {} };

  const images = referencedPaths(/((?:assets\/img)\/[A-Za-z0-9_./-]+\.(?:png|jpe?g|avif))/g);
  console.log(`Images (${images.length})`);
  for (const key of images) {
    const r = await processImage(key, prev.images[key]);
    next.images[key] = r.entry;
    const src = fs.statSync(abs(`src/${key}`)).size;
    console.log(`  ${r.cached ? 'cached ' : 'encoded'}  ${key}  ${kb(src)}${r.cached ? '' : ` → ~${kb(r.bytes)} (1280 AVIF)`}`);
  }

  const logos = referencedPaths(/(assets\/logos\/[A-Za-z0-9_-]+\.svg)/g)
    .filter((k) => fs.statSync(abs(`src/${k}`)).size > LOGO_MIN_BYTES);
  console.log(`Logos (${logos.length} over ${kb(LOGO_MIN_BYTES)})`);
  for (const key of logos) {
    const r = await processLogo(key, prev.logos[key]);
    next.logos[key] = r.entry;
    console.log(`  ${r.cached ? 'cached ' : 'encoded'}  ${key}  ${kb(fs.statSync(abs(`src/${key}`)).size)}${r.cached ? '' : ` → ${kb(r.bytes)}`}`);
  }

  const videos = referencedPaths(/(assets\/video\/[A-Za-z0-9_-]+\.mp4)/g);
  const ff = skipVideo ? null : findFfmpeg();
  if (!ff) {
    console.log(skipVideo ? 'Videos skipped (--skip-video): keeping previous outputs.'
      : 'Videos skipped: ffmpeg not found (brew install ffmpeg, or set FFMPEG_PATH). Keeping previous outputs.');
    for (const key of videos) if (prev.videos[key]) next.videos[key] = prev.videos[key];
  } else if (!ff.av1) {
    throw new Error(`${ff.bin} has no libsvtav1 encoder; install a full ffmpeg build (brew install ffmpeg).`);
  } else {
    console.log(`Videos (${videos.length})`);
    for (const key of videos) {
      const r = await processVideo(key, prev.videos[key], ff);
      next.videos[key] = r.entry;
      if (r.cached) { console.log(`  cached   ${key}`); continue; }
      const size = (u) => kb(fs.statSync(urlToFile(u)).size);
      console.log(`  encoded  ${key}  ${kb(fs.statSync(abs(`src/${key}`)).size)} → av1 720 ${size(r.entry.av1_720)} · av1 480 ${size(r.entry.av1_480)} · h264 480 ${size(r.entry.h264_480)} · poster ${size(r.entry.poster)}`);
    }
  }

  writeManifest(next);
  const removed = prune(next);
  console.log(`Manifest written to ${MANIFEST_PATH}${removed ? `; pruned ${removed} stale file(s)` : ''}.`);
}

main().catch((err) => {
  console.error(err.message ?? err);
  process.exit(1);
});
