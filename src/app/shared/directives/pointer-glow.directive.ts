import { Directive, ElementRef, NgZone, OnDestroy, inject } from '@angular/core';

/**
 * Cursor-tracked glow for card surfaces.
 *
 * Writes the pointer position into `--mx` / `--my` on the host so a CSS
 * `radial-gradient(... at var(--mx) var(--my) ...)` follows the cursor. The card's
 * own stylesheet decides what to do with the values — this directive only supplies
 * them, so each card type can respond differently.
 *
 * Performance contract:
 * - Listeners are bound OUTSIDE Angular, so pointer movement never schedules a
 *   change-detection pass. Writing a CSS custom property is a direct style write.
 * - Reads are coalesced into one rAF frame; a burst of pointermove events between
 *   frames collapses to a single style write rather than one per event.
 * - Bound only on devices with a real hovering pointer. Touch devices never attach
 *   a listener at all, so there is zero cost on mobile.
 */
@Directive({
  selector: '[appPointerGlow]',
  standalone: false
})
export class PointerGlowDirective implements OnDestroy {
  private el = inject(ElementRef<HTMLElement>);
  private zone = inject(NgZone);

  private frame = 0;
  private px = 0;
  private py = 0;
  private bound = false;

  private readonly onMove = (e: PointerEvent): void => {
    const rect = this.el.nativeElement.getBoundingClientRect();
    this.px = e.clientX - rect.left;
    this.py = e.clientY - rect.top;
    if (this.frame) { return; }
    this.frame = requestAnimationFrame(this.flush);
  };

  private readonly flush = (): void => {
    this.frame = 0;
    const style = (this.el.nativeElement as HTMLElement).style;
    style.setProperty('--mx', `${this.px}px`);
    style.setProperty('--my', `${this.py}px`);
  };

  // Recentre on exit so the next hover fades in from the middle instead of
  // snapping back to wherever the cursor last left the card.
  private readonly onLeave = (): void => {
    if (this.frame) { cancelAnimationFrame(this.frame); this.frame = 0; }
    const style = (this.el.nativeElement as HTMLElement).style;
    style.removeProperty('--mx');
    style.removeProperty('--my');
  };

  constructor() {
    const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!canHover || reduceMotion) { return; }

    this.bound = true;
    this.zone.runOutsideAngular(() => {
      const host = this.el.nativeElement as HTMLElement;
      host.addEventListener('pointermove', this.onMove, { passive: true });
      host.addEventListener('pointerleave', this.onLeave, { passive: true });
    });
  }

  ngOnDestroy(): void {
    if (this.frame) { cancelAnimationFrame(this.frame); }
    if (!this.bound) { return; }
    const host = this.el.nativeElement as HTMLElement;
    host.removeEventListener('pointermove', this.onMove);
    host.removeEventListener('pointerleave', this.onLeave);
  }
}
