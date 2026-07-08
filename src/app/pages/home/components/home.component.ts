// pages/home/home.component.ts — Home v2 redesign
import {
  AfterViewInit, Component, DestroyRef, ElementRef, HostListener,
  OnInit, ViewChild, inject, signal
} from '@angular/core';
import { Router } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ThemeService } from 'src/app/core/services/theme.service';
import { IconService } from 'src/app/core/services/icon.service';
import { AnalyticsService } from 'src/app/core/services/analytics.service';
import { SeoService } from 'src/app/core/services/seo.service';

type CategoryName = 'Frontend Development' | 'Development Tools' | 'Testing & Quality';
type ProjectKey = 'costaff' | 'trade' | 'fms' | 'cap' | 'tiger' | 'xpath';

interface OrbitChip {
  name: string;
  icon: string;
  hex: string;
  glow: string;
  left: string;
  top: string;
}

interface Badge { name: string; bc: string; }

interface ProjectDef {
  key: ProjectKey;
  title: string;
  url: string;
  imgs: string[];
  badges: Badge[];
  desc: string;
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

interface Experience {
  role: string;
  company: string;
  period: string;
  location: string;
  col: string;
  technologies?: string[];
  type?: string;
  current?: boolean;
}

interface Module {
  name: string;
  status: 'finalising' | 'upcoming';
  statusLabel: string;
  description: string;
  tech: string[];
  progress: number;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  standalone: false
})
export class HomeComponent implements OnInit, AfterViewInit {
  private iconService = inject(IconService);
  private router = inject(Router);
  private sanitizer = inject(DomSanitizer);
  private themeService = inject(ThemeService);
  private analytics = inject(AnalyticsService);
  private destroyRef = inject(DestroyRef);
  private seoService = inject(SeoService);

  get isDarkTheme(): boolean { return this.themeService.isDarkTheme(); }

  readonly githubUrl = 'https://github.com/ayomideesam';

  // ─── Tech orbit (pure CSS spin/spinRev — see .component.css) ───
  // Positions precomputed from the prototype's own formula (60° apart, radius 44%,
  // angle = i*60-90deg): left = 50+44·cos(a), top = 50+44·sin(a), minus half the
  // 72px chip size via calc(...-36px) in the template.
  readonly orbitChips: OrbitChip[] = [
    { name: 'TypeScript', icon: this.iconService.getTSIcon(), hex: '#3178C6', glow: '0 0 32px -2px #3178C6CC', left: '50.0%', top: '6.0%' },
    { name: 'RxJS', icon: this.iconService.getRxjsIcon(), hex: '#B7178C', glow: '0 0 32px -2px #B7178CCC', left: '88.1%', top: '28.0%' },
    { name: 'JavaScript', icon: this.iconService.getJSIcon(), hex: '#E8C31A', glow: '0 0 32px -2px #E8C31ACC', left: '88.1%', top: '72.0%' },
    { name: 'HTML5', icon: this.iconService.getHtml5Icon(), hex: '#E34F26', glow: '0 0 32px -2px #E34F26CC', left: '50.0%', top: '94.0%' },
    { name: 'CSS3', icon: this.iconService.getCss3Icon(), hex: '#1572B6', glow: '0 0 32px -2px #1572B6CC', left: '11.9%', top: '72.0%' },
    { name: 'Git', icon: this.iconService.getGitIcon(), hex: '#F05032', glow: '0 0 32px -2px #F05032CC', left: '11.9%', top: '28.0%' }
  ];
  readonly centerTech = { name: 'Angular', icon: this.iconService.getAngularIcon() };

