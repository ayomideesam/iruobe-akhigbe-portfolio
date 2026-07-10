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

/** Presentation identity for a flagship scene — accent, eyebrow, ambient film. */
interface SceneMeta {
  accent: string;
  accentRgb: string;
  eyebrow: string;
  video: string;
  poster: string;
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
  private filmObserver: IntersectionObserver | null = null;
  private revealObserver: IntersectionObserver | null = null;

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

  /** Scene identity per project id — Seedance 2.0 ambient loops live in assets/video. */
  private readonly sceneMeta: Record<number, SceneMeta> = {
    6: { accent: '#818cf8', accentRgb: '129, 140, 248', eyebrow: 'Globus Bank · Credit Governance',        video: 'assets/video/fp-cap.mp4',     poster: 'assets/video/fp-cap.jpg' },
    1: { accent: '#a78bfa', accentRgb: '167, 139, 250', eyebrow: 'Enterprise AI · Productivity Suite',     video: 'assets/video/fp-costaff.mp4', poster: 'assets/video/fp-costaff.jpg' },
    2: { accent: '#22d3ee', accentRgb: '34, 211, 238',  eyebrow: 'Globus Bank · Trade Finance',            video: 'assets/video/fp-gta.mp4',     poster: 'assets/video/fp-gta.jpg' },
    3: { accent: '#fb7185', accentRgb: '251, 113, 133', eyebrow: 'Globus Bank · Real-Time Risk',           video: 'assets/video/fp-fraud.mp4',   poster: 'assets/video/fp-fraud.jpg' },
    4: { accent: '#fbbf24', accentRgb: '251, 191, 36',  eyebrow: 'Zenith Bank · Payments Infrastructure',  video: 'assets/video/fp-tiger.mp4',   poster: 'assets/video/fp-tiger.jpg' },
    5: { accent: '#2dd4bf', accentRgb: '45, 212, 191',  eyebrow: 'Zenith Bank · Merchant Collections',     video: 'assets/video/fp-xpath.mp4',   poster: 'assets/video/fp-xpath.jpg' },
  };

  private readonly fallbackSceneMeta: SceneMeta = {
    accent: '#818cf8', accentRgb: '129, 140, 248', eyebrow: 'Enterprise Delivery',
    video: '', poster: ''
  };

  getSceneMeta(id: number): SceneMeta {
    return this.sceneMeta[id] ?? this.fallbackSceneMeta;
  }

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
    const cards = document.querySelectorAll('.fp-scene, .assessment-card');
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
    this.zone.runOutsideAngular(() => {
      this.initSceneFilms();
      this.initSceneReveals();
      this.initCircleAnimations();
      if (this.tiltEnabled) {
        this.initAssessmentTilt();
      }
    });
  }

  /** Lazy-attach and play/pause the Seedance ambient loops as scenes enter the viewport. */
  private initSceneFilms() {
    const videos = Array.from(document.querySelectorAll<HTMLVideoElement>('.fp-film video'));
    if (!videos.length) return;

    if (!this.tiltEnabled) {
      // prefers-reduced-motion: posters only, never autoplay
      return;
    }

    this.filmObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        const video = entry.target as HTMLVideoElement;
        if (entry.isIntersecting) {
          if (!video.src) {
            const src = video.dataset['video'];
            if (!src) return;
            video.src = src;
          }
          video.muted = true;
          video.play().catch(() => { /* autoplay refused — poster stays */ });
        } else if (!video.paused) {
          video.pause();
        }
      });
    }, { threshold: 0.15 });

    videos.forEach(video => this.filmObserver!.observe(video));
  }

  /** Scroll-choreographed scene entrances. */
  private initSceneReveals() {
    const targets = document.querySelectorAll('.fp-reveal');
    if (!targets.length) return;

    if (!this.tiltEnabled) {
      targets.forEach(el => el.classList.add('visible'));
      return;
    }

    this.revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          this.revealObserver!.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -5% 0px' });

    targets.forEach(el => this.revealObserver!.observe(el));
  }

  private initAssessmentTilt() {
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
  }

  ngOnDestroy() {
    this.cardListeners.forEach(({ el, enter, move, leave, cancel }) => {
      el.removeEventListener('mouseenter', enter);
      el.removeEventListener('mousemove', move);
      el.removeEventListener('mouseleave', leave);
      cancel();
    });
    this.cardListeners = [];
    this.filmObserver?.disconnect();
    this.filmObserver = null;
    this.revealObserver?.disconnect();
    this.revealObserver = null;
    if (this.expandedAssessmentId !== null) this.unlockBodyScroll();
  }

  ngOnInit() {
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

  viewProject(id: string) {
    this.analytics.trackProjectView(id);
  }

  // ─── Assessment expand overlay ───
  // Mirrors the home Featured Projects expand pattern: the browser-frame's green
  // "maximise" light (and the screenshot itself) blows the card up into a large
  // read-first overlay. Red/yellow lights are decorative here — with only three
  // assessments there's nothing to swap, so only maximise is wired.
  // Gated to >=1024px: excludes phones + small tablets (iPad Mini 768, Air 820,
  // 11" 834) and targets 12.9"+ iPad Pro / laptops / desktops — the trackpad &
  // mouse audiences the large read-first overlay is designed for.
  private static readonly EXPAND_MIN_WIDTH = 1024;
  expandedAssessmentId: number | null = null;
  canExpandAssessment = typeof window !== 'undefined'
    ? window.innerWidth >= ProjectsComponent.EXPAND_MIN_WIDTH : true;

  get expandedAssessment(): AssessmentProject | null {
    return this.expandedAssessmentId === null
      ? null
      : this.assessmentProjects.find(a => a.id === this.expandedAssessmentId) ?? null;
  }

  expandAssessment(id: number, event?: Event): void {
    event?.stopPropagation();
    if (!this.canExpandAssessment) return;
    this.expandedAssessmentId = id;
    this.lockBodyScroll();
  }

  closeAssessmentExpand(): void {
    this.expandedAssessmentId = null;
    this.unlockBodyScroll();
  }

  // Without this, the underlying page keeps scrolling behind the overlay and
  // its own (globally-styled, same indigo) scrollbar stays pinned to the
  // viewport edge — reading as disconnected from the modal card floating in
  // front of it. padding-right compensates the removed scrollbar's width so
  // the page behind the blur doesn't visibly reflow when it disappears.
  private lockBodyScroll(): void {
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) document.body.style.paddingRight = `${scrollbarWidth}px`;
  }

  private unlockBodyScroll(): void {
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
  }

  @HostListener('window:keydown.escape')
  onAssessmentEscape(): void {
    if (this.expandedAssessmentId !== null) this.closeAssessmentExpand();
  }

  // Matches home's identical onResize(): only the gate updates here. An overlay
  // already open stays open through a resize (its CSS is responsive down to any
  // width via 94vw fallbacks) rather than being force-closed — force-closing
  // previously bypassed closeAssessmentExpand() and left body scroll locked
  // forever after a resize below the breakpoint while the overlay was open.
  @HostListener('window:resize')
  onAssessmentResize(): void {
    this.canExpandAssessment = window.innerWidth >= ProjectsComponent.EXPAND_MIN_WIDTH;
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
