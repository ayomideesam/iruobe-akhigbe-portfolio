// components/company-scroller/company-scroller.component.ts
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { IconService } from 'src/app/core/services/icon.service';

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
            <div class="logo-wrapper" *ngFor="let company of companies">
              <div class="company-logo" [attr.aria-label]="company.name">
              <div class="logo-content">
                <div class="svg-container" [innerHTML]="company.logo | safeHtml"></div>
                <span class="company-name">{{company.name}}</span>
              </div>
              </div>
            </div>
          </div>
          <div class="logos-slide" [@scrollAnimation]="animationState">
            <div class="logo-wrapper" *ngFor="let company of companies">
              <div class="company-logo" [attr.aria-label]="company.name">
              <div class="logo-content">
                <div class="svg-container" [innerHTML]="company.logo | safeHtml"></div>
                <span class="company-name">{{company.name}}</span>
              </div>
              </div>
            </div>
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
  companies: Company[] = [
    {
      name: 'HiedBerg LTD',
      logo: this.iconService.getHiedbergIcon()
    },
    {
      name: 'Globus Bank Ltd',
      logo: this.iconService.getGlobusIcon()
    },
    {
      name: 'Zenith Bank Ltd',
      logo: this.iconService.getZenithIcon()
    },
    {
      name: 'Conclase Int',
      logo: this.iconService.getConclaseIcon()
    },
    {
      name: 'NIBSS',
      logo: this.iconService.getNibssIcon()
    },
    {
      name: 'Guaranty Trust Bank Ltd',
      logo: this.iconService.getGTIcon()
    },
    {
      name: 'Jumbo Sports',
      logo: this.iconService.getJumboIcon()
    },
    {
      name: 'Samsky Pay',
      logo: this.iconService.getSamskyIcon()
    },
    {
      name: 'Upperlink Ltd',
      logo: this.iconService.getUpperlinkIcon()
    },
    {
      name: 'Golden Scepter Ltd',
      logo: this.iconService.getGSIcon()
    }
  ];
  animationState = 'initial';
  private animationInterval: any;

  constructor(
    private cdr: ChangeDetectorRef,
    private iconService: IconService
  )  { }

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

  ngOnDestroy() {
    if (this.animationInterval) {
      clearInterval(this.animationInterval);
    }
    this.stopAnimation();
  }
}