// app.component.ts — Home v2: ambient canvas background + theme host
import { AfterViewInit, Component, DestroyRef, ElementRef, NgZone, ViewChild, inject } from '@angular/core';
import { ThemeService } from './core/services/theme.service';
import { LoadingService } from './core/services/loading.service';

interface CanvasLetter {
  ch: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  op: number;
  rot: number;
  vr: number;
  born: number;
}

interface CanvasStar {
  x: number;
  y: number;
  r: number;
  ph: number;
  sp: number;
}

@Component({
  selector: 'app-root',
  template: `
    <div class="app-shell">
      <app-spinner [isLoading]="isSpinner" [text]="loadingText"></app-spinner>

      <!-- Ambient background: aurora blobs + canvas letter-field + cursor spotlight -->
      <div class="ambient" aria-hidden="true">
        <div class="aurora aurora-1"></div>
        <div class="aurora aurora-2"></div>
        <div class="aurora aurora-3"></div>
        <canvas #bgCanvas class="letter-canvas"></canvas>
        <div #spotlight class="spotlight"></div>
      </div>

      <!-- First focusable element in the document — WCAG 2.4.1 bypass block. -->
      <a class="skip-link" href="#main-content">Skip to main content</a>

      <app-header></app-header>

      <!-- tabindex="-1" makes <main> a valid programmatic focus target for both
           the skip link and the post-navigation focus reset. -->
      <main id="main-content" tabindex="-1">
        <router-outlet></router-outlet>
      </main>

      <app-footer></app-footer>

      <a href="https://wa.me/2347038772342" target="_blank" rel="noopener noreferrer"
         class="whatsapp-float" aria-label="Chat on WhatsApp">
        <svg width="26" height="26" viewBox="0 0 24 24">
          <path fill="currentColor" d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.274.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.1.824zm-3.423-14.416c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm.029 18.88c-1.161 0-2.305-.292-3.318-.844l-3.677.964.984-3.595c-.607-1.052-.927-2.246-.926-3.468.001-3.825 3.113-6.937 6.937-6.937 1.856.001 3.598.723 4.907 2.034 1.31 1.311 2.031 3.054 2.03 4.908-.001 3.825-3.113 6.938-6.937 6.938z"/>
        </svg>
      </a>
    </div>
  `,
  styles: [`
    :host { font-family: "Sora", sans-serif; }

    .app-shell {
      position: relative;
      min-height: 100vh;
      background: var(--bg);
      color: var(--tx);
      transition: background 0.45s ease, color 0.45s ease;
      overflow-x: clip;
    }

    /* ── Ambient background layer (behind everything, non-interactive) ── */
    .ambient {
      position: fixed;
      inset: 0;
      z-index: 0;
      pointer-events: none;
      overflow: hidden;
    }

    .aurora {
      position: absolute;
      border-radius: 50%;
      filter: blur(44px);
    }
    .aurora-1 {
      width: 58vw; height: 58vw; left: -16vw; top: -22vw;
      background: radial-gradient(circle, rgba(var(--prr), 0.16), transparent 65%);
    }
    .aurora-2 {
      width: 46vw; height: 46vw; right: -14vw; top: 28vh;
      background: radial-gradient(circle, rgba(var(--acr), 0.10), transparent 65%);
    }
    .aurora-3 {
      width: 52vw; height: 52vw; left: 18vw; bottom: -26vw;
      background: radial-gradient(circle, rgba(var(--prr), 0.12), transparent 65%);
    }

    .letter-canvas {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
    }

    .spotlight {
      position: absolute;
      left: 50%;
      top: 38%;
      width: 540px;
      height: 540px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(var(--prr), 0.11), transparent 62%);
      transform: translate(-50%, -50%);
    }

    main {
      position: relative;
      z-index: 1;
      width: 100%;
    }
    /* <main> is only focusable programmatically; never show a ring on it. */
    main:focus { outline: none; }

    /* Skip link — off-screen until focused, then pinned above the header. */
    .skip-link {
      position: fixed;
      top: 10px;
      left: 50%;
      z-index: 2000;
      display: inline-flex;
      align-items: center;
      padding: 12px 22px;
      border-radius: 12px;
      font: 600 14px Sora, sans-serif;
      text-decoration: none;
      color: var(--btntx);
      background: linear-gradient(135deg, var(--pr), var(--ac));
      box-shadow: 0 14px 34px -10px rgba(var(--prr), 0.7);
      transform: translate(-50%, -220%);
      transition: transform 0.25s cubic-bezier(0.22, 1, 0.36, 1);
    }
    /* :focus, not just :focus-visible — a skip link is only ever reached by
       keyboard, and the focus-visible heuristic can decline to match depending on
       how focus arrived. Missing it means the link takes focus while staying
       invisible, which is worse than having no skip link at all. */
    .skip-link:focus {
      transform: translate(-50%, 0);
      outline: 2px solid var(--ac);
      outline-offset: 3px;
    }

    /* ── WhatsApp float ── */
    .whatsapp-float {
      position: fixed;
      bottom: 22px;
      right: 22px;
      z-index: 65;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 52px;
      height: 52px;
      border-radius: 50%;
      background: var(--glass2);
      -webkit-backdrop-filter: blur(14px);
      backdrop-filter: blur(14px);
      border: 1px solid rgba(37, 211, 102, 0.45);
      color: #25D366;
      box-shadow: 0 10px 26px -8px rgba(37, 211, 102, 0.45);
      transition: transform 0.25s cubic-bezier(0.22, 1, 0.36, 1);
    }
    .whatsapp-float:hover { transform: scale(1.12); }

    @media (max-width: 600px) {
      .whatsapp-float { bottom: 16px; right: 16px; width: 48px; height: 48px; }
    }
  `],
  standalone: false
})
export class AppComponent implements AfterViewInit {
  private themeService = inject(ThemeService);
  private loadingService = inject(LoadingService);
  private ngZone = inject(NgZone);
  private destroyRef = inject(DestroyRef);

