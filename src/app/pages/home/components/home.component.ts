// pages/home/home.component.ts — Home v2 redesign
import {
  AfterViewInit, Component, DestroyRef, ElementRef, HostListener,
  NgZone, OnInit, ViewChild, inject, signal,
  ChangeDetectionStrategy
} from '@angular/core';
import { Router } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ThemeService } from 'src/app/core/services/theme.service';
import { IconService } from 'src/app/core/services/icon.service';
import { AnalyticsService } from 'src/app/core/services/analytics.service';
import { SeoService } from 'src/app/core/services/seo.service';
import { TestimonialsService } from 'src/app/core/services/testimonials.service';

type ProjectKey = 'nxp' | 'costaff' | 'trade' | 'fms' | 'cap' | 'tiger' | 'xpath';

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
  /** Dock label — the name the projects page and recruiters use for it. */
  short: string;
  /** Dock dot colour, matching the project's scene accent on /projects. */
  hue: string;
  url: string;
  imgs: string[];
  badges: Badge[];
  desc: string;
}

type SwapMode = 'close' | 'minimise';

interface OdometerColumn {
  /** Digits the column rolls through, ending on its own digit. */
  digits: number[];
  /** Index of the final digit; the strip rests at translateY(-to em). */
  to: number;
}

interface StackCard {
  key: 'angular' | 'ui' | 'quality' | 'delivery';
  title: string;
  stat: string;
  note: string;
  chips: string[];
}

interface StandardsFile {
  path: string;
  lines: number;
  /** Agent-run step that reads this file (0 = not read in the illustrated run). */
  step: number;
}

interface AgentStep {
  verb: string;
  arg: string;
  out: string;
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
  status: 'shipping' | 'paused';
  statusLabel: string;
  description: string;
  tech: string[];
  progress: number;
  odometer: OdometerColumn[];
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false
})
export class HomeComponent implements OnInit, AfterViewInit {
  private iconService = inject(IconService);
  private router = inject(Router);
  private sanitizer = inject(DomSanitizer);
  private themeService = inject(ThemeService);
  private analytics = inject(AnalyticsService);
  private testimonialsService = inject(TestimonialsService);
  private destroyRef = inject(DestroyRef);
  private seoService = inject(SeoService);
  private zone = inject(NgZone);

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