  // ─── Featured Projects: 6-project pool, 3 visible + 3 benched ───
  private readonly projectPool: Record<ProjectKey, ProjectDef> = {
    costaff: {
      key: 'costaff', title: 'COSTAFF AI Digital Worker', url: 'costaff.ai/dashboard',
      imgs: ['/assets/img/costaff-home.jpeg', '/assets/img/costaff-calendar.avif'],
      badges: [{ name: 'Angular 16', bc: '#DD003166' }, { name: 'TypeScript', bc: '#3178C666' }, { name: 'NGXS', bc: '#BA2BD266' }],
      desc: '85% reduction in calendar management time — AI productivity suite integrating Gmail, Google Calendar & OpenAI for enterprise clients across the Middle East.'
    },
    trade: {
      key: 'trade', title: 'Globus Trade Application', url: 'trade.globusbank.com',
      imgs: ['/assets/img/trade-dashboard.png', '/assets/img/trade-settings.png'],
      badges: [{ name: 'Angular 17', bc: '#DD003166' }, { name: 'TypeScript', bc: '#3178C666' }, { name: 'RxJS', bc: '#B7178C66' }],
      desc: '100% adoption by trade ops team within 6 months — CBN-mandated trade finance platform replacing a fully paper-based process at Globus Bank.'
    },
    fms: {
      key: 'fms', title: 'Fraud Management System', url: 'fms.globusbank.com',
      imgs: ['/assets/img/fraud-dashboard-dark.png', '/assets/img/fraud-details-dark.png'],
      badges: [{ name: 'Angular 16', bc: '#DD003166' }, { name: 'TypeScript', bc: '#3178C666' }, { name: 'WebSockets', bc: '#4CAF5066' }],
      desc: '100% transaction coverage in week one — 14-engine real-time fraud detection system. Fraudulent incidents reduced 45% within 90 days of deployment.'
    },
    cap: {
      key: 'cap', title: 'Credit Approval Process (CAP)', url: 'cap.globusbank.com',
      imgs: ['/assets/img/cap-overview.jpeg', '/assets/img/cap-login.jpeg'],
      badges: [{ name: 'Angular 20', bc: '#DD003166' }, { name: 'TypeScript', bc: '#3178C666' }, { name: 'RxJS', bc: '#B7178C66' }],
      desc: 'CBN-compliant credit lifecycle platform — four facility modules, a 10+ role approval chain, and MCC/BCC committee voting with veto power, built from 190+ standalone Angular 20 components.'
    },
    tiger: {
      key: 'tiger', title: 'ProjectTiger — Domestic Transfers', url: 'tiger.zenithbank.com',
      imgs: ['/assets/img/domestic-dashboard.png', '/assets/img/domestic-login.png'],
      badges: [{ name: 'Angular', bc: '#DD003166' }, { name: 'TypeScript', bc: '#3178C666' }, { name: 'Jenkins CI/CD', bc: '#D3383366' }],
      desc: '₦100B+ processed in week one, zero downtime — NIP/NEFT/NAPS payment platform for Zenith Bank serving 100,000+ daily customers across 350+ branches.'
    },
    xpath: {
      key: 'xpath', title: 'X-Path — Merchant Collections', url: 'xpath.zenithbank.com',
      imgs: ['/assets/img/xpath-charges.png', '/assets/img/xpath-config.png'],
      badges: [{ name: 'Angular', bc: '#DD003166' }, { name: 'Angular Universal', bc: '#B7178C66' }, { name: 'Jenkins CI/CD', bc: '#D3383366' }],
      desc: 'Merchant onboarding 70% faster — three-app Angular micro-frontend suite (Admin, Teller, Data-Store) with self-service ERP integration and automated reconciliation across 350 branches.'
    }
  };

  readonly visKeys = signal<ProjectKey[]>(['costaff', 'trade', 'fms']);
  readonly benchKeys = signal<ProjectKey[]>(['cap', 'tiger', 'xpath']);
  readonly imgIdx = signal<Record<ProjectKey, number>>({ costaff: 0, trade: 0, fms: 0, cap: 0, tiger: 0, xpath: 0 });
  readonly expandedKey = signal<ProjectKey | null>(null);
  // Expand overlay is desktop-only — prototype's own isMobile gate (<820px), kept
  // independent of the header's burger threshold (which is a separate, user-directed
  // deviation to 1024px for nav layout only).
  readonly canExpand = signal(typeof window !== 'undefined' ? window.innerWidth >= 821 : true);