  @ViewChild('bgCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('spotlight') spotRef!: ElementRef<HTMLDivElement>;

  get isSpinner(): boolean { return this.loadingService.loading(); }
  get loadingText(): string { return this.loadingService.loadingText(); }

  private rafId: number | null = null;
  private onMove?: (e: PointerEvent) => void;
  private onResize?: () => void;

  constructor() {
    this.destroyRef.onDestroy(() => {
      if (this.rafId) cancelAnimationFrame(this.rafId);
      if (this.onMove) window.removeEventListener('pointermove', this.onMove);
      if (this.onResize) window.removeEventListener('resize', this.onResize);
    });
  }

  ngAfterViewInit(): void {
    this.initCanvas();
  }

  // Canvas letter-field — ported verbatim from the design prototype's initCanvas().
  // Every constant, easing and physics value is byte-identical to the reference.
  private initCanvas(): void {
    const cv = this.canvasRef?.nativeElement;
    if (!cv || this.rafId) return;
    const ctx = cv.getContext('2d');
    if (!ctx) return;

    const chars = 'AKHIGBEIRUOBE'.split('');
    let W = 0, H = 0, dpr = 1;
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth; H = window.innerHeight;
      cv.width = W * dpr; cv.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    this.onResize = resize;
    window.addEventListener('resize', resize);
    resize();

    const depths = [{ s: 26, o: 0.10 }, { s: 42, o: 0.16 }, { s: 60, o: 0.22 }];
    let letters: CanvasLetter[] = [], stars: CanvasStar[] = [], seeded = false;
    const mouse = { x: -9e3, y: -9e3 };
    const spot = { x: 0, y: 0 };

    const seed = (t: number) => {
      letters = chars.map((ch, i) => {
        const d = depths[i % 3];
        const a = Math.random() * Math.PI * 2;
        const sp = 2.2 + Math.random() * 3.4;
        return {
          ch, x: W / 2, y: H * 0.42, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
          size: d.s * (0.85 + Math.random() * 0.35), op: d.o + Math.random() * 0.05,
          rot: (Math.random() - 0.5) * 0.5, vr: (Math.random() - 0.5) * 0.004, born: t
        };
      });
      stars = Array.from({ length: 55 }, () => ({
        x: Math.random() * W, y: Math.random() * H, r: 0.6 + Math.random() * 1.3,
        ph: Math.random() * Math.PI * 2, sp: 0.3 + Math.random() * 0.8
      }));
      spot.x = W / 2; spot.y = H * 0.4;
      seeded = true;
    };

    this.onMove = (e: PointerEvent) => { mouse.x = e.clientX; mouse.y = e.clientY; };
    window.addEventListener('pointermove', this.onMove);

    const loop = (t: number) => {
      if (W !== window.innerWidth || H !== window.innerHeight) resize();
      if (!seeded) {
        if (W > 0 && H > 0) seed(t);
        else { this.rafId = requestAnimationFrame(loop); return; }
      }
      const dark = this.themeService.isDarkTheme();
      const rgb = dark ? '129,140,248' : '79,70,229';
      ctx.clearRect(0, 0, W, H);

      // stars
      for (const s of stars) {
        const tw = 0.25 + 0.55 * Math.abs(Math.sin(s.ph + t * 0.001 * s.sp));
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, 7);
        ctx.fillStyle = 'rgba(' + rgb + ',' + (tw * (dark ? 0.5 : 0.35)).toFixed(3) + ')';
        ctx.fill();
      }
      // constellation lines
      ctx.lineWidth = 1;
      for (let i = 0; i < letters.length; i++) for (let j = i + 1; j < letters.length; j++) {
        const a = letters[i], b = letters[j];
        const dx = a.x - b.x, dy = a.y - b.y, d2 = dx * dx + dy * dy;
        if (d2 < 32400) {
          ctx.strokeStyle = 'rgba(' + rgb + ',' + (0.07 * (1 - d2 / 32400)).toFixed(3) + ')';
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }
      // letters
      for (const L of letters) {
        const dx = L.x - mouse.x, dy = L.y - mouse.y;
        const dist = Math.hypot(dx, dy);
        let glow = 0;
        if (dist < 230) {
          glow = 1 - dist / 230;
          if (dist > 0.01) {
            const f = glow * 0.55;
            L.vx += (dx / dist) * f; L.vy += (dy / dist) * f;
          }
        }
        L.x += L.vx; L.y += L.vy;
        L.vx *= 0.965; L.vy *= 0.965;
        const sp = Math.hypot(L.vx, L.vy);
        if (sp < 0.12) { const a = Math.random() * Math.PI * 2; L.vx += Math.cos(a) * 0.02; L.vy += Math.sin(a) * 0.02; }
        const spd2 = Math.hypot(L.vx, L.vy);
        if (spd2 > 3.2) { L.vx *= 3.2 / spd2; L.vy *= 3.2 / spd2; }
        const m = 44;
        if (L.x < -m) L.x = W + m; else if (L.x > W + m) L.x = -m;
        if (L.y < -m) L.y = H + m; else if (L.y > H + m) L.y = -m;
        L.rot += L.vr;
        if (L.rot > 0.35 || L.rot < -0.35) L.vr *= -1;

        const born = Math.min(1, (t - L.born) / 900);
        ctx.save();
        ctx.translate(L.x, L.y);
        ctx.rotate(L.rot);
        ctx.font = '400 ' + L.size + 'px Macondo, serif';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.shadowColor = 'rgba(' + rgb + ',0.8)';
        ctx.shadowBlur = 4 + glow * 22;
        ctx.fillStyle = 'rgba(' + rgb + ',' + ((L.op + glow * 0.30) * born).toFixed(3) + ')';
        ctx.fillText(L.ch, 0, 0);
        ctx.restore();
      }
      // spotlight lerp
      if (mouse.x > -8e3) { spot.x += (mouse.x - spot.x) * 0.07; spot.y += (mouse.y - spot.y) * 0.07; }
      const spotEl = this.spotRef?.nativeElement;
      if (spotEl) { spotEl.style.left = spot.x + 'px'; spotEl.style.top = spot.y + 'px'; }

      this.rafId = requestAnimationFrame(loop);
    };

    this.ngZone.runOutsideAngular(() => {
      this.rafId = requestAnimationFrame(loop);
    });
  }
}
