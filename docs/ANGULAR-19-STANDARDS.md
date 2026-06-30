# Angular 20 Development Standards — Iruobe Portfolio
**Portfolio Project: iruobe-portfolio**  
**Last Updated:** 2026-06-30  
**Angular Version:** 20.x | **TypeScript:** 5.8+ | **zone.js:** 0.15.x

> **Filename note:** This file is intentionally kept at `docs/ANGULAR-19-STANDARDS.md` as a stable permalink. The content tracks the current Angular version. Do not rename without updating every reference.

---

## Architecture Decision: NgModules (Intentional)

This portfolio uses **NgModule-based architecture**. This is an explicit, permanent decision — not a migration target.

- All components declare `standalone: false`
- Components are declared in `AppModule` or feature modules (`HomeModule`, `ProjectsModule`, `ContactModule`, `ResumeModule`, `SharedModule`)
- `inject()`, signals, `@if`/`@for`, and `@defer` all work inside NgModule components — no standalone migration is needed to use modern Angular APIs

---

## Core Principles

1. **Signals over plain properties** — component state is `signal()`, not mutable class fields
2. **`inject()` over constructor DI** — all dependencies injected via `inject()`
3. **`@if` / `@for` / `@defer`** — no structural directives (`*ngIf`, `*ngFor`)
4. **`takeUntilDestroyed()` over `ngOnDestroy`** — RxJS cleanup tied to component lifetime
5. **GPU-composited animations only** — `transform` and `opacity` in `@keyframes`, never `background`/`width`/`height`
6. **Component-scoped CSS** — styles in `.component.css`, no global utility classes

---

## Dependency Injection

```typescript
// ❌ OLD
constructor(
  private router: Router,
  private themeService: ThemeService
) {}

// ✅ CURRENT — inject() at field level, no constructor
private router = inject(Router);
private themeService = inject(ThemeService);
private destroyRef = inject(DestroyRef);
```

Empty constructors are removed entirely. Constructor is only present when it runs meaningful logic (e.g., router subscription in `HeaderComponent`).

---

## Signals: Component State

All mutable component state is `signal()`. Services expose read-only signals via `asReadonly()`.

### Service pattern
```typescript
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly _isDarkTheme = signal(false);
  readonly isDarkTheme = this._isDarkTheme.asReadonly();

  toggleTheme(): void {
    this._isDarkTheme.update(v => !v);
  }
}
```

### Component state pattern
```typescript
export class HeaderComponent {
  // Derived from service
  readonly isDarkTheme = computed(() => this.themeService.isDarkTheme());

  // Local UI state
  readonly isScrolled = signal(false);
  readonly isMenuOpen = signal(false);
  readonly currentTime = signal('');

  onWindowScroll(): void {
    this.isScrolled.set(window.scrollY > 20);
  }

  toggleMenu(): void {
    const open = !this.isMenuOpen();
    this.isMenuOpen.set(open);
    document.body.style.overflow = open ? 'hidden' : '';
  }
}
```

### Input signals (`input()`)
```typescript
// ❌ OLD
@Input() text = '';
@Input() show = false;
@Input() title!: string;

// ✅ CURRENT
readonly text = input('');
readonly show = input(false);
readonly title = input.required<string>();

// Template — always invoke with ()
{{ title() }}
[class.visible]="show()"
```

### Computed signals
```typescript
// SpinnerComponent — computed replaces ngOnInit + ngOnChanges
readonly text = input('');
readonly displayText = computed(() => this.text() || 'Loading');
```

---

## Template Control Flow

```html
<!-- ❌ OLD structural directives -->
<div *ngIf="isLoading">...</div>
<li *ngFor="let skill of skills; let i = index">...</li>

<!-- ✅ CURRENT control flow blocks -->
@if (isLoading()) {
  <div>...</div>
}

@for (skill of skills(); track skill.name; let i = $index) {
  <li>{{ skill.name }}</li>
}
```

### `@for` track rules
- Stable IDs: `track item.id`
- Named items (no id): `track item.name`
- Literal arrays or anonymous items: `track $index`

### Local variables in `@for`
```html
@for (job of employmentHistory; track $index; let i = $index; let first = $first) {
  @if (first) { <span class="badge">Current</span> }
}
```

### Non-null assertion inside `@if` guards
When an `@if` guards optional arrays before an inner `@for`, TypeScript still sees the type as `T[] | undefined` inside the block — use `!`:
```html
@if (job.achievements?.length) {
  @for (achievement of job.achievements!; track $index) { ... }
}
```

---

## Deferred Rendering (`@defer`)

Below-fold sections are wrapped in `@defer (on viewport)` to defer rendering until the section enters the viewport. A `@placeholder` block preserves layout height while the content is pending.

```html
@defer (on viewport) {
<section class="testimonials-section">
  <!-- full content -->
</section>
} @placeholder {
<div style="min-height: 500px"></div>
}
```

### Where `@defer` is used in this portfolio
| Template | Section | Placeholder height |
|---|---|---|
| `home.component.html` | `.featured-projects` | 650px |
| `home.component.html` | `.skills-section` | 550px |
| `home.component.html` | `.testimonials-section` | 500px |
| `projects.component.html` | `.project-section` (full `@for`) | 800px |
| `resume.component.html` | `.skills-section` | 250px |
| `resume.component.html` | `.employment-section` | 800px |

