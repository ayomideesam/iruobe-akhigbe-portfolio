# Angular v20 Modernisation Tracker — Iruobe Portfolio

**Started:** 2026-06-30  
**Baseline:** Angular 16.2.12 · TypeScript 5.1.3 · zone.js 0.13.x  
**Target:** Angular 20.x · TypeScript 5.8+ · zone.js 0.15.x  
**Architecture:** NgModule-based (no standalone migration — by design)

> Check off each item as it is completed. Do not mark an item done until the build passes with `npm run build`.

---

## Phase 1 — Version Upgrade (v16 → v20) ✅ COMPLETE

Sequential `ng update` hops. Each hop must compile before the next one starts.

- [x] **v16 → v17** — `ng update @angular/core@17 @angular/cli@17` ✅ 2026-06-30
- [x] **v17 → v18** — `ng update @angular/core@18 @angular/cli@18` ✅ 2026-06-30 (HttpClientModule → provideHttpClient() auto-migrated)
- [x] **v18 → v19** — `ng update @angular/core@19 @angular/cli@19` ✅ 2026-06-30 (standalone: false added to all 13 components auto-migrated)
- [x] **v19 → v20** — `ng update @angular/core@20 @angular/cli@20` ✅ 2026-06-30 (tsconfig moduleResolution → bundler auto-migrated)
- [x] Build passes cleanly after all 4 hops (`npm run build`) ✅ 2026-06-30

---

## Phase 2 — Deprecated API Cleanup ✅ COMPLETE

- [x] `BrowserModule.withServerTransition({ appId: 'portfolio' })` → `BrowserModule` ✅ 2026-06-30 (v20 fully removed this)
- [x] `HttpClientModule` → `provideHttpClient(withInterceptorsFromDi())` ✅ 2026-06-30 (v18 auto-migration)
- [x] `FormsModule` removed from `SharedModule` — no `ngModel` usage anywhere; `ReactiveFormsModule` stays ✅ 2026-06-30
- [x] `FormGroupDirective` removed from `SharedModule` providers — it is a directive, not a service ✅ 2026-06-30
- [x] `standalone: false` on all NgModule-declared components ✅ 2026-06-30 (v19 auto-migration — 13 files)
- [x] Empty stub files deleted: `src/app/store/app.action.ts` and `src/app/store/app.state.ts` ✅ 2026-06-30
- [x] StoreModule / NGXS — confirmed not present anywhere in codebase ✅ 2026-06-30

---

## Phase 3 — Dependency Injection: Constructor → `inject()` ✅ COMPLETE

Replace all constructor injection with the `inject()` function. Empty constructors removed.

### Services

- [x] `analytics.service.ts` — inject `Router` ✅ 2026-06-30
- [x] `theme.service.ts` — fully rewritten (Phase 6 done alongside Phase 3) ✅ 2026-06-30
- [x] `seo.service.ts` — inject `Meta`, `Title`, `Router` ✅ 2026-06-30
- [x] `icon.service.ts` — no deps; no constructor needed ✅ 2026-06-30 (confirmed)
- [x] `loading.service.ts` — no deps; BehaviorSubject only ✅ 2026-06-30 (confirmed)
- [x] `project-data.service.ts` — no deps; no constructor needed ✅ 2026-06-30 (confirmed)
- [x] `resume-data.service.ts` — no deps; no constructor needed ✅ 2026-06-30 (confirmed)
- [x] `ats-pdf.service.ts` — no constructor injection needed ✅ 2026-06-30 (confirmed)
- [x] `pdf.service.ts` — no constructor injection needed ✅ 2026-06-30 (confirmed)

### Components