  get visibleProjects() {
    return this.visKeys().map((key, i) => ({ ...this.buildProject(key), swapIndex: i }));
  }

  get expandedProject() {
    const key = this.expandedKey();
    return key ? this.buildProject(key) : null;
  }

  private buildProject(key: ProjectKey) {
    const p = this.projectPool[key];
    const idx = (this.imgIdx()[key] ?? 0) % p.imgs.length;
    return {
      ...p,
      img: p.imgs[idx],
      dots: p.imgs.map((_, j) => ({ active: j === idx }))
    };
  }

  navImg(key: ProjectKey, dir: number, event?: Event): void {
    event?.stopPropagation();
    const total = this.projectPool[key].imgs.length;
    this.imgIdx.update(cur => {
      const next = ((cur[key] ?? 0) + dir + total) % total;
      return { ...cur, [key]: next };
    });
  }

  // While a slot is mid-swap its card plays the cardSwapExit animation; the
  // actual data swap (and the new card's cardEnter animation) is deferred
  // until that exit finishes, giving a real crossfade instead of a hard cut.
  readonly swappingIndex = signal<number | null>(null);
  private swapTimer: ReturnType<typeof setTimeout> | null = null;

  swapProject(index: number): void {
    if (this.swappingIndex() !== null) return;
    this.swappingIndex.set(index);
    this.swapTimer = setTimeout(() => {
      const vis = [...this.visKeys()];
      const bench = [...this.benchKeys()];
      const out = vis[index];
      vis[index] = bench.shift()!;
      bench.push(out);
      this.visKeys.set(vis);
      this.benchKeys.set(bench);
      this.swappingIndex.set(null);
    }, 260);
  }

  expandProject(key: ProjectKey): void {
    if (this.canExpand()) this.expandedKey.set(key);
  }

  closeExpand(): void {
    this.expandedKey.set(null);
  }

  @HostListener('window:keydown.escape')
  onEscape(): void {
    if (this.expandedKey()) this.closeExpand();
  }

  @HostListener('window:resize')
  onResize(): void {
    this.canExpand.set(window.innerWidth >= 821);
  }

  // ─── Currently Building ───
  currentlyBuilding = {
    project: 'Credit Approval Process (CAP)',
    company: 'Globus Bank',
    description: 'Digitising end-to-end credit lifecycle management for Nigeria\'s most CBN-compliant banking workflow: four facility modules, a 10+ role sequential approval chain, and a two-stage committee governance engine.',
    modules: [
      {
        name: 'Retail Module',
        status: 'finalising' as const,
        statusLabel: 'In Final UAT',
        description: 'Completing the end-to-end retail credit lifecycle — multi-step form engine, automated PEP/BVN screening at origination, MCC committee voting engine, and full disbursement workflow heading into general release.',
        tech: ['Multi-step Form Engine', 'PEP/BVN Screening', 'Committee Voting'],
        progress: 93
      },
      {
        name: 'Corporate Module',
        status: 'upcoming' as const,
        statusLabel: 'Starting Next',
        description: 'Next phase covers SME and large corporate facilities — mandatory Environmental & Social governance review, director-related account flagging, live CRC credit scoring, and BCC board escalation for ₦100M+ facilities.',
        tech: ['E&S Review', 'CRC Credit Scoring', 'Director Flagging'],
        progress: 10
      }
    ] as Module[]
  };

  // Progress bars animate once, ~700ms after view init, via a transitioned
  // inline width style (not @keyframes — see ANGULAR-19-STANDARDS.md note on
  // why width/background must never live inside @keyframes specifically).
  readonly progressStarted = signal(false);