  // ─── Featured Projects: 7-project pool, 3 visible + 4 benched ───
  private readonly projectPool: Record<ProjectKey, ProjectDef> = {
    nxp: {
      key: 'nxp', title: 'Globus Trade Export — NXP', short: 'Trade Export', hue: '#fb923c',
      url: 'nxp.globusbank.com',
      imgs: ['/assets/img/nxp-overview.png', '/assets/img/nxp-applications.png', '/assets/img/nxp-ness.png', '/assets/img/nxp-repatriation.png', '/assets/img/nxp-cancelation.png'],
      badges: [{ name: 'Angular 21', bc: '#DD003166' }, { name: 'TypeScript', bc: '#3178C666' }, { name: 'NgRx Signals', bc: '#BA2BD266' }],
      desc: 'Kickoff 10 July, final UAT 1 October, CAB-approved — a from-scratch export trade finance platform (NXP, NESS levy, repatriation, closure). I led the frontend in a seven-person team.'
    },
    costaff: {
      key: 'costaff', title: 'COSTAFF AI Digital Worker', short: 'COSTAFF', hue: '#a78bfa',
      url: 'costaff.ai/dashboard',
      imgs: ['/assets/img/costaff-calendar.avif', '/assets/img/costaff-inbox.png', '/assets/img/costaff-week.png', '/assets/img/costaff-assistant.png', '/assets/img/costaff-home.jpeg'],
      badges: [{ name: 'Angular 16', bc: '#DD003166' }, { name: 'TypeScript', bc: '#3178C666' }, { name: 'NGXS', bc: '#BA2BD266' }],
      desc: '85% reduction in calendar management time — AI productivity suite integrating Gmail, Google Calendar & OpenAI for enterprise clients across the Middle East.'
    },
    trade: {
      key: 'trade', title: 'Globus Trade — Import', short: 'Trade Import', hue: '#22d3ee',
      url: 'trade.globusbank.com',
      imgs: ['/assets/img/gta-home.png', '/assets/img/gta-documents.png', '/assets/img/gta-import.png', '/assets/img/gta-details.png', '/assets/img/gta-settings.png'],
      badges: [{ name: 'Angular 19', bc: '#DD003166' }, { name: 'TypeScript', bc: '#3178C666' }, { name: 'RxJS', bc: '#B7178C66' }],
      desc: '100% adoption by trade ops team within 6 months — CBN-mandated import trade finance platform (Form M, shipping documents, ECD, PAAR) replacing a fully paper-based process at Globus Bank.'
    },
    fms: {
      key: 'fms', title: 'Fraud Management System', short: 'Fraud', hue: '#fb7185',
      url: 'fms.globusbank.com',
      imgs: ['/assets/img/fraud-live-dashboard.png', '/assets/img/fraud-flagged-transactions.png', '/assets/img/fraud-rule-engines.png', '/assets/img/fraud-details-dark.png', '/assets/img/fraud-dashboard-dark.png'],
      badges: [{ name: 'Angular 16', bc: '#DD003166' }, { name: 'TypeScript', bc: '#3178C666' }, { name: 'AG Charts', bc: '#2563EB66' }],
      desc: '100% transaction coverage in week one — 14 weighted fraud rules, PND restrictions and a maker-checker case review. Fraudulent incidents reduced 45% within 90 days of deployment.'
    },
    cap: {
      key: 'cap', title: 'Credit Approval Process (CAP)', short: 'CAP', hue: '#818cf8',
      url: 'cap.globusbank.com',
      imgs: ['/assets/img/cap-dashboard.png', '/assets/img/cap-facility-requests.png', '/assets/img/cap-disbursements.png', '/assets/img/cap-login.jpeg'],
      badges: [{ name: 'Angular 20', bc: '#DD003166' }, { name: 'TypeScript', bc: '#3178C666' }, { name: 'RxJS', bc: '#B7178C66' }],
      desc: 'CBN-compliant credit lifecycle platform — a Retail module now in production and a 15-desk approval chain that ends at the MCC and BCC committees, built by a seven-person team from 230+ standalone Angular 20 components.'
    },
    tiger: {
      key: 'tiger', title: 'ProjectTiger — Domestic Transfers', short: 'ProjectTiger', hue: '#fbbf24',
      url: 'tiger.zenithbank.com',
      imgs: ['/assets/img/tiger-teller.png', '/assets/img/tiger-queue.png', '/assets/img/tiger-naps-direct.png', '/assets/img/tiger-search.png', '/assets/img/tiger-nip-dashboard.png'],
      badges: [{ name: 'Angular', bc: '#DD003166' }, { name: 'TypeScript', bc: '#3178C666' }, { name: 'Jenkins CI/CD', bc: '#D3383366' }],
      desc: '₦100B+ processed in week one, zero downtime — NIP/NEFT/NAPS payment platform for Zenith Bank serving 100,000+ daily customers across 350+ branches.'
    },
    xpath: {
      key: 'xpath', title: 'X-Path — Merchant Collections', short: 'X-Path', hue: '#2dd4bf',
      url: 'xpath.zenithbank.com',
      imgs: ['/assets/img/xpath-payments.png', '/assets/img/xpath-deposits.png', '/assets/img/xpath-payments-memo.png', '/assets/img/xpath-merchants.png', '/assets/img/xpath-dashboard.png'],
      badges: [{ name: 'Angular', bc: '#DD003166' }, { name: 'Angular Universal', bc: '#B7178C66' }, { name: 'Jenkins CI/CD', bc: '#D3383366' }],
      desc: 'Merchant onboarding 70% faster — three-app Angular micro-frontend suite (Admin, Teller, Data-Store) with self-service ERP integration and automated reconciliation across 350 branches.'
    }
  };

  readonly visKeys = signal<ProjectKey[]>(['nxp', 'cap', 'fms']);
  readonly benchKeys = signal<ProjectKey[]>(['trade', 'costaff', 'tiger', 'xpath']);
  readonly imgIdx = signal<Record<ProjectKey, number>>({ nxp: 0, costaff: 0, trade: 0, fms: 0, cap: 0, tiger: 0, xpath: 0 });
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

  readonly projectCount = Object.keys(this.projectPool).length;

