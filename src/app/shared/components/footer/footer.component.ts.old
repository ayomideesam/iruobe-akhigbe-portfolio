import { Component, OnInit, inject, signal, DestroyRef } from '@angular/core';
import { trigger, state, style, animate, transition, query, stagger } from '@angular/animations';
import { interval } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AnalyticsService } from 'src/app/core/services';

@Component({
    selector: 'app-footer',
    templateUrl: './footer.component.html',
    styleUrls: ['./footer.component.css'],
    animations: [
        trigger('staggerAnimation', [
            transition('void => *', [
                query(':enter', [
                    style({ opacity: 0, transform: 'translateY(20px)' }),
                    stagger(100, [
                        animate('0.5s ease', style({ opacity: 1, transform: 'translateY(0)' }))
                    ])
                ], { optional: true })
            ])
        ]),
        trigger('fadeSlideUp', [
            transition(':enter', [
                style({ opacity: 0, transform: 'translateY(20px)' }),
                animate('0.6s ease', style({ opacity: 1, transform: 'translateY(0)' }))
            ])
        ]),
        trigger('linkHover', [
            state('rest', style({
                transform: 'translateX(0)',
                backgroundColor: 'var(--link-bg)'
            })),
            state('hovered', style({
                transform: 'translateX(5px)',
                backgroundColor: 'var(--link-bg-hover)'
            })),
            transition('rest <=> hovered', animate('0.3s ease'))
        ]),
        trigger('socialHover', [
            state('rest', style({ transform: 'translateX(0)' })),
            state('hovered', style({ transform: 'translateX(5px)' })),
            transition('rest <=> hovered', animate('0.3s ease'))
        ]),
        trigger('contactHover', [
            state('rest', style({
                transform: 'scale(1)',
                backgroundColor: 'var(--contact-bg)'
            })),
            state('hovered', style({
                transform: 'scale(1.02)',
                backgroundColor: 'var(--contact-hover-bg)'
            })),
            transition('rest <=> hovered', animate('0.3s ease'))
        ]),
        trigger('youtubeHover', [
            state('rest', style({ transform: 'translateY(0)' })),
            state('hovered', style({ transform: 'translateY(-2px)' })),
            transition('rest <=> hovered', animate('0.3s ease'))
        ])
    ],
    standalone: false
})
export class FooterComponent implements OnInit {
  private analyticsService = inject(AnalyticsService);
  private destroyRef = inject(DestroyRef);
  navLinks = [
    { path: '/', label: 'Home', exact: true, isHovered: false },
    { path: '/projects', label: 'Projects', exact: false, isHovered: false },
    { path: '/contact', label: 'Contact', exact: false, isHovered: false },
    { path: '/resume', label: 'Resume', exact: false, isHovered: false }
  ];
  emailIcon = 
  `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
    <polyline points="22,6 12,13 2,6"></polyline>
  </svg>`;

  socialLinks = [
    {
      name: 'LinkedIn',
      url: 'https://www.linkedin.com/in/akhigbe-iruobe/',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>`,
      isHovered: false
    },
    {
      name: 'GitHub',
      url: 'https://github.com/ayomideesam',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
            </svg>`,
      isHovered: false
    },
    {
      name: 'WhatsApp',
      url: 'https://api.whatsapp.com/send/?phone=2347038772342&text&type=phone_number&app_absent=0',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>`,
      isHovered: false
    },
    {
      name: 'YouTube',
      url: 'https://www.youtube.com/@AyomideIruobe',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M23.5 6.2c-.3-1.1-1.1-1.9-2.2-2.2C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.3.5c-1.1.3-1.9 1.1-2.2 2.2C0 8 0 12 0 12s0 4 .5 5.8c.3 1.1 1.1 1.9 2.2 2.2 1.8.5 9.3.5 9.3.5s7.5 0 9.3-.5c1.1-.3 1.9-1.1 2.2-2.2.5-1.8.5-5.8.5-5.8s0-4-.5-5.8zM9.5 15.5v-7l6.2 3.5-6.2 3.5z"/>
            </svg>`,
      isHovered: false
    },
    {
      name: 'Twitter',
      url: 'https://twitter.com/akhigbe_dev',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
            </svg>`,
      isHovered: false
    }
  ];

  readonly emailHovered = signal(false);
  readonly phoneHovered = signal(false);
  readonly youtubeHovered = signal(false);

  readonly lagosTime = signal('');
  readonly isBusinessHours = signal(false);

  portfolioStats = [
    { value: '9+', label: 'Years Experience' },
    { value: '12+', label: 'Enterprise Projects' },
    { value: '30K+', label: 'Daily Users Served' },
    { value: '0', label: 'Post-Launch Bugs' }
  ];

  ngOnInit(): void {
    this.updateLagosClock();
    interval(1000).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.updateLagosClock());
  }

  private updateLagosClock(): void {
    const now = new Date();
    this.lagosTime.set(now.toLocaleTimeString('en', {
      timeZone: 'Africa/Lagos',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    }));
    const lagosHour = parseInt(new Intl.DateTimeFormat('en', {
      timeZone: 'Africa/Lagos',
      hour: 'numeric',
      hour12: false
    }).format(now), 10);
    const isSunday = new Intl.DateTimeFormat('en', { timeZone: 'Africa/Lagos', weekday: 'short' }).format(now) === 'Sun';
    this.isBusinessHours.set(lagosHour >= 8 && lagosHour < 19 && !isSunday);
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  getYear(): number {
    return new Date().getFullYear();
  }
}