  // ─── Toolkit ───
  skillCategories: SkillCategory[] = [
    {
      name: 'Frontend Development',
      skills: [
        { name: 'Angular', level: 95, experience: '9+ yrs', icon: this.iconService.getAngularIcon() },
        { name: 'TypeScript', level: 90, experience: '7+ yrs', icon: this.iconService.getTSIcon() },
        { name: 'HTML5', level: 95, experience: '9+ yrs', icon: this.iconService.getHtml5Icon() },
        { name: 'CSS3', level: 95, experience: '9+ yrs', icon: this.iconService.getCss3Icon() },
        { name: 'JavaScript', level: 90, experience: '9+ yrs', icon: this.iconService.getJSIcon() }
      ]
    },
    {
      name: 'Development Tools',
      skills: [
        { name: 'VS Code', level: 90, experience: '7+ yrs', icon: this.iconService.getVScodeIcon() },
        { name: 'Git', level: 90, experience: '7+ yrs', icon: this.iconService.getGitIcon() },
        { name: 'Jenkins', level: 85, experience: '4+ yrs', icon: this.iconService.getJenkinsIcon() }
      ]
    },
    {
      name: 'Testing & Quality',
      skills: [
        { name: 'Postman', level: 95, experience: '7+ yrs', icon: this.iconService.getPostmanIcon() },
        { name: 'Swagger', level: 95, experience: '6+ yrs', icon: this.iconService.getSwaggerIcon() },
        { name: 'Jest', level: 85, experience: '4+ yrs', icon: this.iconService.getJestIcon() },
        { name: 'Selenium', level: 80, experience: '4+ yrs', icon: this.iconService.getSeleniumIcon() }
      ]
    }
  ];

  // ─── Experience ───
  experiences: Experience[] = [
    {
      role: 'Senior Frontend Engineer', company: 'Globus Bank Plc', period: 'Jan 2024 - Present',
      location: 'Victoria Island, Nigeria', col: '#8b5cf6', type: 'Full-time', current: true,
      technologies: ['Angular 20', 'TypeScript', 'RxJS', 'NGXS']
    },
    {
      role: 'Senior Angular Engineer & Tech Lead', company: 'HiedBerg LTD', period: 'Jun 2024 - Sept 2024',
      location: 'United Kingdom (Remote)', col: '#f59e0b', type: 'Contract', technologies: ['Angular', 'Team Leadership', 'Code Review']
    },
    {
      role: 'Frontend Team Lead', company: 'Zenith Bank PLC', period: 'Dec 2022 - Feb 2024',
      location: 'Victoria Island, Nigeria', col: '#ef4444', type: 'Contract', technologies: ['Angular', 'TypeScript', 'Team Leadership']
    },
    {
      role: 'Senior Frontend Engineer', company: 'Samsky Pay UK', period: 'Feb 2022 - Dec 2022',
      location: 'London, UK', col: '#06b6d4', type: 'Full-time', technologies: ['Angular', 'Payments', 'REST APIs']
    },
    {
      role: 'Intermediate Frontend Engineer', company: 'Upperlink LTD', period: 'Jun 2018 - Feb 2022',
      location: 'Alausa, Nigeria', col: '#10b981', type: 'Full-time', technologies: ['Angular', 'JavaScript', 'CSS3']
    }
  ];