  /** The benched projects, shown in the dock under the grid. */
  get dockProjects(): ProjectDef[] {
    return this.benchKeys().map(key => this.projectPool[key]);
  }

  // The traffic lights are real controls. Close and minimise both hand the slot
  // to the next benched project; they differ in where the window visibly goes
  // (close shrinks it away in place, minimise drops it into the dock), which is
  // what tells a visitor the dock below the grid holds the rest of the work.
  // The data swap waits for the exit animation, so the incoming card's
  // cardEnter never overlaps it.
  readonly swapping = signal<{ index: number; mode: SwapMode } | null>(null);
  readonly swapAnnouncement = signal('');
  private swapTimer: ReturnType<typeof setTimeout> | null = null;
  private swapCount = 0;
  /** When each slot last changed; the dock restores into the stalest one. */
  private readonly slotStamps = [0, 0, 0];

  swapProject(index: number, mode: SwapMode): void {
    this.runSwap(index, mode);
  }

  /** Opens a docked project in the slot that has gone longest unchanged
   *  (ties go right, so the lead project is the last to be replaced). */
  restoreProject(key: ProjectKey): void {
    let slot = 0;
    this.slotStamps.forEach((stamp, i) => { if (stamp <= this.slotStamps[slot]) slot = i; });
    this.runSwap(slot, 'minimise', key);
  }

  private runSwap(index: number, mode: SwapMode, incoming?: ProjectKey): void {
    if (this.swapping() !== null) return;
    this.swapping.set({ index, mode });
    this.swapTimer = setTimeout(() => {
      const vis = [...this.visKeys()];
      const bench = [...this.benchKeys()];
      const out = vis[index];
      if (incoming) {
        bench[bench.indexOf(incoming)] = out;
        vis[index] = incoming;
      } else {
        vis[index] = bench.shift()!;
        bench.push(out);
      }
      this.visKeys.set(vis);
      this.benchKeys.set(bench);
      this.slotStamps[index] = ++this.swapCount;
      this.swapAnnouncement.set(
        `${this.projectPool[vis[index]].title} opened. ${this.projectPool[out].title} moved to the dock.`
      );
      this.swapping.set(null);
    }, mode === 'minimise' ? 320 : 240);
  }

  expandProject(key: ProjectKey): void {
    if (!this.canExpand()) return;
    this.expandedKey.set(key);
    this.lockBodyScroll();
  }

  closeExpand(): void {
    this.expandedKey.set(null);
    this.unlockBodyScroll();
  }

  // Without this, the page keeps scrolling behind the overlay and its own
  // (globally-styled) scrollbar stays pinned to the viewport edge — reading
  // as disconnected from the modal card floating in front of it. padding-right
  // compensates the removed scrollbar's width so the page behind the blur
  // doesn't visibly reflow when it disappears.
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
  onEscape(): void {
    if (this.expandedKey()) this.closeExpand();
  }

  @HostListener('window:resize')
  onResize(): void {
    this.canExpand.set(window.innerWidth >= 821);
  }

  // ─── Currently Building ───
  // Both Globus platforms passed business CAB; dates are written out rather than
  // "next week" so the copy doesn't go stale after the October 2026 rollout.
  currentlyBuilding = {
    eyebrow: 'Shipping in October',
    pill: 'CAB APPROVED',
    project: 'Trade Export & CAP — Production Rollout',
    company: 'Globus Bank',
    description: 'Both platforms passed business CAB and roll out to production in October 2026, built by a seven-person team in which I am the senior frontend engineer. Trade Export digitises the CBN export chain, and CAP\'s Retail module carries credit from origination through MCC/BCC governance to disbursement. CAP\'s Corporate module is paused at 10% after the team was redeployed to Trade Export in July.',
    modules: [
      {
        name: 'Trade Export (NXP)',
        status: 'shipping' as const,
        statusLabel: 'CAB Approved · Rolling Out',
        description: 'From scratch on Angular 21: kickoff on 10 July 2026, live API integration from 18 August, two stakeholder walkthroughs in September and final UAT on 1 October — NXP, the NESS levy, repatriation and closure.',
        tech: ['Angular 21 Signals', 'Maker-Checker Flows', '776 Vitest Tests'],
        progress: 100
      },
      {
        name: 'CAP — Retail Module',
        status: 'shipping' as const,
        statusLabel: 'CAB Approved · Rolling Out',
        description: 'The end-to-end retail credit lifecycle — multi-step origination with AML screening and credit-bureau checks, the 15-desk approval chain through the MCC and BCC committees, and full disbursement & deferral workflows.',
        tech: ['Multi-step Form Engine', '15-Desk Approval Chain', 'Disbursement Engine'],
        progress: 100
      },
      {
        name: 'CAP — Corporate Module',
        status: 'paused' as const,
        statusLabel: 'Paused at 10%',
        description: 'SME and large corporate facilities — mandatory Environmental & Social review, director-related account flagging and credit-bureau checks. Paused in July 2026 when the team moved to Trade Export.',
        tech: ['E&S Review', 'Credit Bureau', 'Director Flagging'],
        progress: 10
      }
    ].map(m => ({ ...m, odometer: HomeComponent.odometer(m.progress) })) as Module[]
  };

