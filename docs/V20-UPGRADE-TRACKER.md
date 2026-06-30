# Angular v20 Modernisation Tracker — Iruobe Portfolio

**Started:** 2026-06-30  
**Baseline:** Angular 16.2.12 · TypeScript 5.1.3 · zone.js 0.13.x  
**Target:** Angular 20.x · TypeScript 5.8+ · zone.js 0.15.x  
**Architecture:** NgModule-based (no standalone migration — by design)

> Check off each item as it is completed. Do not mark an item done until the build passes with `npm run build`.

---

## Phase 1 — Version Upgrade (v16 → v20)

Sequential `ng update` hops. Each hop must compile before the next one starts.

- [ ] **v16 → v17** — `ng update @angular/core@17 @angular/cli@17`
- [ ] **v17 → v18** — `ng update @angular/core@18 @angular/cli@18`
- [ ] **v18 → v19** — `ng update @angular/core@19 @angular/cli@19`
- [ ] **v19 → v20** — `ng update @angular/core@20 @angular/cli@20`
- [ ] Build passes cleanly after all 4 hops (`npm run build`)

---

## Phase 2 — Deprecated API Cleanup (`app.module.ts` + `shared.module.ts`)

- [ ] `BrowserModule.withServerTransition({ appId: 'portfolio' })` → `BrowserModule` (deprecated in v17)
- [ ] `HttpClientModule` → `provideHttpClient()` in the `providers` array (deprecated in v15, removed path in v20)
- [ ] Audit whether `FormsModule` + `ReactiveFormsModule` in `SharedModule` are both needed — `FormsModule` alone may be unused; `ReactiveFormsModule` stays (contact form)
- [ ] Remove `FormGroupDirective` from `SharedModule` providers — it is a directive, not a service
- [ ] Add explicit `standalone: false` to all NgModule-declared components (Angular 19 `ng update` migration may automate this — verify it ran)
- [ ] Delete empty stub files: `src/app/store/app.action.ts` and `src/app/store/app.state.ts`
- [ ] Remove `StoreModule` / NGXS references if any crept in (none found at audit time — confirm after upgrade)

---

## Phase 3 — Dependency Injection: Constructor → `inject()`

Replace all constructor injection with the `inject()` function. Empty constructors can be removed entirely.

### Services

- [ ] `analytics.service.ts` — inject `Router`
- [ ] `theme.service.ts` — no injection needed (uses `window` directly); remove empty constructor
- [ ] `seo.service.ts` — audit & convert
- [ ] `icon.service.ts` — audit & convert
- [ ] `loading.service.ts` — audit & convert
- [ ] `project-data.service.ts` — audit & convert
- [ ] `resume-data.service.ts` — audit & convert
- [ ] `ats-pdf.service.ts` — audit & convert
- [ ] `pdf.service.ts` — audit & convert

### Components

- [ ] `header.component.ts` — inject `Router`, `ThemeService`
- [ ] `footer.component.ts` — inject `AnalyticsService`
- [ ] `home.component.ts` — inject `Router`, `DomSanitizer`, `ThemeService`, `IconService`, `AnalyticsService`, `ChangeDetectorRef`
- [ ] `projects.component.ts` — audit & convert
- [ ] `contact.component.ts` — inject `FormBuilder`, `IconService`, `AnalyticsService`
- [ ] `resume.component.ts` — audit & convert
- [ ] `project-card.component.ts` — no injection (has `@HostListener` only); confirm
- [ ] `company-scroller.component.ts` — audit & convert
- [ ] `spinner.component.ts` — audit & convert
- [ ] `theme-toggle.component.ts` — audit & convert
- [ ] `tooltip.component.ts` — inject `ThemeService`

---

## Phase 4 — Template Control Flow (`*ngIf` / `*ngFor` → `@if` / `@for`)

`@for` requires a `track` expression. Use `track item.id` where an id exists; use `track $index` for static lists.

### Templates

- [ ] `header.component.ts` (inline) — audit for structural directives
- [ ] `footer.component.html`
  - `*ngFor` on `navLinks` → `@for (link of navLinks; track link.path)`
  - `*ngFor` on `socialLinks` → `@for (social of socialLinks; track social.name)`
  - `*ngFor` on `portfolioStats` → `@for (stat of portfolioStats; track stat.label)`
- [ ] `home.component.html` — multiple `*ngFor` and `*ngIf` blocks (audit fully)
- [ ] `projects.component.html` — audit & convert
- [ ] `contact.component.html` — audit & convert
- [ ] `resume.component.html` — audit & convert
- [ ] `project-card.component.ts` (inline)
  - `*ngIf="demoUrl"` → `@if (demoUrl)`
  - `*ngFor="let metric of metrics"` → `@for (metric of metrics; track metric.label)`
  - `*ngFor="let tech of techStack"` → `@for (tech of techStack; track tech.name)`
  - `*ngFor="let achievement of achievements; let i = index"` → `@for (achievement of achievements; track $index; let i = $index)`

---

## Phase 5 — Lifecycle Cleanup: `SubscriptionManagementDirective` → `takeUntilDestroyed()`

