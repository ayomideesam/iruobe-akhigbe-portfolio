/**
 * The large-display zoom factor: `--z` on :root, set by media queries in
 * styles.css (1 below 2200px, up to 1.75 on 4K at 100% OS scaling) and applied
 * as `zoom` on the app shell.
 *
 * Inside a zoomed subtree, getBoundingClientRect() and pointer coordinates are
 * in zoomed (visual) pixels, while offsetWidth/offsetHeight, scroll offsets and
 * any px length written back to a style are in unzoomed layout pixels. Divide
 * visual measurements by this before writing them to styles, and multiply
 * layout lengths by it before comparing them with visual ones.
 */
export function uiScale(): number {
  if (typeof document === 'undefined') return 1;
  const z = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--z'));
  return Number.isFinite(z) && z > 0 ? z : 1;
}