- [x] `header.component.ts` — inject `Router`, `ThemeService`, `DestroyRef` ✅ 2026-06-30
- [x] `footer.component.ts` — inject `AnalyticsService`, `DestroyRef` ✅ 2026-06-30
- [x] `home.component.ts` — inject `Router`, `DomSanitizer`, `ThemeService`, `IconService`, `AnalyticsService`, `DestroyRef` ✅ 2026-06-30
- [x] `projects.component.ts` — inject `Router`, `SeoService`, `ProjectDataService`, `AnalyticsService` ✅ 2026-06-30
- [x] `contact.component.ts` — inject `FormBuilder`, `IconService`, `AnalyticsService` ✅ 2026-06-30
- [x] `resume.component.ts` — inject all 9 services ✅ 2026-06-30
- [x] `app.component.ts` — inject `ThemeService`, `NgZone`, `Router`, `LoadingService`, `DestroyRef` ✅ 2026-06-30
- [x] `project-card.component.ts` — no injection needed (HostListener only) ✅ 2026-06-30 (confirmed)
- [x] `company-scroller.component.ts` — inject `IconService`, `ChangeDetectorRef`, `DestroyRef` ✅ 2026-06-30
- [x] `spinner.component.ts` — no injection needed ✅ 2026-06-30 (confirmed)
- [x] `theme-toggle.component.ts` — inject `ThemeService` ✅ 2026-06-30
- [x] `tooltip.component.ts` — inject `ThemeService` ✅ 2026-06-30
- [x] `safehtml.pipe.ts` — inject `DomSanitizer` ✅ 2026-06-30

---

## Phase 4 — Template Control Flow (`*ngIf` / `*ngFor` → `@if` / `@for`) ✅ COMPLETE

`@for` requires a `track` expression. Use `track item.id` where an id exists; `track $index` for static lists.

### Templates

- [x] `app.component.ts` (inline) — `@for` on `floatingLetters`; `@if` on `hasExploded`, `isLoadingComplete` (×3) ✅ 2026-06-30
- [x] `header.component.ts` (inline) — audited, no structural directives ✅ 2026-06-30
- [x] `footer.component.html` ✅ 2026-06-30
  - `@for (link of navLinks; track link.path)`
  - `@for (social of socialLinks; track social.name)`
  - `@for (stat of portfolioStats; track stat.label)`
- [x] `home.component.html` — 22 directives converted ✅ 2026-06-30
  - particles (×4) and motes (×2) → `@for (... track $index)`
  - `technologies` → `@for (tech of technologies; track $index; let i = $index)`
  - `featuredProjects` + inner `techStack` → nested `@for` blocks
  - `currentlyBuilding.modules` + inner `badge-dot` `@if` and `module.tech` `@for`
  - `skillCategories` + inner `category.skills` → nested `@for` blocks
  - `experiences` + inner `exp.type`, `exp.current`, `exp.technologies` `@if`/`@for`
  - `testimonials` + inner `[1,2,3,4,5]` stars → nested `@for` blocks
- [x] `projects.component.html` — all 12 animation container `@if` blocks + inner loops converted ✅ 2026-06-30
  - `project` outer loop → `@for (project of projects; track project.id)`
  - All top-right / bottom-left animation containers → `@if (project.id === N)` with inner `@for` on literal arrays
  - Detail panel: `@if (project.stats?.length)` + `@for (stat …)` + `@if (project.pipeline?.length)` + `@for (step …)`
  - `tech-badge` → `@for (tech of project.techStack; track tech.name)`
  - `achievements` → `@for (achievement of project.achievements; track $index)`
- [x] `contact.component.html` — 4 form `@if` validation blocks + submit loader + success/error overlays ✅ 2026-06-30
- [x] `resume.component.html` — 16 directives converted ✅ 2026-06-30
  - `skills` → `@for (skill of skills; track skill.name)`
  - Language dots (4 languages) → `@for (dot of [1,2,3,4,5]; track dot)` with per-language `[class.filled]`
  - `keyTechnicalAchievements` → `@for (... track $index)`
  - `employmentHistory` + inner `@if (job.period.includes('Present'))`, `@if (getCompanyTenure(i))`, `@if (job.description)`, `@if (job.achievements?.length)` + nested `@for`, `@if (job.technicalAchievements?.length)` + nested `@for`, `@if (job.technicalLeadership?.length)` + nested `@for`
  - `courses` → `@for (course of courses; track course.title)`
  - `references` → `@for (reference of references; track reference.name)`