The `SubscriptionManagementDirective` base class (Subject + `ngOnDestroy`) is the v8-era teardown pattern. Replace with Angular's `takeUntilDestroyed()`.

- [ ] `header.component.ts` — inject `DestroyRef`, replace `.pipe(takeUntil(this.unSubscribe))` with `.pipe(takeUntilDestroyed(destroyRef))`, remove `extends SubscriptionManagementDirective`
- [ ] `home.component.ts` — same
- [ ] `tooltip.component.ts` — same
- [ ] `footer.component.ts` — replace `setInterval` + `ngOnDestroy` with `takeUntilDestroyed()` on an `interval()` observable, or use `effect()` with cleanup
- [ ] Delete `src/app/core/directives/unsubscribe.directive.ts` once all three usages above are cleared
- [ ] Remove `SubscriptionManagementDirective` import from `shared.module.ts` if declared there (it is `standalone: true` so not declared in a module — confirm and remove any lingering imports)

---

## Phase 6 — Signals

### `ThemeService` — `BehaviorSubject` → `signal()`

- [ ] Replace `private isDarkThemeSubject = new BehaviorSubject<boolean>(false)` with `private _isDarkTheme = signal(false)`
- [ ] Expose `readonly isDarkTheme = this._isDarkTheme.asReadonly()`
- [ ] Remove `isDarkTheme$` observable; update all subscribers (`HeaderComponent`, `ToolTipComponent`, `ThemeToggleComponent`) to read the signal directly
- [ ] `toggleTheme()` calls `this._isDarkTheme.set(newTheme)` instead of `.next()`

### `HeaderComponent` — state as signals

- [ ] `isScrolled` → `signal(false)`
- [ ] `isMenuOpen` → `signal(false)`
- [ ] `currentTime` → `signal('')`
- [ ] `isDarkTheme` → derived from `ThemeService` signal via `computed(() => this.themeService.isDarkTheme())`
- [ ] `youtubeTooltipShow` / `themeTooltipShow` → `signal(false)`

### `FooterComponent` — state as signals

- [ ] `lagosTime` → `signal('')`
- [ ] `isBusinessHours` → `signal(false)`
- [ ] `emailHovered` / `phoneHovered` / `youtubeHovered` → `signal(false)`

### `ContactComponent` — form state as signals

- [ ] `isSubmitting` / `submitSuccess` / `submitError` (or equivalent flags) → `signal()`

### `LoadingService` (if BehaviorSubject-based)

- [ ] Audit and convert to `signal()` if applicable

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
  - `@Input() text: string = ''` → `text = input('')`
  - `@Input() show: boolean = false` → `show = input(false)`

---

## Phase 8 — `@defer` Blocks (Performance)

Defer non-critical sections so they hydrate after the above-the-fold content is interactive.

- [ ] **Home — Projects grid**: wrap `.featured-projects` section in `@defer (on viewport)` with a skeleton placeholder
- [ ] **Home — Testimonials**: wrap testimonials section in `@defer (on viewport)`
- [ ] **Home — Skills grid**: wrap `.skills-section` in `@defer (on viewport)`
- [ ] **Projects page — project cards**: `@defer (on viewport)` per card or for the whole grid
- [ ] **Resume page**: defer the experience timeline and skills table sections

---

## Phase 9 — Housekeeping

- [ ] Confirm `web.config` (IIS redirect) is not needed on Netlify (already have `_redirects`) — can delete if redundant
- [ ] Remove `fix-npm.sh` from repo root if it was a one-time fix script
- [ ] Remove `src/ANGULAR_19_UPGRADE_COMPLETE.md` — that is a CAP banking project document, wrong repo
- [ ] `allowedCommonJsDependencies` in `angular.json` — audit post-upgrade; remove entries for packages no longer in use (`rgbcolor`, `dompurify` if not actually imported)

---

## Phase 10 — Standards Doc Rewrite

- [ ] Rewrite `docs/ANGULAR-19-STANDARDS.md` for this portfolio specifically
  - Remove all CAP / NGXS / Angular Material references
  - Update "Standalone First" principle to "NgModule architecture — signals and modern APIs within modules"
  - Add portfolio-specific examples for each pattern (inject, signals, control flow, defer)
  - Lock version header to Angular 20.x

---

## Build Verification Checklist

Run after Phase 1 and again after all phases complete.

- [ ] `npm run build` — zero errors, zero warnings
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

- **NgModules stay** — this is an explicit architectural decision. Signals, `inject()`, new control flow, and `@defer` all work inside NgModule-based components.
- **`standalone: false`** must be on every component declared in a module. Angular 19's `ng update` adds this automatically — verify it ran.
- **`@for` track expressions** are required in v17+. `track $index` is the fallback for lists without stable IDs.
- **`SubscriptionManagementDirective`** must have zero usages before its file is deleted.
- **`ThemeService`** switch from Observable to Signal will cascade to `HeaderComponent`, `ToolTipComponent`, and `ThemeToggleComponent` — do all four in one pass.
