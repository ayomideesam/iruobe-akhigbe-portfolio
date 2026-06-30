// pages/home/home.component.ts
import { Component, OnInit, ElementRef, AfterViewInit, ViewChild, DestroyRef, inject } from '@angular/core';
import { trigger, state, style, animate, transition, keyframes, query, stagger } from '@angular/animations';
import { Router } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ThemeService } from 'src/app/core/services/theme.service';
import { IconService } from 'src/app/core/services/icon.service';
import { AnalyticsService } from 'src/app/core/services/analytics.service';

interface Technology {
  name: string;
  icon: string;
  level: string;
}

interface Project {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  techStack: { name: string; color: string; }[];
  isHovered?: boolean;
}

interface Skill {
  name: string;
  level: number;
  experience: string;
  icon: string;
}

interface SkillCategory {
  name: CategoryName;
  skills: Skill[];
}

type CategoryName = 'Frontend Development' | 'Development Tools' | 'Testing & Quality';

interface Experience {
  role: string;
  company: string;
  period: string;
  location: string;
  technologies?: string[];
  type?: string;
  current?: boolean;
}

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css'],
    animations: [
        trigger('fadeInUp', [
            transition(':enter', [
                style({ transform: 'translateY(20px)', opacity: 0 }),
                animate('0.6s cubic-bezier(0.35, 0, 0.25, 1)', style({ transform: 'translateY(0)', opacity: 1 }))
            ])
        ]),
        trigger('fadeIn', [
            transition(':enter', [
                style({ opacity: 0 }),
                animate('0.6s cubic-bezier(0.35, 0, 0.25, 1)', style({ opacity: 1 }))
            ])
        ]),
        trigger('bounce', [
            state('*', style({})),
            transition('* <=> *', [
                animate('1s ease-in-out', keyframes([
                    style({ transform: 'translateY(0)', offset: 0 }),
                    style({ transform: 'translateY(-10px)', offset: 0.5 }),
                    style({ transform: 'translateY(0)', offset: 1 })
                ]))
            ])
        ]),
        trigger('skillHover', [
            state('rest', style({
                transform: 'translateY(0)',
                boxShadow: 'none'
            })),
            state('hovered', style({
                transform: 'translateY(-5px)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            })),
            transition('rest <=> hovered', animate('300ms ease'))
        ]),
        trigger('heroAnimation', [
            transition(':enter', [
                query('.hero-content > *', [
                    style({ opacity: 0, transform: 'translateY(30px)' }),
                    stagger(100, [
                        animate('0.8s cubic-bezier(0.35, 0, 0.25, 1)', style({ opacity: 1, transform: 'translateY(0)' }))
                    ])
                ])
            ])
        ]),
        trigger('backgroundAnimation', [
            transition(':enter', [
                style({ transform: 'scale(1.1)', opacity: 0 }),
                animate('1.5s cubic-bezier(0.35, 0, 0.25, 1)', style({ transform: 'scale(1)', opacity: 1 }))
            ])
        ]),
        // In your animations array
        trigger('techItemAnimation', [
            state('normal', style({
                filter: 'brightness(1)',
                // Remove rotation to preserve orbital position
                // transform: 'scale(1)'
            })),
            state('hovered', style({
                filter: 'brightness(1.2)',
                // Scale without rotation
                // transform: 'scale(1.1)'
            })),
            transition('normal <=> hovered', animate('300ms ease'))
        ]),
        trigger('projectAnimation', [
            transition(':enter', [
                query('.project-card', [
                    style({ opacity: 0, transform: 'translateY(50px)' }),
                    stagger(150, [
                        animate('0.6s cubic-bezier(0.35, 0, 0.25, 1)', style({ opacity: 1, transform: 'translateY(0)' }))
                    ])
                ])
            ])
        ]),
        trigger('projectHover', [
            state('rest', style({
                transform: 'scale(1)'
            })),
            state('hovered', style({
                transform: 'scale(1.02)'
            })),
            transition('rest <=> hovered', animate('300ms cubic-bezier(0.4, 0, 0.2, 1)'))
        ]),
        trigger('cardAnimation', [
            transition(':enter', [
                style({
                    opacity: 0,
                    transform: 'translateY(30px)'
                }),
                animate('0.6s {{delay}}ms cubic-bezier(0.4, 0, 0.2, 1)', style({
                    opacity: 1,
                    transform: 'translateY(0)'
                }))
            ])
        ]),
        trigger('skillsAnimation', [
            transition(':enter', [
                query('.skill-bar-fill', [
                    style({ width: 0 }),
                    stagger(100, [
                        animate('1s ease-out', style({ width: '*' }) // Change to use wildcard instead of param
                        )
                    ])
                ])
            ])
        ]),
        trigger('progressAnimation', [
            transition(':enter', [
                style({ width: 0 }),
                animate('1s ease-out', style({ width: '{{level}}%' }))
            ])
        ]),
        trigger('timelineAnimation', [
            state('void', style({
                opacity: 0,
                transform: 'translateX(-30px)'
            })),
            state('*', style({
                opacity: 1,
                transform: 'translateX(0)'
            })),
            transition('void => *', [
                animate('0.6s {{delay}}ms cubic-bezier(0.4, 0, 0.2, 1)')
            ])
        ])
    ],
    host: {
        '(mousemove)': 'onMouseMove($event)'
    },
    standalone: false
})

export class HomeComponent implements OnInit {
  private iconService = inject(IconService);
  private router = inject(Router);
  private elementRef = inject(ElementRef);
  private sanitizer = inject(DomSanitizer);
  private themeService = inject(ThemeService);
  private analytics = inject(AnalyticsService);
  private destroyRef = inject(DestroyRef);

  @ViewChild('heroCanvas') heroCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('orbitContainer') orbitContainer!: ElementRef;

  get isDarkTheme(): boolean { return this.themeService.isDarkTheme(); }
  private animationFrame: number | null = null;
  subtitle: string = "";
  mouseX = 0;
  mouseY = 0;
  particlesArray: any[] = [];
  isHeroVisible = false;
  activeProjectIndex = 0;
  hoveredTechIndex: number | null = null;

  technologies: Technology[] = [
    {
      name: 'CSS3',
      icon: this.iconService.getCss3Icon(),
      level: "Expert"
    },
    {
      name: 'TypeScript',
      icon: this.iconService.getTSIcon(),
      level: "Expert"
    },
    {
      name: 'Javascript',
      icon: this.iconService.getJSIcon(),
      level: "Experienced"
    },
    {
      name: 'HTML5',
      icon: this.iconService.getHtml5Icon(),
      level: "Expert"
    },
  ];

  centerTech: Technology = {
    name: 'Angular',
    icon: this.iconService.getAngularIcon(),
    level: "Expert"
  }

  featuredProjects: Project[] = [
    {
      id: 1,
      title: 'COSTAFF AI Digital Worker',
      description: '85% reduction in calendar management time — AI productivity suite integrating Gmail, Google Calendar & OpenAI for enterprise clients across the Middle East.',
      imageUrl: '/assets/img/costaff-calendar.avif',
      techStack: [
        { name: 'Angular 16', color: '#DD0031' },
        { name: 'TypeScript', color: '#3178C6' },
        { name: 'NGXS', color: '#BA2BD2' },
      ],
      isHovered: false
    },
    {
      id: 2,
      title: 'Globus Trade Application',
      description: '100% adoption by trade ops team within 6 months — CBN-mandated trade finance platform replacing a fully paper-based process at Globus Bank.',
      imageUrl: '/assets/img/trade-dashboard.png',
      techStack: [
        { name: 'Angular 17', color: '#DD0031' },
        { name: 'TypeScript', color: '#3178C6' },
        { name: 'RxJS', color: '#B7178C' },
      ],
      isHovered: false
    },
    {
      id: 3,
      title: 'Fraud Management System',
      description: '100% transaction coverage in week one — 14-engine real-time fraud detection system. Fraudulent incidents reduced 45% within 90 days of deployment.',
      imageUrl: '/assets/img/fraud-dashboard-light.png',
      techStack: [
        { name: 'Angular 16', color: '#DD0031' },
        { name: 'TypeScript', color: '#3178C6' },
        { name: 'WebSockets', color: '#4CAF50' }
      ],
      isHovered: false
    }
  ];

  hoveredSkill: Skill | null = null;

  skillCategories: SkillCategory[] = [
    {
      name: "Frontend Development",
      skills: [
        {
          name: "Angular",
          level: 95,
          experience: "9+ years",
          icon: this.iconService.getAngularIcon()
        },
        {
          name: "TypeScript",
          level: 90,
          experience: "7+ years",
          icon: this.iconService.getTSIcon()
        },
        {
          name: "HTML5",
          level: 95,
          experience: "9+ years",
          icon: this.iconService.getHtml5Icon()
        },
        {
          name: "CSS3",
          level: 95,
          experience: "9+ years",
          icon: this.iconService.getCss3Icon()
        },
        {
          name: "JavaScript",
          level: 90,
          experience: "9+ years",
          icon: this.iconService.getJSIcon()
        }
      ]
    },
    {
      name: "Development Tools",
      skills: [
        {
          name: "VS Code",
          level: 90,
          experience: "7+ years",
          icon: this.iconService.getVScodeIcon()
        },
        {
          name: "Git",
          level: 90,
          experience: "7+ years",
          icon: this.iconService.getGitIcon()
        },
        {
          name: "Jenkins",
          level: 85,
          experience: "4+ years",
          icon: this.iconService.getJenkinsIcon()
        }
      ]
    },
    {
      name: "Testing & Quality",
      skills: [
        {
          name: "Postman",
          level: 95,
          experience: "7+ years",
          icon: this.iconService.getPostmanIcon()
        },
        {
          name: "Swagger",
          level: 95,
          experience: "6+ years",
          icon: this.iconService.getSwaggerIcon()
        },
        {
          name: "Jest",
          level: 85,
          experience: "4+ years",
          icon: this.iconService.getJestIcon()
        },
        {
          name: "Selenium",
          level: 80,
          experience: "4+ years",
          icon: this.iconService.getSeleniumIcon()
        }
      ]
    }
  ];

  hoveredExp: Experience | null = null;
  isVisible = false;

  readonly githubUrl = 'https://github.com/ayomideesam';

  // Ambient star particles for the hero + CTA backgrounds
  particles = Array.from({ length: 16 });
  // Softer, fewer ambient "dust" particles for the content sections
  motes = Array.from({ length: 10 });

  currentlyBuilding = {
    project: 'Credit Approval Process (CAP)',
    company: 'Globus Bank',
    description: 'Digitising end-to-end credit lifecycle management for Nigeria\'s most CBN-compliant banking workflow — four facility modules, 10+ role sequential approval chain, and a two-stage committee governance engine.',
    modules: [
      {
        name: 'Retail Module',
        status: 'finalising' as const,
        statusLabel: 'In Final UAT',
        description: 'Completing the end-to-end retail credit lifecycle for individual customers — multi-step form engine, automated PEP/BVN screening at origination, MCC committee voting engine, and full disbursement workflow heading into general release for all branch users.',
        tech: ['Angular 20', 'Signals', 'RxJS', 'TypeScript'],
        progress: 93
      },
      {
        name: 'Corporate Module',
        status: 'upcoming' as const,
        statusLabel: 'Starting Next',
        description: 'Next phase covers SME and large corporate facilities — mandatory Environmental & Social (E&S) governance review, director-related account flagging, live CRC credit scoring, and BCC board escalation for ₦100M+ facilities.',
        tech: ['Angular 20', 'TypeScript', 'NgRx Signals'],
        progress: 10
      }
    ]
  };

  testimonials = [
    {
      quote: 'I highly recommend Akhigbe Iruobe as a Senior Frontend Engineer. Although he doesn\'t manage me directly, he has consistently supported me with code reviews, logic improvements, and technical guidance. He\'s intuitive, reliable, and always delivers high-quality work. What stands out most is his willingness to help — he\'s always open to assisting others and explaining complex concepts clearly. He\'s a strong team player and a valuable asset to any engineering team.',
      author: 'Nonye Ibeanu',
      role: 'Frontend Engineer',
      company: 'Globus Bank',
      initials: 'NI',
      relationship: 'Senior colleague at Globus Bank'
    },
    {
      quote: 'I\'ve had the pleasure of working with Akhigbe Iruobe, and he consistently demonstrates professionalism, reliability, and strong attention to detail. He takes ownership of his work and always delivers quality results. I highly recommend him to any team looking for someone dependable and growth-driven.',
      author: 'Ekop Takon',
      role: 'Frontend Developer',
      company: 'Globus Bank',
      initials: 'ET',
      relationship: 'Direct report at Globus Bank'
    },
    {
      quote: 'I can speak confidently on Ayomide\'s web development skills having worked with him at Upperlink to build several top-notch software solutions. Ayomide is very dedicated and approaches his tasks with an uncommon enthusiasm. Simply put, you can always count on him to deliver. Highly proficient technical skills equally matched with friendliness — this makes him great at working independently and in a team. Any organisation will be lucky to have him join them.',
      author: 'Adefisola Adigun',
      role: 'Backend Developer',
      company: 'Upperlink LTD',
      initials: 'AA',
      relationship: 'Worked together at Upperlink'
    },
    {
      quote: 'I had the pleasure of working with AY, and I can confidently say he is an outstanding Frontend Developer. He has a strong eye for detail and a natural ability to transform ideas and designs into smooth, user-friendly experiences. What stands out most is how he balances creativity with functionality — delivering clean, responsive interfaces while maintaining performance and usability. He communicates clearly, collaborates well, and takes full ownership of his work.',
      author: 'Victor Johnson',
      role: 'Backend Architect',
      company: 'Zenith Bank',
      initials: 'VJ',
      relationship: 'Peer — different teams at Zenith Bank'
    },
    {
      quote: 'I have had the privilege of working closely with Ayomide at Zenith Bank, where he has consistently proven himself as an outstanding Front-End Developer. His skills are truly remarkable — he adeptly combines these technologies to craft seamless and visually appealing user interfaces that leave a lasting impression. His technical depth, creativity, and commitment to quality make him a standout in any engineering team.',
      author: 'Adesoji Oyewusi',
      role: 'UI/UX Designer',
      company: 'Zenith Bank',
      initials: 'AO',
      relationship: 'Different team at Zenith Bank'
    }
  ];

  canScrollPrev = false;
  canScrollNext = true;
  @ViewChild('testimonialsTrack') testimonialsTrack!: ElementRef;

  scrollTestimonials(dir: number) {
    const track = this.testimonialsTrack?.nativeElement as HTMLElement;
    if (!track) return;
    const card = track.querySelector('.testimonial-card') as HTMLElement;
    const gap = 24;
    const scrollAmount = card ? card.offsetWidth + gap : 420;
    track.scrollBy({ left: scrollAmount * dir, behavior: 'smooth' });
  }

  onTrackScroll(e: Event) {
    const el = e.target as HTMLElement;
    this.canScrollPrev = el.scrollLeft > 10;
    this.canScrollNext = el.scrollLeft < (el.scrollWidth - el.clientWidth - 10);
  }

  experiences: Experience[] = [
    {
      role: 'Senior Frontend Engineer',
      company: 'Globus Bank Plc',
      period: 'Jan 2024 - Present',
      location: 'Victoria Island, Nigeria',
      type: 'Full-time',
      current: true,
      technologies: ['Angular 20', 'TypeScript', 'RxJS', 'Signals']
    },
    {
      role: 'Senior Angular Engineer & Tech Lead',
      company: 'HiedBerg LTD',
      period: 'Jun 2024 - Sept 2024',
      location: 'United Kingdom (Remote)',
      type: 'Contract',
      technologies: ['Angular', 'TypeScript', 'RxJS']
    },
    {
      role: 'Frontend Team Lead',
      company: 'Zenith Bank PLC',
      period: 'Dec 2022 - Feb 2024',
      location: 'Victoria Island, Nigeria',
      type: 'Contract',
      technologies: ['Angular', 'TypeScript', 'Jenkins', 'SSR']
    },
    {
      role: 'Senior Frontend Engineer',
      company: 'Samsky Pay UK',
      period: 'Feb 2022 - Dec 2022',
      location: 'London, UK',
      type: 'Full-time',
      technologies: ['Angular', 'AWS', 'Selenium']
    },
    {
      role: 'Intermediate Frontend Engineer',
      company: 'Upperlink LTD',
      period: 'Jun 2018 - Feb 2022',
      location: 'Alausa, Nigeria',
      type: 'Full-time',
      technologies: ['Angular', 'Postman', 'Jenkins', 'Selenium']
    }
  ];

  private animationInterval: any;

  constructor() {
    this.destroyRef.onDestroy(() => {
      if (this.animationFrame) {
        cancelAnimationFrame(this.animationFrame);
        this.animationFrame = null;
      }
    });
  }

  ngOnInit() {
    this.initializeOrbitAnimation();
    this.initIntersectionObserver();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  ngAfterViewInit() {
    const techItems = this.elementRef.nativeElement.querySelectorAll('.tech-item');
    techItems.forEach((item: HTMLElement, index: number) => {
      const transform = this.getInitialPosition(index);
      item.setAttribute('data-initial-transform', transform);
      item.style.transform = transform;
    });
  }

  private initIntersectionObserver() {
    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 0.2
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Add both classes to trigger animations
          entry.target.classList.add('animate', 'in-view');
          observer.unobserve(entry.target);
        }
      });
    }, options);

    // Update section selectors
    const sections = document.querySelectorAll(
      '.featured-projects, .skills-section, .experience-section, .cta-section, .companies-section'
    );

    sections.forEach(section => {
      // Set initial state
      section.classList.add('animation-ready');
      observer.observe(section);
    });
  }

  getInitialPosition(index: number): string {
    // Wrap the index to stay within bounds of the positions array
    const positions = [
      { x: 140, y: -30 },   // Top (CSS3)
      { x: 350, y: 90 },    // Right (TypeScript) 
      { x: 175, y: 200 },   // Bottom (JavaScript)
      { x: -35, y: -50 }    // Left (HTML5)
    ];
  
    // Ensure index is within bounds
    const safeIndex = index % positions.length;
    const item = positions[safeIndex];
    
    if (!item) {
      // Provide default fallback position if needed
      return 'translate(0px, 0px)';
    }
  
    return `translate(${item.x}px, ${item.y}px)`;
  }

  private initializeOrbitAnimationzz(): void {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }

    const orbitElement = this.elementRef.nativeElement.querySelector('.tech-items');
    if (!orbitElement) return;

    let rotation = 0;
    const animate = () => {
      rotation = (rotation + 0.2) % 360; // Adjust speed by changing the increment

      const techItems = orbitElement.querySelectorAll('.tech-items .tech-item');
      techItems.forEach((item: HTMLElement, index: number) => {
        const angle = (index / this.technologies.length) * 2 * Math.PI;
        const x = 150 * Math.cos(angle + rotation * Math.PI / 180);
        const y = 150 * Math.sin(angle + rotation * Math.PI / 180);
        item.style.transform = `translate(${x}px, ${y}px)`;
      });

      // Rotate the centerTech icon in the opposite direction
      const centerTechItem = orbitElement.querySelector('.center-item .tech-item');
      if (centerTechItem) {
        centerTechItem.style.transform = `translate(-50%, -50%) rotate(${-rotation}deg)`;
      }

      this.animationFrame = requestAnimationFrame(animate);
    };

    this.animationFrame = requestAnimationFrame(animate);
  }

  private initializeOrbitAnimation(): void {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }

    const orbitElement = this.elementRef.nativeElement.querySelector('.tech-items');
    if (!orbitElement) return;

    let rotation = 0;
    const animate = () => {
      rotation = (rotation + 0.2) % 360; // Adjust speed by changing the increment

      const techItems = orbitElement.querySelectorAll('.tech-items .tech-item');
      techItems.forEach((item: HTMLElement, index: number) => {
        if (index === this.hoveredTechIndex) {
          return;
        }

        const initialTransform: any = item.getAttribute('data-initial-transform');
        // if (initialTransform) {
        //   item.style.transform = `${initialTransform} rotate(${index * 90 + rotation}deg)`;
        // }
        if (initialTransform) {
          // Combine position and rotation transforms in a consistent order
          const translate = initialTransform.match(/translate\([^)]+\)/)[0];
          const newTransform = `${translate} rotate(${rotation}deg)`;
          item.style.transform = newTransform;
        }
      });

      // Rotate the centerTech icon in the opposite direction
      const centerTechItem = orbitElement.querySelector('.center-item .tech-item');
      if (centerTechItem) {
        centerTechItem.style.transform = `translate(-50%, -50%) rotate(${-rotation}deg)`;
      }

      this.animationFrame = requestAnimationFrame(animate);
    };

    this.animationFrame = requestAnimationFrame(animate);
  }

  onTechHover(index: number): void {
    this.hoveredTechIndex = index;
  }

  onTechLeave(): void {
    this.hoveredTechIndex = null;
  }

  onMouseMove(event: MouseEvent) {
    // Mouse-follow glow for the interactive sections
    const glowSections = this.elementRef.nativeElement.querySelectorAll(
      '.featured-projects, .skills-section, .experience-section'
    );
    glowSections.forEach((section: HTMLElement) => {
      const rect = section.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 100;
      const y = ((event.clientY - rect.top) / rect.height) * 100;
      if (x >= 0 && x <= 100 && y >= 0 && y <= 100) {
        section.style.setProperty('--x', `${x}%`);
        section.style.setProperty('--y', `${y}%`);
      }
    });

    // Subtle parallax: the hero starfield drifts gently toward the cursor
    const hero = this.elementRef.nativeElement.querySelector('.hero-section');
    const heroParticles = this.elementRef.nativeElement.querySelector('.hero-particles');
    if (hero && heroParticles) {
      const r = hero.getBoundingClientRect();
      if (
        event.clientX >= r.left && event.clientX <= r.right &&
        event.clientY >= r.top && event.clientY <= r.bottom
      ) {
        const dx = (event.clientX - (r.left + r.width / 2)) / (r.width / 2);
        const dy = (event.clientY - (r.top + r.height / 2)) / (r.height / 2);
        const max = 14;
        heroParticles.style.setProperty('--parallax-x', `${(dx * max).toFixed(1)}px`);
        heroParticles.style.setProperty('--parallax-y', `${(dy * max).toFixed(1)}px`);
      }
    }
  }

  getSkillIcon(icon: string): string {
    return icon;
  }

  getCategoryIcon(category: CategoryName): string {
    const icons: Record<CategoryName, string> = {
      'Frontend Development': this.iconService.getFrontendDevelopmentIcon(),
      'Development Tools': this.iconService.getDevelopmentToolsIcon(),
      'Testing & Quality': this.iconService.getTestingQualityIcon()
    };

    return icons[category] || icons['Frontend Development'];
  }

  sanitizeIcon(icon: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(icon);
  }


  navigateToProject(projectId: number) {
    // Navigate to projects page with the project ID as a fragment
    this.router.navigate(['/projects'], {
      fragment: `project-${projectId}`,
      state: { scrollToProject: true }
    }).then(() => {
      // Wait for navigation to complete
      setTimeout(() => {
        const element = document.getElementById(`project-${projectId}`);
        if (element) {
          // Scroll to element with offset
          const headerHeight = 80; // Adjust based on your header height
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerHeight;

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      }, 100);
    });
  }

  // Finishing up the HomeComponent class methods
  navigateToProjects() {
    this.router.navigate(['/projects']).then(() => {
      window.scrollTo(0, 0);
    });
  }

  navigateToContact() {
    this.router.navigate(['/contact']).then(() => {
      window.scrollTo(0, 0);
    });
  }

  getSkillColor(proficiency: number): string {
    if (proficiency >= 90) return '#10B981'; // Emerald
    if (proficiency >= 80) return '#3B82F6'; // Blue
    if (proficiency >= 70) return '#6366F1'; // Indigo
    return '#8B5CF6'; // Violet
  }

  // Objective competency tier (replaces percentage bars)
  getTier(level: number): string {
    if (level >= 90) return 'Expert';
    if (level >= 80) return 'Advanced';
    return 'Proficient';
  }

  // Helper function for gradual delays
  getStaggerDelay(index: number): number {
    return index * 100;
  }

  // You already have these from your existing code
  getCompanyColor(company: string): string {
    // Define a mapping of companies to their specific colors
    const companyColors: { [key: string]: string } = {
      'HiedBerg LTD': '#45B6FD',       // Sky blue
      'Globus Bank Plc': '#EB2331',    // Globus red
      'Zenith Bank PLC': '#E2231A',    // Zenith red
      'Samsky Pay UK': '#0195FF',      // Blue
      'Upperlink LTD': '#2563EB',      // Indigo blue
    };

    // Return the mapped color or a default color if company isn't found
    return companyColors[company] || '#6B7280'; // Gray as fallback
  }

  // Computes a human-readable tenure (e.g. "2 yrs 6 mos") from a period like
  // "Jan 2024 - Present" or "Dec 2022 - Feb 2024".
  getTenure(period: string): string {
    const months: { [key: string]: number | undefined } = {
      jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
      jul: 6, aug: 7, sep: 8, sept: 8, oct: 9, nov: 10, dec: 11
    };

    const parse = (value: string): Date | null => {
      const text = value.trim();
      if (/present/i.test(text)) return new Date();
      const match = text.match(/([A-Za-z]+)\s+(\d{4})/);
      if (!match) return null;
      const month = months[match[1].toLowerCase()];
      if (month === undefined) return null;
      return new Date(parseInt(match[2], 10), month, 1);
    };

    const parts = period.split(/\s+[-–—]\s+/);
    if (parts.length < 2) return '';

    const start = parse(parts[0]);
    const end = parse(parts[1]);
    if (!start || !end) return '';

    // Inclusive of both endpoint months (LinkedIn-style durations)
    let totalMonths = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth()) + 1;
    if (totalMonths < 1) totalMonths = 1;

    const years = Math.floor(totalMonths / 12);
    const remMonths = totalMonths % 12;
    const yearLabel = years > 0 ? `${years} yr${years > 1 ? 's' : ''}` : '';
    const monthLabel = remMonths > 0 ? `${remMonths} mo${remMonths > 1 ? 's' : ''}` : '';

    return [yearLabel, monthLabel].filter(Boolean).join(' ') || '1 mo';
  }

  getTimelinePosition(index: number): string {
    return index % 2 === 0 ? 'timeline-left' : 'timeline-right';
  }

  onIntersection(entries: IntersectionObserverEntry[], observer: IntersectionObserver) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate');
        observer.unobserve(entry.target);
      }
    });
  }

  viewProject(id: string) {
    this.analytics.trackProjectView(id);
  }

}