**Note:** `@defer` in this codebase defers rendering laziness only — the app uses the webpack-based browser builder, so `@defer` does not produce separate code-split chunks for template-only content. The rendering benefit is still real (deferred change detection scope and Angular animation registration).

---

## RxJS Cleanup

Use `takeUntilDestroyed()` from `@angular/core/rxjs-interop` — no `Subject`-based `destroy$` pattern, no `SubscriptionManagementDirective`.

```typescript
// ✅ Constructor-context — no destroyRef argument needed
constructor() {
  this.router.events
    .pipe(takeUntilDestroyed())
    .subscribe(event => { ... });
}

// ✅ Outside constructor — pass destroyRef explicitly
private destroyRef = inject(DestroyRef);

ngOnInit(): void {
  interval(1000)
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe(() => this.updateClock());
}

// ✅ Non-RxJS cleanup (animation frames, intervals)
constructor() {
  const destroyRef = inject(DestroyRef);
  destroyRef.onDestroy(() => {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  });
}
```

---

## Animation Standards

Only GPU-composited properties in `@keyframes`:

```css
/* ✅ Composite-only — no Paint */
@keyframes float {
  0%   { transform: translateY(0) rotate(0deg); opacity: 0.3; }
  50%  { transform: translateY(-8px) rotate(3deg); opacity: 0.7; }
  100% { transform: translateY(0) rotate(0deg); opacity: 0.3; }
}

/* ❌ Triggers Paint — do not use in @keyframes */
@keyframes glow {
  0%   { background: rgba(99, 102, 241, 0); }
  50%  { background: rgba(99, 102, 241, 0.3); }
}
```

For glow/shimmer effects, animate on a `::before`/`::after` pseudo-element with `pointer-events: none`. Never animate `background`, `width`, `height`, `top`, or `left` in `@keyframes`.

Linter hints that `transform` "triggers Composite" are false positives — `transform` is explicitly GPU-composited per spec.

---

## CSS Architecture

- **Component-scoped:** styles in `.component.css`, `styleUrls` in component decorator
- **Global variables only** in `src/styles.css` — CSS custom properties (`--primary-color`, `--accent-color`, etc.)
- No global utility classes
- Per-card accent overrides via `--card-accent` / `--card-accent-rgb` set on the card class

```css
/* src/styles.css — global variables */
:root {
  --primary-color: #6366f1;
  --primary-rgb: 99, 102, 241;
  --accent-color: #06b6d4;
  --accent-rgb: 6, 182, 212;
}
```

---

## Responsiveness

Every UI change must work at:

| Device | Width |
|---|---|
| Mobile S | 320px |
| Phone (SE → S8+) | 360–390px |
| Phone (12, 14 Pro Max) | 390–430px |
| Tablet S (iPad Mini) | 768px |
| Tablet M (iPad Air) | 820px |
| Tablet L (iPad Pro) | 1024px |
| Desktop | 1280px |
| Wide | 1440px+ |

- **Hamburger breakpoint:** ≤1024px
- **Desktop nav:** ≥1025px only
- **Nav clock hides at:** ≤1024px

---

## Key Project Conventions

- **Project data** is centralised in `project-data.service.ts` — never hardcode project content in templates
- **Testimonials** are real LinkedIn recommendations — do not alter quote text
- **Lagos clock** uses `Intl.DateTimeFormat` with `timeZone: 'Africa/Lagos'` — not UTC offset math
- **SPA routing** handled by `src/_redirects` (Netlify) — no `web.config` needed
- **`allowedCommonJsDependencies`** in `angular.json` — all 18 entries are required; they suppress CJS warnings from `canvg`, a transitive dependency of `jsPDF` used for PDF export

---

## Code Review Checklist

- [ ] `standalone: false` present on all NgModule-declared components
- [ ] No `@Input()` decorator — use `input()` / `input.required()` signal API
- [ ] All mutable component state is `signal()`, not plain class properties
- [ ] All `@for` loops have a `track` expression
- [ ] `@if` / `@for` used — no `*ngIf` / `*ngFor`
- [ ] RxJS subscriptions use `takeUntilDestroyed()`, not `ngOnDestroy` + Subject
- [ ] No `ngOnInit` / `ngOnChanges` used solely to mirror an `input()` into local state — use `computed()` instead
- [ ] Below-fold sections wrapped in `@defer (on viewport)` with a `@placeholder`
- [ ] No `background`, `width`, `height`, `top`, `left` inside `@keyframes`
- [ ] No global utility classes — all styles component-scoped
- [ ] No `Co-Authored-By:` lines in git commits

---

## Directory Layout

```
src/app/shared/          → Header, Footer, reusable components (SharedModule)
src/app/pages/           → Home, Projects, Contact, Resume (lazy-loaded feature modules)
src/app/core/services/   → project-data, resume-data, theme, analytics, loading, icon
src/app/store/           → Minimal shared state (no NgRx)
src/assets/              → Fonts, icons, images
src/styles.css           → Global CSS variables only
docs/                    → V20-UPGRADE-TRACKER.md, ANGULAR-19-STANDARDS.md
```

---

## Update History

| Date | Version | Notes |
|---|---|---|
| 2026-06-30 | Angular 20.x | Full rewrite for portfolio — removed CAP / NgRx / standalone / gb-* content; added NgModule architecture note, `@defer` section, `input()` signal API, `takeUntilDestroyed` pattern, portfolio-specific conventions |