  // ─── Testimonials ───
  testimonials = [
    {
      quote: 'I highly recommend Akhigbe Iruobe as a Senior Frontend Engineer. Although he doesn\'t manage me directly, he has consistently supported me with code reviews, logic improvements, and technical guidance. He\'s intuitive, reliable, and always delivers high-quality work. What stands out most is his willingness to help — he\'s always open to assisting others and explaining complex concepts clearly. He\'s a strong team player and a valuable asset to any engineering team.',
      author: 'Nonye Ibeanu', role: 'Frontend Engineer', company: 'Globus Bank', initials: 'NI',
      relationship: 'Senior colleague at Globus Bank'
    },
    {
      quote: 'I\'ve had the pleasure of working with Akhigbe Iruobe, and he consistently demonstrates professionalism, reliability, and strong attention to detail. He takes ownership of his work and always delivers quality results. I highly recommend him to any team looking for someone dependable and growth-driven.',
      author: 'Ekop Takon', role: 'Frontend Developer', company: 'Globus Bank', initials: 'ET',
      relationship: 'Direct report at Globus Bank'
    },
    {
      quote: 'I can speak confidently on Ayomide\'s web development skills having worked with him at Upperlink to build several top-notch software solutions. Ayomide is very dedicated and approaches his tasks with an uncommon enthusiasm. Simply put, you can always count on him to deliver. Highly proficient technical skills equally matched with friendliness — this makes him great at working independently and in a team. Any organisation will be lucky to have him join them.',
      author: 'Adefisola Adigun', role: 'Backend Developer', company: 'Upperlink LTD', initials: 'AA',
      relationship: 'Worked together at Upperlink'
    },
    {
      quote: 'I had the pleasure of working with AY, and I can confidently say he is an outstanding Frontend Developer. He has a strong eye for detail and a natural ability to transform ideas and designs into smooth, user-friendly experiences. What stands out most is how he balances creativity with functionality — delivering clean, responsive interfaces while maintaining performance and usability. He communicates clearly, collaborates well, and takes full ownership of his work.',
      author: 'Victor Johnson', role: 'Backend Architect', company: 'Zenith Bank', initials: 'VJ',
      relationship: 'Peer — different teams at Zenith Bank'
    },
    {
      quote: 'I have had the privilege of working closely with Ayomide at Zenith Bank, where he has consistently proven himself as an outstanding Front-End Developer. His skills are truly remarkable — he adeptly combines these technologies to craft seamless and visually appealing user interfaces that leave a lasting impression. His technical depth, creativity, and commitment to quality make him a standout in any engineering team.',
      author: 'Adesoji Oyewusi', role: 'UI/UX Designer', company: 'Zenith Bank', initials: 'AO',
      relationship: 'Different team at Zenith Bank'
    }
  ];

  private static readonly TESTIMONIAL_GRADIENTS = [
    'linear-gradient(135deg,#818cf8,#6366f1)',
    'linear-gradient(135deg,#22d3ee,#0891b2)',
    'linear-gradient(135deg,#34d399,#059669)',
    'linear-gradient(135deg,#f59e0b,#d97706)',
    'linear-gradient(135deg,#f472b6,#db2777)'
  ];

  getTestimonialGradient(index: number): string {
    return HomeComponent.TESTIMONIAL_GRADIENTS[index % HomeComponent.TESTIMONIAL_GRADIENTS.length];
  }

  canScrollPrev = false;
  canScrollNext = true;
  @ViewChild('testimonialsTrack') testimonialsTrack!: ElementRef;
  @ViewChild('tPinWrap') tPinWrap!: ElementRef<HTMLElement>;
  @ViewChild('tPinInner') tPinInner!: ElementRef<HTMLElement>;

  scrollTestimonials(dir: number): void {
    const track = this.testimonialsTrack?.nativeElement as HTMLElement;
    if (!track) return;
    const card = track.querySelector('.t-card') as HTMLElement;
    const gap = 22;
    const scrollAmount = card ? card.offsetWidth + gap : 400;
    track.scrollBy({ left: scrollAmount * dir, behavior: 'smooth' });
  }

  onTrackScroll(e: Event): void {
    const el = e.target as HTMLElement;
    this.canScrollPrev = el.scrollLeft > 10;
    this.canScrollNext = el.scrollLeft < (el.scrollWidth - el.clientWidth - 10);
  }

