import { Component, HostListener, OnInit, AfterViewInit, OnDestroy, NgZone, inject } from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { Router } from '@angular/router';
import { SeoService } from 'src/app/core/services/seo.service';
import { ProjectDataService } from 'src/app/core/services/project-data.service';
import { AnalyticsService } from 'src/app/core/services/analytics.service';

interface Project {
  id: number;
  title: string;
  description: string;
  techStack: { name: string; color: string; }[];
  achievements: string[];
  isHovered?: boolean;
  images?: any;
  stats?: { value: string; label: string; }[];
  pipeline?: { name: string; meta: string; }[];
  pipelineLabel?: string;
}

interface AssessmentProject {
  id: number;
  type: 'assessment';
  title: string;
  assessmentBy: string;
  assessmentBrief: string;
  description: string;
  techStack: { name: string; color: string; }[];
  achievements: string[];
  demoUrl: string;
  repoUrl: string;
  level: 'senior' | 'mid';
  accentColor: string;
  accentColorRgb: string;
  isHovered?: boolean;
  images?: string[];
}

@Component({
    selector: 'app-projects',
    templateUrl: './projects.component.html',
    styleUrls: ['./projects.component.css'],
    animations: [
        trigger('fadeIn', [
            transition(':enter', [
                style({ opacity: 0, transform: 'translateY(20px)' }),
                animate('0.6s ease', style({ opacity: 1, transform: 'translateY(0)' })),
            ]),
        ]),
        trigger('cardHover', [
            state('rest', style({
                transform: 'translateY(0)',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            })),
            state('hover', style({
                transform: 'translateY(-5px)',
                boxShadow: '0 12px 24px rgba(0, 0, 0, 0.15)'
            })),
            transition('rest <=> hover', animate('0.3s ease')),
        ]),
        trigger('scrollTextAnimation', [
            state('normal', style({
                opacity: 0.8,
                transform: 'translateY(0)'
            })),
            state('hidden', style({
                opacity: 0,
                transform: 'translateY(-20px)'
            })),
            transition('normal <=> hidden', [
                animate('1s ease-in-out')
            ])
        ])
    ],
    host: {
        '(mousemove)': 'onMouseMove($event)'
    },
    standalone: false
})

export class ProjectsComponent implements OnInit, AfterViewInit, OnDestroy {
  private router = inject(Router);
  private seoService = inject(SeoService);
  private projectData = inject(ProjectDataService);
  private analytics = inject(AnalyticsService);
  private zone = inject(NgZone);
  private cardListeners: Array<{ el: HTMLElement; enter: EventListener; move: EventListener; leave: EventListener; cancel: () => void }> = [];

  scrollState = 'normal';
  readonly githubUrl = 'https://github.com/ayomideesam';

  aboutText = {
    para1: 'I build the software that banks use to run their most critical operations — credit approval workflows, real-time fraud detection, and trade finance platforms that regulators audit.',
    para2: 'Every project here was delivered inside a CBN-regulated environment: strict security requirements, multi-role access control, audit trail compliance, and zero tolerance for UI bugs on live financial data.',
    para3: 'My constraint is always the same: build it fast enough for a deadline, and robust enough for 100,000+ daily users. That tension is what I\'ve been solving across 9 years and six enterprise applications.',
    para4: 'If you\'re hiring a frontend engineer who delivers under compliance pressure and leads a team while doing it — these are the receipts.'
  };

  projects: Project[] = this.projectData.getProjects();
  assessmentProjects: AssessmentProject[] = this.projectData.getAssessmentProjects();

  @HostListener('window:scroll', [])
  onWindowScroll() {
    const scrollPosition = window.pageYOffset;
    if (scrollPosition > 100) {
      this.scrollState = 'hidden';
    } else {
      this.scrollState = 'normal';
    }
  }

  tiltEnabled = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  onMouseMove(event: MouseEvent) {
    const cards = document.querySelectorAll('.project-card, .assessment-card');
    cards.forEach(card => {
      const el = card as HTMLElement;
      const rect = el.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 100;
      const y = ((event.clientY - rect.top) / rect.height) * 100;
      el.style.setProperty('--x', `${x}%`);
      el.style.setProperty('--y', `${y}%`);
    });
  }

