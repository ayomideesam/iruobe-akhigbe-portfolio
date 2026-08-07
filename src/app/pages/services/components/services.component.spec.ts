import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedModule } from 'src/app/shared/shared.module';

import { ServicesComponent } from './services.component';

describe('ServicesComponent', () => {
  let component: ServicesComponent;
  let fixture: ComponentFixture<ServicesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ServicesComponent],
      imports: [SharedModule, RouterTestingModule],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(ServicesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => document.getElementById('ld-json-dynamic')?.remove());

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('FAQ accordion', () => {
    it('should start with every row collapsed', () => {
      expect(component.openFaq()).toBeNull();
    });

    it('should open the clicked row', () => {
      component.toggleFaq(2);
      expect(component.openFaq()).toBe(2);
    });

    it('should collapse the row when the same row is clicked again', () => {
      component.toggleFaq(1);
      component.toggleFaq(1);
      expect(component.openFaq()).toBeNull();
    });

    it('should keep only one row open at a time', () => {
      component.toggleFaq(0);
      component.toggleFaq(3);
      expect(component.openFaq()).toBe(3);
    });

    it('should expose aria-expanded matching the open state', () => {
      component.toggleFaq(0);
      fixture.detectChanges();

      const buttons = fixture.nativeElement.querySelectorAll('.faq-q');
      expect(buttons[0].getAttribute('aria-expanded')).toBe('true');
      expect(buttons[1].getAttribute('aria-expanded')).toBe('false');
    });

    // Panels stay in the DOM so their height can animate; `inert` is what keeps
    // collapsed answers out of the tab order and the accessibility tree.
    it('should mark every collapsed panel inert and the open one not', () => {
      component.toggleFaq(0);
      fixture.detectChanges();

      const panels = fixture.nativeElement.querySelectorAll('.faq-a-wrap');
      expect(panels.length).toBe(component.faqs.length);
      expect(panels[0].hasAttribute('inert')).toBeFalse();
      expect(panels[1].hasAttribute('inert')).toBeTrue();
    });

    it('should mark all panels inert when nothing is open', () => {
      const panels = fixture.nativeElement.querySelectorAll('.faq-a-wrap');
      panels.forEach((p: HTMLElement) => expect(p.hasAttribute('inert')).toBeTrue());
    });

    it('should wire each panel to its button via aria-controls / aria-labelledby', () => {
      const button = fixture.nativeElement.querySelector('.faq-q');
      const panel = fixture.nativeElement.querySelector('.faq-a-wrap');
      expect(button.getAttribute('aria-controls')).toBe(panel.id);
      expect(panel.getAttribute('aria-labelledby')).toBe(button.id);
    });
  });

  describe('content rendering', () => {
    it('should render a card for every service offering', () => {
      expect(fixture.nativeElement.querySelectorAll('.svc-card').length)
        .toBe(component.services.length);
    });

    it('should render a tile for every industry', () => {
      expect(fixture.nativeElement.querySelectorAll('.ind-card').length)
        .toBe(component.industries.length);
    });

    it('should show the proof line inside each service card, not in a separate block', () => {
      const cards = fixture.nativeElement.querySelectorAll('.svc-card');
      cards.forEach((card: HTMLElement) => {
        expect(card.querySelector('.svc-proof')?.textContent?.trim()).toBeTruthy();
      });
    });

    // The featured flag shares a row with the icon so every card's title starts at
    // the same offset; if the flag ever moves back above the icon, that row breaks.
    it('should place the featured flag alongside the icon in the card head', () => {
      const featured = fixture.nativeElement.querySelector('.svc-card-featured');
      const head = featured.querySelector('.svc-card-head');

      expect(head).toBeTruthy();
      expect(head.querySelector('.svc-icon')).toBeTruthy();
      expect(head.querySelector('.svc-flag')).toBeTruthy();
      expect(featured.querySelector(':scope > .svc-flag')).toBeNull();
    });

    it('should give every card a head row so titles align across the grid', () => {
      const cards = fixture.nativeElement.querySelectorAll('.svc-card');
      cards.forEach((c: HTMLElement) => expect(c.querySelector('.svc-card-head')).toBeTruthy());
    });

    it('should index every card for the staggered reveal', () => {
      const cards = fixture.nativeElement.querySelectorAll('.svc-card');
      cards.forEach((c: HTMLElement, i: number) => {
        expect(c.style.getPropertyValue('--rvl-i')).toBe(String(i));
      });
    });

    it('should cap testimonials at three', () => {
      expect(component.testimonials.length).toBe(3);
    });
  });

  describe('conversion actions', () => {
    it('should point both CTAs at Calendly and WhatsApp only — no contact form on this route', () => {
      expect(component.calendlyUrl).toContain('calendly.com');
      expect(component.whatsappUrl).toContain('wa.me');
      expect(fixture.nativeElement.querySelector('form')).toBeNull();
    });

    it('should open every external CTA safely', () => {
      const links = fixture.nativeElement.querySelectorAll('a[target="_blank"]');
      expect(links.length).toBeGreaterThan(0);
      links.forEach((a: HTMLElement) => {
        expect(a.getAttribute('rel')).withContext(a.getAttribute('href') || '').toContain('noopener');
      });
    });
  });

  it('should cache sanitized icons so repeated change detection does not re-sanitize', () => {
    const svg = component.services[0].icon;
    expect(component.sanitizeIcon(svg)).toBe(component.sanitizeIcon(svg));
  });

  describe('iconMotion()', () => {
    it('should give every service its own authored motion signature', () => {
      const motions = component.services.map((s, i) => component.iconMotion(s.key, i));
      expect(new Set(motions).size).toBe(component.services.length);
    });

    it('should be deterministic — the same icon must not move differently between hovers', () => {
      const key = component.services[0].key;
      expect(component.iconMotion(key, 0)).toBe(component.iconMotion(key, 0));
      // Index is only a fallback; an authored key must ignore it entirely.
      expect(component.iconMotion(key, 99)).toBe(component.iconMotion(key, 0));
    });

    it('should fall back to a cycle for unauthored keys, never returning empty', () => {
      const a = component.iconMotion('some-unknown-key', 0);
      const b = component.iconMotion('another-unknown-key', 1);
      expect(a).toMatch(/^mo-/);
      expect(b).toMatch(/^mo-/);
      expect(a).not.toBe(b);
    });

    it('should never give two adjacent fallback icons the same motion', () => {
      const motions = component.differentiators.map((d, i) => component.iconMotion(d.title, i));
      motions.forEach((m, i) => {
        if (i > 0) { expect(m).not.toBe(motions[i - 1]); }
      });
    });

    it('should render the motion class onto every service icon', () => {
      const icons = fixture.nativeElement.querySelectorAll('.svc-icon');
      expect(icons.length).toBe(component.services.length);
      icons.forEach((icon: HTMLElement) => {
        const motion = Array.from(icon.classList).filter(c => c.startsWith('mo-'));
        expect(motion.length).withContext(icon.className).toBe(1);
      });
    });
  });
});