  // The percentage is an odometer: one digit strip per column, moved with
  // transform only. Column i spins i full turns before landing, so the units
  // blur past while the hundreds digit simply clicks over.
  private static odometer(value: number): OdometerColumn[] {
    return String(value).split('').map((digit, i) => {
      const to = Number(digit) + 10 * i;
      return { to, digits: Array.from({ length: to + 1 }, (_, k) => k % 10) };
    });
  }

  // ─── Toolkit ───
  // Every figure here is checked against the repos it names (2026-10-04):
  // Angular majors from each app's package.json, the Trade Export standards
  // from its CLAUDE.md, docs/ and .claude/skills, the 15 desks from CAP's
  // ROLE_HIERARCHY. Don't add a number that a repo can't back.
  readonly aiStack = ['Claude Opus 5.5', 'Fable 5.1', 'Claude Code', 'MCP', 'Agent Skills', 'CLAUDE.md'];

  readonly aiTenets = [
    'Standards live in markdown, versioned with the code',
    'Every footgun is written down the day it bites',
    'Agents propose; tests, audits and a human decide'
  ];

  readonly standardsFiles: StandardsFile[] = [
    { path: 'CLAUDE.md', lines: 111, step: 1 },
    { path: 'SECURITY.md', lines: 255, step: 0 },
    { path: 'docs/ANGULAR-STANDARDS.md', lines: 1914, step: 2 },
    { path: 'docs/ARCHITECTURE.md', lines: 201, step: 3 },
    { path: 'docs/BRANCH-MERGE-PROTOCOL.md', lines: 604, step: 0 },
    { path: 'docs/DESIGN.md', lines: 253, step: 0 },
    { path: 'docs/NPM-AUDIT.md', lines: 489, step: 7 },
    { path: 'docs/SHARED-COMPONENTS.md', lines: 94, step: 0 },
    { path: '.claude/skills/verify/SKILL.md', lines: 202, step: 5 }
  ];
  readonly standardsLines = this.standardsFiles.reduce((sum, f) => sum + f.lines, 0);

  readonly agentSteps: AgentStep[] = [
    { verb: 'read', arg: 'CLAUDE.md', out: 'routing rules' },
    { verb: 'read', arg: 'ANGULAR-STANDARDS.md', out: '1,914 lines' },
    { verb: 'plan', arg: 'state rule → Signal Store', out: 'ARCHITECTURE.md' },
    { verb: 'build', arg: 'ng build', out: '✓ budgets hold' },
    { verb: 'verify', arg: 'skill: verify · Playwright', out: '✓ mocked API' },
    { verb: 'test', arg: 'vitest run', out: '✓ 776 passed' },
    { verb: 'audit', arg: 'npm audit', out: '✓ 0 found' },
    { verb: 'hand off', arg: 'human review', out: 'you sign off' }
  ];