  // Vertical page scroll drives the testimonials track's horizontal scrollLeft
  // while the section is pinned (position: sticky). No preventDefault/wheel
  // hijacking — the browser owns the scroll, we just read its progress each
  // frame, so trackpads, keyboard PageDown, and scrollbar drag all just work.
  // Desktop + fine-pointer + motion-allowed only: touch devices already swipe
  // the track natively, and scroll-jacking a touchscreen fights the gesture.
  //
  // Motion is eased (lerp) rather than snapped 1:1 to scroll position, so the
  // horizontal glide trails smoothly instead of feeling like a hard jump. As
  // the eased position crosses each card boundary, the matching carousel-nav
  // button gets a brief "pressed" flash — visual confirmation each card has
  // been seen, echoing what clicking that button would look like.
  private static readonly PIN_STICKY_TOP = 96;
  private static readonly PIN_EASE = 0.15;
  private static readonly CARD_GAP = 22;
  readonly pinScrollActive = signal(false);
  readonly navBtnPulse = signal<'prev' | 'next' | null>(null);

  private initTestimonialPinScroll(): void {
    const wrap = this.tPinWrap?.nativeElement;
    const inner = this.tPinInner?.nativeElement;
    const track = this.testimonialsTrack?.nativeElement as HTMLElement;
    if (!wrap || !inner || !track) return;

    const canPin = () =>
      window.matchMedia('(min-width: 1025px)').matches &&
      window.matchMedia('(pointer: fine)').matches &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const measure = () => {
      if (!canPin()) {
        this.pinScrollActive.set(false);
        wrap.style.height = '';
        return;
      }
      this.pinScrollActive.set(true);
      const runway = Math.min(
        Math.max(track.scrollWidth - track.clientWidth, 300),
        window.innerHeight * 1.3
      );
      wrap.style.height = `${inner.offsetHeight + runway}px`;
    };

    const cardStep = () => {
      const card = track.querySelector('.t-card') as HTMLElement | null;
      return (card ? card.offsetWidth : 380) + HomeComponent.CARD_GAP;
    };

    let targetProgress = 0;
    let currentScrollLeft = 0;
    let lastCardIndex = 0;
    let easeRafId: number | null = null;
    let pulseTimer: ReturnType<typeof setTimeout> | null = null;

    const triggerPulse = (dir: 'prev' | 'next') => {
      this.navBtnPulse.set(dir);
      if (pulseTimer) clearTimeout(pulseTimer);
      pulseTimer = setTimeout(() => this.navBtnPulse.set(null), 220);
    };

    const ease = () => {
      easeRafId = null;
      if (!this.pinScrollActive()) return;
      const maxScroll = track.scrollWidth - track.clientWidth;
      const diff = targetProgress * maxScroll - currentScrollLeft;
      if (Math.abs(diff) < 0.5) return;

      currentScrollLeft += diff * HomeComponent.PIN_EASE;
      track.scrollLeft = currentScrollLeft;

      const cardIndex = Math.round(currentScrollLeft / cardStep());
      if (cardIndex !== lastCardIndex) {
        triggerPulse(cardIndex > lastCardIndex ? 'next' : 'prev');
        lastCardIndex = cardIndex;
      }

      easeRafId = requestAnimationFrame(ease);
    };

    let scrollRafId: number | null = null;
    const onScroll = () => {
      if (scrollRafId !== null) return;
      scrollRafId = requestAnimationFrame(() => {
        scrollRafId = null;
        if (!this.pinScrollActive()) return;
        const rect = wrap.getBoundingClientRect();
        const runway = wrap.offsetHeight - inner.offsetHeight;
        if (runway <= 0) return;
        targetProgress = Math.min(Math.max((HomeComponent.PIN_STICKY_TOP - rect.top) / runway, 0), 1);
        if (easeRafId === null) easeRafId = requestAnimationFrame(ease);
      });
    };

    let resizeTimer: ReturnType<typeof setTimeout> | null = null;
    const onResize = () => {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(measure, 120);
    };

    measure();
    document.fonts?.ready?.then(measure).catch(() => {});
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);