- [x] `project-card.component.ts` (inline) ✅ 2026-06-30
  - `@if (demoUrl)` on demo anchor
  - `@for (metric of metrics; track metric.label)`, `@for (tech of techStack; track tech.name)`, `@for (achievement of achievements; track $index; let i = $index)`
- [x] `spinner.component.ts` (inline) — `@if (isLoading)` on spinner text ✅ 2026-06-30
- [x] `company-scroller.component.ts` (inline) — `@for (company of companies; track company.name)` (×2 duplicate slides) ✅ 2026-06-30

---

## Phase 5 — Lifecycle Cleanup: `SubscriptionManagementDirective` → `takeUntilDestroyed()` ✅ COMPLETE

- [x] `header.component.ts` — `DestroyRef` injected; router subscription uses `takeUntilDestroyed()` in constructor; clock interval uses `takeUntilDestroyed(destroyRef)` in `ngOnInit` ✅ 2026-06-30
- [x] `home.component.ts` — `extends` removed; `DestroyRef.onDestroy()` for `cancelAnimationFrame` cleanup; theme subscription eliminated (signal getter) ✅ 2026-06-30
- [x] `footer.component.ts` — `setInterval`/`ngOnDestroy` replaced with `interval()` + `takeUntilDestroyed(destroyRef)` ✅ 2026-06-30
- [x] `resume.component.ts` — `extends` removed; router events wired via `takeUntilDestroyed()` in constructor; `isDarkTheme$` subscription eliminated (getter) ✅ 2026-06-30
- [x] `app.component.ts` — `extends` removed; router + loading subscriptions use `takeUntilDestroyed()`; `animationFrame` cleanup via `DestroyRef.onDestroy()` ✅ 2026-06-30
- [x] `tooltip.component.ts` — no subscription needed (reads ThemeService signal directly) ✅ 2026-06-30
- [x] `src/app/core/directives/unsubscribe.directive.ts` deleted — zero usages confirmed ✅ 2026-06-30
- [x] `SharedModule` — `SubscriptionManagementDirective` was `standalone: true`, not declared in any module; confirmed clean ✅ 2026-06-30

---

## Phase 6 — Signals

### `ThemeService` — `BehaviorSubject` → `signal()` ✅ COMPLETE

- [x] `private _isDarkTheme = signal(false)` ✅ 2026-06-30
- [x] `readonly isDarkTheme = this._isDarkTheme.asReadonly()` ✅ 2026-06-30
- [x] `isDarkTheme$` observable removed; all subscribers updated ✅ 2026-06-30
- [x] `toggleTheme()` calls `this._isDarkTheme.set(next)` ✅ 2026-06-30

### `HeaderComponent` — state as signals

- [x] `isDarkTheme` → `computed(() => this.themeService.isDarkTheme())` ✅ 2026-06-30
- [ ] `isScrolled` → `signal(false)`
- [ ] `isMenuOpen` → `signal(false)`
- [ ] `currentTime` → `signal('')`
- [ ] `youtubeTooltipShow` / `themeTooltipShow` → `signal(false)`

### `FooterComponent` — state as signals

- [ ] `lagosTime` → `signal('')`
- [ ] `isBusinessHours` → `signal(false)`
- [ ] `emailHovered` / `phoneHovered` / `youtubeHovered` → `signal(false)`

### `ContactComponent` — form state as signals

- [ ] `isSubmitting` → `signal(false)`
- [ ] `submitSuccess` → `signal(false)`
- [ ] `showErrorMessage` → `signal(false)`

### `LoadingService` — BehaviorSubject → signal()

- [ ] `loading$` → `loading = signal(false)` with `set()`/`asReadonly()` pattern
- [ ] `loadingText$` → `loadingText = signal('')`
- [ ] Update `AppComponent` to read signal directly (no subscription needed)
- [ ] Update `ResumeComponent` to call `loadingService.show()` / `hide()` (API unchanged)

---

## Phase 7 — `@Input()` → `input()` Signals