  readonly stackCards: StackCard[] = [
    {
      key: 'angular', title: 'Angular platform', stat: 'v14 → v22',
      note: 'Angular majors I have shipped to production, from X-Path to Trade Export',
      chips: ['Signals', 'NgRx Signal Store', 'NGXS', 'RxJS', 'Standalone & NgModules', 'esbuild + Vite']
    },
    {
      key: 'ui', title: 'Bank-grade UI', stat: '15 desks',
      note: 'in one CAP approval chain, from Account Officer to the Board Credit Committee',
      chips: ['Web Components (gb-*)', 'Angular Material', 'Bootstrap 5', 'AG Charts', 'Chart.js', 'SignalR']
    },
    {
      key: 'quality', title: 'Quality & security', stat: '776',
      note: 'Vitest tests on Trade Export, shipped with npm audit at 0',
      chips: ['Vitest', 'Playwright', 'Jasmine & Karma', 'Postman', 'Swagger', 'OWASP']
    },
    {
      key: 'delivery', title: 'Delivery', stat: '83 days',
      note: 'Trade Export, from kickoff to final UAT, in a team of seven',
      chips: ['Branch-merge protocol', 'Azure CI/CD', 'Jenkins', 'Netlify', 'Lighthouse budgets', 'AVIF/WebP pipeline']
    }
  ];

  @ViewChild('agentRun') agentRun?: ElementRef<HTMLElement>;

  // Steps the illustrated agent run forward by writing --step on the pane;
  // CSS derives each line's and file's state from it, so no change detection
  // runs. Ticks only while the pane is on screen; reduced motion shows the
  // finished run and never ticks.
  private initAgentRun(): void {
    const pane = this.agentRun?.nativeElement;
    if (!pane) return;
    const last = this.agentSteps.length;
    const setStep = (n: number) => pane.style.setProperty('--step', String(n));

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setStep(last);
      return;
    }

    const HOLD_TICKS = 3;
    let tick = 0;
    let runs = 0;
    let timer: ReturnType<typeof setInterval> | null = null;
    const advance = () => {
      tick = tick >= last + HOLD_TICKS ? 0 : tick + 1;
      if (tick === 0) pane.dataset['model'] = ++runs % 2 ? 'fable' : 'opus';
      setStep(Math.min(tick, last));
    };
    const start = () => { if (!timer) timer = setInterval(advance, 1100); };
    const stop = () => { if (timer) { clearInterval(timer); timer = null; } };

    setStep(0);
    this.zone.runOutsideAngular(() => {
      const io = new IntersectionObserver(([entry]) => entry.isIntersecting ? start() : stop(), { threshold: 0.35 });
      io.observe(pane);
      this.destroyRef.onDestroy(() => { io.disconnect(); stop(); });
    });
  }

  // ─── Experience ───
  experiences: Experience[] = [
    {
      role: 'Senior Frontend Engineer', company: 'Globus Bank Plc', period: 'Jan 2024 - Present',
      location: 'Victoria Island, Nigeria', col: '#8b5cf6', type: 'Full-time', current: true,
      technologies: ['Angular 21', 'TypeScript', 'RxJS', 'NGXS']
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
  // Sourced from TestimonialsService so the services route renders the same
  // recommendations from one definition — these were previously inline here and
  // would have drifted the moment a second page needed them.
  testimonials = this.testimonialsService.getTestimonials();

  getTestimonialGradient(index: number): string {
    return this.testimonialsService.getGradient(index);
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

  ngAfterViewInit(): void {
    this.destroyRef.onDestroy(() => { if (this.swapTimer) clearTimeout(this.swapTimer); });
    this.destroyRef.onDestroy(() => { if (this.expandedKey()) this.unlockBodyScroll(); });
    this.initReveals();
    this.initAgentRun();
    this.initTestimonialPinScroll();
  }

  // One-shot scroll entrances — same IntersectionObserver pattern as
  // ProjectsComponent's flagship scenes. .in-view starts the Featured Projects
  // cards, fills the rollout progress bars and raises the Toolkit cards.
  private initReveals(): void {
    const targets = document.querySelectorAll('.projects-grid, .cb-panel, .tk');
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      targets.forEach(el => el.classList.add('in-view'));
      return;
    }
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -5% 0px' });
    targets.forEach(el => io.observe(el));
    this.destroyRef.onDestroy(() => io.disconnect());
  }

  // ─── Helpers reused across templates ───
  sanitizeIcon(icon: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(icon);
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
    costaff: 1, trade: 2, fms: 3, tiger: 4, xpath: 5, cap: 6, nxp: 7
  };

  viewProject(key: ProjectKey): void {
    this.analytics.trackProjectView(key);
    this.navigateToProject(HomeComponent.PROJECT_DATA_ID[key]);
  }
}
