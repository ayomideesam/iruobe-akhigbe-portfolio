import { AfterViewInit, Directive, ElementRef, HostListener, Renderer2, inject } from '@angular/core';

/**
 * Per-letter hover colorizer — ported verbatim from the design prototype's
 * `rainbow(el)` method. Splits the host's text into per-letter spans; on
 * hover each letter staggers into one of 7 colors with a slight lift/rotate.
 * Stagger is 16ms/letter (the reference JS value — the design doc's prose
 * says "~28ms" but the code, the documented source of truth, uses 16ms).
 *
 * ⚠️ TEXT-ONLY HOST. This reads `host.textContent` and rebuilds the element from
 * that flat string, so ANY child markup inside the host is silently destroyed —
 * a `<br>` collapses (joining the words either side with no space), and nested
 * `<span>`/`<strong>` lose their styling. Put the directive on a text-only
 * element; if you need a line break, use separate sibling elements instead.
 */
@Directive({
  selector: '[appRainbowHover]',
  standalone: false
})
export class RainbowHoverDirective implements AfterViewInit {
  private el = inject(ElementRef<HTMLElement>);
  private renderer = inject(Renderer2);

  private static readonly COLORS = ['#818cf8', '#22d3ee', '#34d399', '#fbbf24', '#f472b6', '#f87171', '#a78bfa'];

  private spans: HTMLElement[] = [];

  ngAfterViewInit(): void {
    const host = this.el.nativeElement;
    if (host.dataset['rbw']) return;
    host.dataset['rbw'] = '1';

    const text = host.textContent ?? '';
    host.textContent = '';

    // Group letters by word (each word in its own white-space:nowrap wrapper)
    // so responsive line-wrapping can only occur at real spaces — splitting
    // into bare per-letter spans (the prototype's literal approach) lets the
    // browser wrap mid-word on narrow viewports, e.g. "Complex P|roblems".
    let i = 0;
    text.split(/( +)/).forEach((chunk: string) => {
      if (chunk === '') return;
      if (/^ +$/.test(chunk)) {
        const spaceSpan = this.renderer.createElement('span') as HTMLElement;
        this.renderer.setProperty(spaceSpan, 'textContent', chunk);
        spaceSpan.style.cssText = 'display:inline-block;white-space:pre';
        this.renderer.appendChild(host, spaceSpan);
        i += chunk.length;
        return;
      }
      const wordWrapper = this.renderer.createElement('span') as HTMLElement;
      wordWrapper.style.cssText = 'display:inline-block;white-space:nowrap';
      this.renderer.appendChild(host, wordWrapper);
      [...chunk].forEach(ch => {
        const span = this.renderer.createElement('span') as HTMLElement;
        this.renderer.setProperty(span, 'textContent', ch);
        span.style.cssText = 'display:inline-block;white-space:pre;transition:color 0.25s ease,transform 0.25s ease;transition-delay:' + (i * 16) + 'ms';
        this.renderer.appendChild(wordWrapper, span);
        this.spans.push(span);
        i++;
      });
    });
  }

  @HostListener('mouseenter')
  onEnter(): void {
    this.spans.forEach((s, i) => {
      s.style.color = RainbowHoverDirective.COLORS[i % RainbowHoverDirective.COLORS.length];
      s.style.transform = 'translateY(-3px) rotate(' + ((i % 2 ? 1 : -1) * 2) + 'deg)';
    });
  }

  @HostListener('mouseleave')
  onLeave(): void {
    this.spans.forEach(s => { s.style.color = ''; s.style.transform = ''; });
  }
}