- [ ] `project-card.component.ts`
  - `@Input() title!: string` → `title = input.required<string>()`
  - `@Input() description!: string` → `description = input.required<string>()`
  - `@Input() demoUrl?: string` → `demoUrl = input<string>()`
  - `@Input() techStack: TechStack[] = []` → `techStack = input<TechStack[]>([])`
  - `@Input() metrics: ProjectMetric[] = []` → `metrics = input<ProjectMetric[]>([])`
  - `@Input() achievements: string[] = []` → `achievements = input<string[]>([])`
- [ ] `tooltip.component.ts`
  - `@Input() text = ''` → `text = input('')`
  - `@Input() show = false` → `show = input(false)`
- [ ] `spinner.component.ts`
  - `@Input() isLoading = false` → `isLoading = input(false)`
  - `@Input() text?: string` → `text = input<string>()`
  - Remove `ngOnInit` and `ngOnChanges` — `input()` signals re-evaluate automatically

---

## Phase 8 — `@defer` Blocks (Performance)

Defer non-critical sections so they hydrate after above-the-fold content is interactive.

- [ ] **Home — Projects grid**: wrap `.featured-projects` section in `@defer (on viewport)` with skeleton placeholder
- [ ] **Home — Testimonials**: wrap testimonials section in `@defer (on viewport)`
- [ ] **Home — Skills grid**: wrap `.skills-section` in `@defer (on viewport)`
- [ ] **Projects page — project cards**: `@defer (on viewport)` per card or for the whole grid
- [ ] **Resume page**: defer the experience timeline and skills table sections

---

## Phase 9 — Housekeeping

- [ ] Remove `src/ANGULAR_19_UPGRADE_COMPLETE.md` — CAP banking project document, wrong repo
- [ ] Remove `fix-npm.sh` from repo root (one-time fix script)
- [ ] Confirm `web.config` (IIS redirect) is redundant on Netlify (already have `_redirects`) — delete if so
- [ ] `allowedCommonJsDependencies` in `angular.json` — audit post-upgrade; remove entries for packages no longer in use
- [ ] Remove stale comments throughout codebase (`// Add proper cleanup in ngOnDestroy` etc.)

---

## Phase 10 — Standards Doc Rewrite

- [ ] Rewrite `docs/ANGULAR-19-STANDARDS.md` for this portfolio specifically
  - Remove all CAP / NGXS / Angular Material references
  - Update "Standalone First" to "NgModule architecture — signals and modern APIs within modules"
  - Add portfolio-specific examples for each pattern (inject, signals, control flow, defer)
  - Lock version header to Angular 20.x

---

## Build Verification Checklist

Run after Phase 1 and again after all phases complete.

- [x] `npm run build` — zero errors ✅ 2026-06-30 (post Phase 2–5)
- [x] `npm run build` — zero errors ✅ 2026-06-30 (post Phase 4 — all control flow conversions)
- [ ] `npm run build` — zero errors (final, post Phase 8)
- [ ] Dev server loads: `npm start`
- [ ] **Desktop (1440px):** Home, Projects, Contact, Resume all render correctly
- [ ] **Tablet (1024px / 820px / 768px):** Hamburger menu, Lagos status, project cards
- [ ] **Mobile (390px / 375px / 360px):** All sections, scroll-to-top button, footer
- [ ] Theme toggle switches light ↔ dark cleanly
- [ ] Lagos clock ticks every second
- [ ] Header world clock ticks every second
- [ ] All Angular animations play (hero, project cards, footer scroll-up)
- [ ] Contact form submits successfully via EmailJS
- [ ] YouTube animation runs in header + footer
- [ ] Scroll-to-top bounce + ring pulse visible

---

## Notes

- **NgModules stay** — explicit architectural decision. Signals, `inject()`, new control flow, and `@defer` all work inside NgModule-based components.
- **`standalone: false`** must be on every component declared in a module.
- **`@for` track expressions** are required in v17+. `track $index` is the fallback for lists without stable IDs.
- **Animation deprecation hints** — Angular v20 deprecated old overload signatures for `trigger`, `transition`, `style`, `animate`. Severity: "Hint" only, not build-breaking. Tracked separately from this list.
