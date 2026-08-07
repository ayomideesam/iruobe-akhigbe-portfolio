// components/company-scroller/company-scroller.component.ts
import { ChangeDetectorRef, Component, DestroyRef, OnInit, inject } from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';

interface Company {
  name: string;
  logo: string;
}

@Component({
    selector: 'app-company-scroller',
    template: `
    <section class="companies-section">
      <h2 class="section-title">Trusted across fintech &amp; enterprise</h2>
      <div class="logos-container">
        <div class="logos-track">
          <div class="logos-slide" [@scrollAnimation]="animationState">
            @for (company of companies; track company.name) {
            <div class="logo-wrapper">
              <div class="company-logo" [attr.aria-label]="company.name">
              <div class="logo-content">
                <!-- No loading="lazy": this is a horizontally-translating marquee, so
                     logos 7-10 sit outside the viewport on the X axis and lazy loading
                     leaves visible gaps until the animation drags them into view.
                     fetchpriority="low" keeps them from competing with critical assets. -->
                <div class="svg-container">
                  <img [src]="company.logo" [alt]="company.name + ' logo'" width="48" height="48" fetchpriority="low" decoding="async">
                </div>
                <span class="company-name">{{company.name}}</span>
              </div>
              </div>
            </div>
            }
          </div>
          <div class="logos-slide" [@scrollAnimation]="animationState">
            @for (company of companies; track company.name) {
            <div class="logo-wrapper">
              <div class="company-logo" [attr.aria-label]="company.name">
              <div class="logo-content">
                <div class="svg-container">
                  <img [src]="company.logo" [alt]="company.name + ' logo'" width="48" height="48" fetchpriority="low" decoding="async">
                </div>
                <span class="company-name">{{company.name}}</span>
              </div>
              </div>
            </div>
            }
          </div>
        </div>
      </div>
    </section>
  `,
    styleUrls: ['./company-scroller.component.css'],
    animations: [
        trigger('scrollAnimation', [
            state('initial', style({
                transform: 'translateX(0)'
            })),
            state('scrolling', style({
                transform: 'translateX(-50%)'
            })),
            transition('initial => scrolling', [
                animate('30s linear')
            ]),
            transition('scrolling => initial', [
                animate('0s')
            ])
        ])
    ],
    standalone: false
})
export class CompanyScrollerComponent implements OnInit {
  private cdr = inject(ChangeDetectorRef);
  private destroyRef = inject(DestroyRef);

  // Logos are static assets, not inline SVG strings. They previously lived in
  // IconService as ~21,000 lines of template literals that webpack shipped and the
  // browser parsed as JavaScript on every visit. As files they are cached, fetched
  // in parallel, lazy-loaded below the fold, and gzipped by the CDN.
  companies: Company[] = [
    { name: 'HiedBerg LTD', logo: 'assets/logos/hiedberg.svg' },
    { name: 'Globus Bank Ltd', logo: 'assets/logos/globus.svg' },
    { name: 'Zenith Bank Ltd', logo: 'assets/logos/zenith.svg' },
    { name: 'Conclase Int', logo: 'assets/logos/conclase.svg' },
    { name: 'NIBSS', logo: 'assets/logos/nibss.svg' },
    { name: 'Guaranty Trust Bank Ltd', logo: 'assets/logos/gtbank.svg' },
    { name: 'Jumbo Sports', logo: 'assets/logos/jumbo.svg' },
    { name: 'Samsky Pay', logo: 'assets/logos/samsky.svg' },
    { name: 'Upperlink Ltd', logo: 'assets/logos/upperlink.svg' },
    { name: 'Golden Scepter Ltd', logo: 'assets/logos/golden-scepter.svg' }
  ];
  animationState = 'initial';
  private animationInterval: any;

  constructor() {
    this.destroyRef.onDestroy(() => this.stopAnimation());
  }

  ngOnInit() {
    this.startContinuousAnimation();
  }

  private startContinuousAnimation() {
    // Use intersection observer to start/stop animation based on visibility
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.startAnimation();
        } else {
          this.stopAnimation();
        }
      });
    }, { threshold: 0.1 });

    const container = document.querySelector('.logos-container');
    if (container) {
      observer.observe(container);
    }
  }

  private startAnimation() {
    // Cancel any existing interval
    this.stopAnimation();

    // Start animation cycle
    const animateCycle = () => {
      this.animationState = 'scrolling';
      this.cdr.detectChanges();

      // Set a timeout to reset to initial state
      setTimeout(() => {
        this.animationState = 'initial';
        this.cdr.detectChanges();

        // Restart the cycle
        this.animationInterval = setTimeout(animateCycle, 30);
      }, 30000); // Duration of scrolling
    };

    // Start the first cycle
    animateCycle();
  }

  private stopAnimation() {
    if (this.animationInterval) {
      clearTimeout(this.animationInterval);
      this.animationInterval = null;
    }
  }

}