    this.destroyRef.onDestroy(() => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      if (resizeTimer) clearTimeout(resizeTimer);
      if (pulseTimer) clearTimeout(pulseTimer);
      if (scrollRafId !== null) cancelAnimationFrame(scrollRafId);
      if (easeRafId !== null) cancelAnimationFrame(easeRafId);
    });
  }

  // ─── Lifecycle ───
  ngOnInit(): void {
    this.seoService.setHomeSeo();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  private revealObserver: IntersectionObserver | null = null;

  ngAfterViewInit(): void {
    const t = setTimeout(() => this.progressStarted.set(true), 700);
    this.destroyRef.onDestroy(() => clearTimeout(t));
    this.destroyRef.onDestroy(() => { if (this.swapTimer) clearTimeout(this.swapTimer); });
    this.initProjectReveal();
    this.initTestimonialPinScroll();
  }

  // Scroll-choreographed entrance for the Featured Projects grid — same
  // IntersectionObserver + one-shot-reveal pattern as ProjectsComponent's
  // flagship scenes, kept local since Home only needs it for this one grid.
  private initProjectReveal(): void {
    const grid = document.querySelector('.projects-grid');
    if (!grid) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      grid.classList.add('in-view');
      return;
    }
    this.revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          this.revealObserver!.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -5% 0px' });
    this.revealObserver.observe(grid);
    this.destroyRef.onDestroy(() => this.revealObserver?.disconnect());
  }

  // WebP format helper for responsive image delivery. Converts .png/.jpg to
  // .webp for modern browsers, while the <picture> fallback uses the original.
  getWebpPath(originalPath: string): string {
    return originalPath.replace(/\.(png|jpg|jpeg)$/i, '.webp');
  }

  // ─── Helpers reused across templates ───
  // Verbatim from the prototype's catsData paths (code / terminal / shield-check),
  // not IconService — these three are prototype-specific glyphs, not brand icons.
  private static readonly CATEGORY_ICON_SVG: Record<CategoryName, string> = {
    'Frontend Development': '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>',
    'Development Tools': '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 17 10 11 4 5"></polyline><line x1="12" y1="19" x2="20" y2="19"></line></svg>',
    'Testing & Quality': '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><path d="M9 12l2 2 4-4"></path></svg>'
  };

  getCategoryIcon(category: CategoryName): string {
    return HomeComponent.CATEGORY_ICON_SVG[category] || HomeComponent.CATEGORY_ICON_SVG['Frontend Development'];
  }

  sanitizeIcon(icon: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(icon);
  }

  getTier(level: number): string {
    if (level >= 90) return 'Expert';
    if (level >= 85) return 'Advanced';
    return 'Proficient';
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

    let totalMonths = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth()) + 1;
    if (totalMonths < 1) totalMonths = 1;

    const years = Math.floor(totalMonths / 12);
    const remMonths = totalMonths % 12;
    const yearLabel = years > 0 ? `${years} yr${years > 1 ? 's' : ''}` : '';
    const monthLabel = remMonths > 0 ? `${remMonths} mo${remMonths > 1 ? 's' : ''}` : '';

    return [yearLabel, monthLabel].filter(Boolean).join(' ') || '1 mo';
  }

  navigateToProject(projectId: number): void {
    this.router.navigate(['/projects'], {
      fragment: `project-${projectId}`,
      state: { scrollToProject: true }
    });
  }

  navigateToProjects(): void {
    this.router.navigate(['/projects']).then(() => window.scrollTo(0, 0));
  }

  navigateToContact(): void {
    this.router.navigate(['/contact']).then(() => window.scrollTo(0, 0));
  }

  // Maps this component's project pool keys to the numeric ids ProjectDataService
  // and ProjectsComponent's [id]="'project-' + project.id" anchors actually use.
  private static readonly PROJECT_DATA_ID: Record<ProjectKey, number> = {
    costaff: 1, trade: 2, fms: 3, tiger: 4, xpath: 5, cap: 6
  };

  viewProject(key: ProjectKey): void {
    this.analytics.trackProjectView(key);
    this.navigateToProject(HomeComponent.PROJECT_DATA_ID[key]);
  }
}