  ngAfterViewInit() {
    if (!this.tiltEnabled) return;
    this.zone.runOutsideAngular(() => {
      document.querySelectorAll<HTMLElement>('.assessment-card').forEach(card => {
        let targetRx = 0, targetRy = 0;
        let currentRx = 0, currentRy = 0, currentLift = 0;
        let isOver = false;
        let rafId: number | null = null;
        let restRect: DOMRect | null = null;
        const LERP = 0.10;

        const tick = () => {
          currentRx += ((isOver ? targetRx : 0) - currentRx) * LERP;
          currentRy += ((isOver ? targetRy : 0) - currentRy) * LERP;
          currentLift += ((isOver ? -6 : 0) - currentLift) * LERP;

          if (!isOver && Math.abs(currentRx) < 0.01 && Math.abs(currentRy) < 0.01 && Math.abs(currentLift) < 0.01) {
            card.style.transform = '';
            rafId = null;
            return;
          }
          card.style.transform =
            `translateY(${currentLift.toFixed(2)}px) perspective(1200px) ` +
            `rotateX(${currentRx.toFixed(3)}deg) rotateY(${currentRy.toFixed(3)}deg)`;
          rafId = requestAnimationFrame(tick);
        };

        const enter = () => {
          restRect = card.getBoundingClientRect();
          isOver = true;
          if (!rafId) rafId = requestAnimationFrame(tick);
        };

        const move = (e: Event) => {
          if (!restRect) return;
          const me = e as MouseEvent;
          const fx = Math.max(0, Math.min(1, (me.clientX - restRect.left) / restRect.width));
          const fy = Math.max(0, Math.min(1, (me.clientY - restRect.top) / restRect.height));
          targetRx = (fy - 0.5) * -4;
          targetRy = (fx - 0.5) * 4;
        };

        const leave = () => {
          isOver = false;
          restRect = null;
          if (!rafId) rafId = requestAnimationFrame(tick);
        };

        const cancel = () => {
          if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
        };

        card.addEventListener('mouseenter', enter);
        card.addEventListener('mousemove', move);
        card.addEventListener('mouseleave', leave);
        this.cardListeners.push({ el: card, enter, move, leave, cancel });
      });
    });
  }

  ngOnDestroy() {
    this.cardListeners.forEach(({ el, enter, move, leave, cancel }) => {
      el.removeEventListener('mouseenter', enter);
      el.removeEventListener('mousemove', move);
      el.removeEventListener('mouseleave', leave);
      cancel();
    });
    this.cardListeners = [];
  }

  ngOnInit() {
    // Add any initialization logic
    this.initScrollReveal();
    this.initCircleAnimations();

    this.scrollToTop();
    if (this.projects.length > 0) {
      this.seoService.setProjectsListSeo(this.projects);
    }
  }

  scrollToTop() {
    if (history.state.scrollToProject) {
      const fragment = this.router.url.split('#')[1];
      if (fragment) {
        setTimeout(() => {
          const element = document.getElementById(fragment);
          if (element) {
            const headerHeight = 100; // Adjust based on your header height
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerHeight;

            window.scrollTo({
              top: offsetPosition,
              behavior: 'smooth'
            });
          }
        }, 100);
      }
    }
  }

  getPipelineSubtitle(pipeline: { name: string; meta: string; }[] | undefined): string {
    if (!pipeline || pipeline.length === 0) return '';
    return `${pipeline[0].name} → ${pipeline[pipeline.length - 1].name}`;
  }

  onImageHover(element: EventTarget | null) {
    if (element instanceof HTMLImageElement) {
      element.style.transform = 'scale(1.05)';
      element.style.transition = 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
    }
  }

  onImageLeave(element: EventTarget | null) {
    if (element instanceof HTMLImageElement) {
      element.style.transform = 'scale(1)';
    }
  }

  imageIndices: Record<number, number> = {};
  achievementsExpanded: Record<number, boolean> = {};

  getImageIndex(id: number): number {
    return this.imageIndices[id] ?? 0;
  }

  nextImage(id: number, total: number, event: Event): void {
    event.stopPropagation();
    this.imageIndices[id] = ((this.imageIndices[id] ?? 0) + 1) % total;
  }

  prevImage(id: number, total: number, event: Event): void {
    event.stopPropagation();
    const cur = this.imageIndices[id] ?? 0;
    this.imageIndices[id] = cur === 0 ? total - 1 : cur - 1;
  }

  toggleAchievements(id: number, event: Event): void {
    event.stopPropagation();
    this.achievementsExpanded[id] = !this.achievementsExpanded[id];
  }

  isExpanded(id: number): boolean {
    return this.achievementsExpanded[id] ?? false;
  }

  getFrameUrl(url: string): string {
    if (!url || url === 'ASK_AKHIGBE') return '';
    return url.replace(/^https?:\/\//, '').replace(/\/$/, '');
  }

  private initScrollReveal() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px'
      }
    );

    document.querySelectorAll('.reveal-on-scroll').forEach(
      el => observer.observe(el)
    );
  }

  viewProject(id: string) {
    this.analytics.trackProjectView(id);
  }

  private initCircleAnimations() {
    const circles = document.querySelectorAll('.circle');
    circles.forEach((circle, index) => {
      if (circle instanceof HTMLElement) {
        // Add random starting positions and delays
        circle.style.animationDelay = `${index * -2}s`;

        // Add subtle pulse animation
        setInterval(() => {
          circle.style.transform = 'scale(1.1)';
          setTimeout(() => {
            circle.style.transform = 'scale(1)';
          }, 200);
        }, 3000 + (index * 1000));
      }
    });
  }


}