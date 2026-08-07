// pages/services/services.component.ts
//
// Services route. All copy comes from ServicesDataService — this component only
// holds view state (FAQ accordion, scroll reveal) and the two conversion actions
// (Calendly, WhatsApp). There is deliberately no contact form here: the route
// converts to a booked call or a chat, which keeps ReactiveFormsModule and
// EmailJS out of this lazy chunk entirely.

import {
  AfterViewInit, ChangeDetectionStrategy, Component, DestroyRef,
  ElementRef, NgZone, OnInit, inject, signal
} from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { AnalyticsService } from 'src/app/core/services/analytics.service';
import { SeoService } from 'src/app/core/services/seo.service';
import { TestimonialsService } from 'src/app/core/services/testimonials.service';
import {
  AiArtifact, EngagementModel, FaqItem, IndustryTile,
  McpCapability, ServiceOffering, ServicesDataService
} from 'src/app/core/services/services-data.service';

@Component({
  selector: 'app-services',
  templateUrl: './services.component.html',
  styleUrls: ['./services.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false
})
export class ServicesComponent implements OnInit, AfterViewInit {
  private data = inject(ServicesDataService);
  private testimonialsService = inject(TestimonialsService);
  private sanitizer = inject(DomSanitizer);
  private seo = inject(SeoService);
  private analytics = inject(AnalyticsService);
  private zone = inject(NgZone);
  private host = inject(ElementRef<HTMLElement>);
  private destroyRef = inject(DestroyRef);

  readonly calendlyUrl = 'https://calendly.com/iruobeakhigbe/30min';
  readonly whatsappUrl = 'https://wa.me/2347038772342?text=Hi%20Akhigbe%2C%20I%27d%20like%20to%20discuss%20a%20project';

  readonly trustStats = this.data.getTrustStats();
  readonly differentiators = this.data.getDifferentiators();
  readonly services: ServiceOffering[] = this.data.getServices();
  readonly aiArtifacts: AiArtifact[] = this.data.getAiArtifacts();
  readonly mcpCapabilities: McpCapability[] = this.data.getMcpCapabilities();
  readonly aiOutcomes = this.data.getAiOutcomes();
  readonly industries: IndustryTile[] = this.data.getIndustries();
  readonly process = this.data.getProcess();
  readonly engagementModels: EngagementModel[] = this.data.getEngagementModels();
  readonly guarantees = this.data.getGuarantees();
  readonly faqs: FaqItem[] = this.data.getFaqs();
  readonly testimonials = this.testimonialsService.getTestimonials().slice(0, 3);

  /** Index of the open FAQ row, or null when all are collapsed. */
  readonly openFaq = signal<number | null>(null);

  // ── Per-icon motion signatures ────────────────────────────────────────────
  // Motion is a presentation concern, so it lives here rather than polluting
  // ServicesDataService with styling.
  //
  // Each icon moves the way the thing it depicts would move: the shopping basket
  // swings, the payment card flips, the graduation cap tosses, the wrench twists.
  // Deliberately NOT randomised per hover — non-deterministic motion changes
  // between interactions, which reads as a bug rather than as character, and
  // cannot be asserted in a test. Varied and authored beats random.
  private static readonly MOTION_BY_KEY: Record<string, string> = {
    // services
    'ai-enablement': 'mo-spark',   // sparkles — spin and flare
    'web-apps': 'mo-tilt',         // browser window — tilts in 3D
    'business-systems': 'mo-rise', // building — rises
    'pos-inventory': 'mo-swing',   // basket — swings from the handle
    'payments': 'mo-flip',         // card — flips over
    'education': 'mo-toss',        // mortarboard — tossed in the air
    'backend': 'mo-stack',         // database — squashes and settles
    'websites': 'mo-zoom',         // magnifier — zooms in
    'rescue': 'mo-twist',          // wrench — twists back and forth
    'fractional': 'mo-step',       // people — steps up
    // industries
    'fuel': 'mo-pump',
    'retail': 'mo-swing',
    'small-business': 'mo-tilt',
    'enterprise': 'mo-rise',
    'fintech': 'mo-rise',
    'other': 'mo-spark'
  };

  /** Fallback rotation for icons with no authored signature (differentiators, models). */
  private static readonly MOTION_CYCLE = [
    'mo-tilt', 'mo-rise', 'mo-spark', 'mo-step', 'mo-zoom', 'mo-swing'
  ];

  private observer?: IntersectionObserver;
  private fallbackTimer?: number;
  private readonly iconCache = new Map<string, SafeHtml>();

  ngOnInit(): void {
    this.seo.setServicesSeo(this.services, this.faqs);
  }

  ngAfterViewInit(): void {
    this.initScrollReveal();
    this.destroyRef.onDestroy(() => {
      this.observer?.disconnect();
      if (this.fallbackTimer) { clearTimeout(this.fallbackTimer); }
    });
  }

  // Icon markup is authored by us in ServicesDataService (never user input), but
  // it still goes through the sanitizer bypass explicitly rather than implicitly.
  // Cached because @for re-evaluates the binding on every change detection pass.
  sanitizeIcon(svg: string): SafeHtml {
    const cached = this.iconCache.get(svg);
    if (cached) { return cached; }
    const safe = this.sanitizer.bypassSecurityTrustHtml(svg);
    this.iconCache.set(svg, safe);
    return safe;
  }

  /**
   * Motion class for an icon. Authored signatures win; anything else falls back to
   * a stable cycle so no two adjacent icons in a grid ever move identically.
   */
  iconMotion(key: string, index: number): string {
    return ServicesComponent.MOTION_BY_KEY[key]
      ?? ServicesComponent.MOTION_CYCLE[index % ServicesComponent.MOTION_CYCLE.length];
  }

  toggleFaq(index: number): void {
    this.openFaq.update(current => (current === index ? null : index));
  }

  getTestimonialGradient(index: number): string {
    return this.testimonialsService.getGradient(index);
  }

  trackBooking(): void {
    this.analytics.trackEvent('Services', 'Book Call', 'Calendly');
  }

  trackWhatsApp(): void {
    this.analytics.trackEvent('Services', 'WhatsApp', 'Services CTA');
  }

  // Reveal-on-scroll. Runs outside Angular so the observer callback never
  // schedules a change-detection pass — the class toggle is a direct DOM write.
  //
  // Three safeguards, because `.reveal` starts at opacity 0 and this page exists
  // to be read: content that fails to reveal is content the client never sees.
  //   1. Anything already within (or above) the first viewport is revealed
  //      synchronously, so nothing above the fold waits on an async callback.
  //   2. A small negative rootMargin only — a large one delays reveals long
  //      enough to show blank cards during a fast scroll.
  //   3. A hard fallback timer force-reveals everything regardless, so a browser
  //      without IntersectionObserver, a throttled callback, or any future bug
  //      can never leave the page permanently blank.
  private initScrollReveal(): void {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const nodes = Array.from(
      (this.host.nativeElement as HTMLElement).querySelectorAll<HTMLElement>('.reveal')
    );

    const revealAll = () => nodes.forEach(n => n.classList.add('revealed'));

    if (reduceMotion || !('IntersectionObserver' in window)) {
      revealAll();
      return;
    }

    this.zone.runOutsideAngular(() => {
      // 1. Above-the-fold content never waits for the observer.
      const fold = window.innerHeight;
      const pending = nodes.filter(n => {
        if (n.getBoundingClientRect().top < fold) {
          n.classList.add('revealed');
          return false;
        }
        return true;
      });

      this.observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            obs.unobserve(entry.target);
          }
        });
      }, { rootMargin: '0px 0px -4% 0px', threshold: 0.01 });

      pending.forEach(n => this.observer!.observe(n));

      // 3. Safety net.
      this.fallbackTimer = window.setTimeout(revealAll, 2500);
    });
  }
}
