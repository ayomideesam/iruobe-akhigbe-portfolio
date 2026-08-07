# Iruobe-Portfolio — Claude Code Instructions

## Project Identity

**Owner:** Akhigbe Iruobe — Senior Frontend Engineer, 9+ years  
**Framework:** Angular 20 (NgModule-based — no standalone migration underway)  
**Purpose:** Personal portfolio showcasing enterprise Angular work; a living representation of Akhigbe's engineering standard, not a throwaway static site.

---

## Who You Are Here

You operate as a **Principal Frontend Engineer and Trusted Collaborator** on this project.

- Write production-quality code. Tutorial-quality is not acceptable.
- Responsiveness is non-negotiable — every UI change must work across the full device range (see below).
- Performance matters: GPU-composited animations only (`transform`, `opacity`), avoid Paint-triggering properties in `@keyframes`.
- When asked to fix one thing, return the fix and flag anything structurally adjacent that also needs attention.
- When you disagree with an approach, implement what was asked and flag your reasoning separately — never silently implement something you believe is wrong.
- Skip preamble. Akhigbe is senior. No "Great question!", no recapping what you're about to do. Just do it and report results.

---

## Routing Rules — Read Before Answering

### Dependency, `npm audit`, vulnerability or lockfile question
Read this file first, every time, before touching `package.json` or `package-lock.json`:
```
docs/NPM-AUDIT.md
```
It is a **living document** — every `npm audit` run updates its "Current status" block and adds a row
to the findings log, including findings judged low-risk and left open. A security doc that is written
once and never revisited manufactures confidence the tree no longer earns.

Non-negotiables from that document, repeated here because getting them wrong is expensive:

- **Audit after `npm ci`, never against a drifted `node_modules`.** The 2026-08-07 pass measured 15
  findings locally and 33 from a clean `ci`. Only the `npm ci` number reflects what deploys.
- **Never delete `package-lock.json` to break an `ERESOLVE`.** Remove only the offending scope's
  entries (e.g. the `@angular*` records) and re-run `npm install`. A full re-resolve silently drifts
  every other pin, including the security overrides.
- **Prefer the narrowest override.** Scope by parent, stay in the current major where a patch exists,
  and use the `"."` key when a nested override must also pin the package itself — writing
  `"pkg": { "dep": "…" }` replaces the version pin and silently unpins `pkg`.
- **Always run `npm ls --all | grep invalid` after adding or changing an override.** npm reports an
  over-broad override as `invalid` rather than failing the install.
- **Never `npm audit fix --force` blindly** — it resolves majors. Evaluate the breaking change first.
- **Triage by production exposure, not severity alone** (`npm audit --omit=dev`). A high in the Karma
  chain is not the same risk as a low in `dompurify`, which ships in the bundle.

If a fix requires a framework major bump, flag it and stop — that is its own piece of work, not a
dependency-audit-sized decision.

---

## Tech Stack & Architecture

| Layer | Detail |
|---|---|
| Framework | Angular 20, TypeScript, NgModules |
| Animations | Angular Animations API + CSS `@keyframes` (GPU-composited only) |
| Routing | Angular Router, lazy-loaded feature modules |
| Deployment | Netlify (`src/_redirects` handles SPA routing) |
| SEO | Meta tags, OpenGraph, structured data, `robots.txt`, `sitemap.xml` |
| Testing | Jasmine + Karma (unit), manual QA checklist (no E2E framework yet) |
| Dependencies | npm `overrides` for transitive CVEs — see `docs/NPM-AUDIT.md` |

### Directory conventions
```
src/app/shared/          → Header, Footer, reusable components
src/app/pages/           → Home, Projects, Contact, Resume (feature modules)
src/app/core/services/   → Data services: project-data, resume-data, theme, analytics, seo
src/app/store/           → Any shared state (minimal — portfolio doesn't need NgRx)
src/assets/              → Fonts, icons, images
src/styles.css           → Global CSS variables (--primary-color, --primary-rgb, etc.)
```

CSS is **component-scoped** (`.component.css` per component). No global utility classes. Global variables only in `src/styles.css`.

---

## Responsiveness Rules (Non-Negotiable)

Every UI change must be tested mentally (and flagged if untested) against:

| Device | Width |
|---|---|
| Mobile S | 320px |
| Phone (iPhone SE → Samsung S8+) | 360–390px |
| Phone (iPhone 12, 14 Pro Max) | 390–430px |
| Tablet S (iPad Mini) | 768px |
| Tablet M (iPad Air) | 820px |
| Tablet L (iPad Pro) | 1024px |
| Desktop | 1280px |
| Wide | 1440px+ |

**Hamburger menu breakpoint: ≤1024px.** Desktop inline nav: ≥1025px only.  
**Nav clock hides at: ≤1024px.**

---

## Animation Standards

- Only `transform` and `opacity` inside `@keyframes` — these are Composite-only (GPU layer, no Paint).
- `background`, `width`, `height`, `top`, `left` in `@keyframes` cause Paint — do not use.
- Use `::before`/`::after` pseudo-elements for glow/shimmer to avoid animating background on the host element.
- Always add `pointer-events: none` to animated pseudo-elements.
- On `:hover`, pause/cancel animations for clean click interaction.
- Linter hints saying `transform` "triggers Composite" are false positives — `transform` is explicitly GPU-composited per spec. Ignore these hints.

---

## CSS Variables Reference

Key variables from `src/styles.css`:
```css
--primary-color       /* brand indigo */
--primary-rgb         /* RGB triplet for rgba() usage */
--accent-color        /* brand cyan */
--accent-rgb
--background-color
--card-background
--text-primary
--text-secondary
--border-color
```

Per-card accent overrides (contact page, project cards):
```css
--card-accent         /* set per card class */
--card-accent-rgb
```

---

## Key Decisions Already Made

- **Projects data is centralised** in `project-data.service.ts` — never hardcode project content in templates
- **Testimonials** are real LinkedIn recommendations — do not fabricate or alter quote text
- **Lagos clock** uses `Intl.DateTimeFormat` with `timeZone: 'Africa/Lagos'` — not UTC offset math
- **Scroll-to-top button** has bounce + ring-pulse animation; WhatsApp bubble is fixed bottom-right — keep scroll button away from that corner on mobile
- **Footer YouTube link** has the same pop/shimmer animation rhythm as the header YouTube button but on a slightly different cycle so they don't sync
- **Header YouTube `::after`** is blocked with `display: none !important` — the nav underline pseudo-element would otherwise apply to it

---

## SEO — Strategy, Architecture & Rules

### The Entity Problem (Read This First)

Searching "iruobe" on Google returns Waje (Aituaje Iruobe): Wikipedia, iruobe.com, 1.4M Instagram followers, Knowledge Panel. Unmovable.  
Searching "akhigbe" returns Vice Admiral Mike Akhigbe: Wikipedia, government sources, Knowledge Panel. Also unmovable.

**Neither surname standalone is a viable ranking target.**

The target is the *combination*: **"Akhigbe Iruobe"** — no dominant entity, no Knowledge Panel, low competition. Every SEO decision in this project is oriented around owning that combo and its variants.

### Priority Query Cluster (target in this order)

| Priority | Query | Intent |
|---|---|---|
| 1 | `Akhigbe Iruobe` | Identity — the name combo, claimable now |
| 2 | `Akhigbe Iruobe Angular developer` | Professional discovery |
| 3 | `Akhigbe Iruobe engineer Nigeria` | Geo + role scoped |
| 4 | `Iruobe Akhigbe Ayomide` | Full formal name |
| 5 | `Akhigbe Iruobe portfolio` | Direct portfolio intent |

Do not optimise page copy toward "iruobe" or "akhigbe" as standalone terms — you cannot rank for those without Wikipedia-level domain authority behind the individual name.

---

### The Entity URI — Non-Negotiable

Every Person schema block across every route MUST use this stable `@id`:

```
https://iruobeakhigbe.netlify.app/#person
```

This is how Google reconciles "Akhigbe Iruobe on the portfolio" with "Akhigbe Iruobe on LinkedIn" with "ayomideesam on GitHub". Without a consistent `@id`, each page looks like a different person to the Knowledge Graph crawler.

The `SeoService.personEntity` getter is the single source of truth for the Person block. Never inline a duplicate Person object in any `structuredData` call — use `{ '@id': this.personId }` for cross-references, or `this.personEntity` for the full block.

---

### Schema Patterns Per Route

| Route | `@type` | Person usage |
|---|---|---|
| `/` (Home) | `ProfilePage` → `mainEntity: Person` | Full `personEntity` |
| `/projects` | `CollectionPage` → `author: { @id }` | Reference only |
| `/resume` | `WebPage` → `about: { @id }`, `mainEntity: Person` | Full `personEntity` |
| `/contact` | `ContactPage` → `mainEntity: Person` | Slim (contact fields only) |

**ProfilePage schema** (home only): Google introduced this in 2023 specifically for personal portfolio/bio pages. Wrap the full Person entity inside `ProfilePage.mainEntity`. Do not use bare `Person` on the home route.

---

### Person Entity — Required Fields

These are the exact fields Google uses for name disambiguation. Every form of the name must be present. Never remove or shorten this block.

```typescript
{
  '@type': 'Person',
  '@id': 'https://iruobeakhigbe.netlify.app/#person',
  name: 'Akhigbe Iruobe',
  givenName: 'Ayomide',
  familyName: 'Iruobe',
  additionalName: 'Akhigbe',
  alternateName: [
    'Iruobe Akhigbe Ayomide',
    'Akhigbe Ayomide Iruobe',
    'Akhigbe Iruobe Ayomide'
  ],
  // nationality, address, worksFor, knowsAbout, hasOccupation, sameAs
  // are all required — see seo.service.ts personEntity getter
}
```

---

### Meta Tags Checklist (per navigation)

Every call to `updateSeo()` must produce all of the following. If you modify `SeoService`, verify nothing is dropped.

**Basic:**
- `description` — 150–160 chars, include "Akhigbe Iruobe" in the first 60
- `author: Akhigbe Iruobe`
- `robots: index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1`
- `geo.region: NG-LA`
- `geo.placename: Lagos, Nigeria`

**Open Graph (all required):**
- `og:title`, `og:description`, `og:url`, `og:type`, `og:site_name`
- `og:image` — minimum 1200×630px
- `og:image:width: 1200` — LinkedIn/Facebook silently reject the card without this
- `og:image:height: 630` — same
- `og:image:alt` — descriptive alt text, not just the title
- `og:image:type` — mime type string
- `og:locale: en_GB`

**Twitter/X:**
- `twitter:card: summary_large_image`
- `twitter:title`, `twitter:description`, `twitter:image`, `twitter:image:alt`
- `twitter:creator: @akhigbe_dev`, `twitter:site: @akhigbe_dev`

**Canonical:**
- `<link rel="canonical" href="...">` as a DOM element (never a `<meta>` tag)

---

### Content SEO Rules

When writing or editing ANY visible text — headings, hero copy, project descriptions, footer:

- The `<h1>` on the home route MUST contain "Akhigbe Iruobe" — not just "Senior Angular Engineer"
- The home hero must render the full name as visible DOM text (not just a logo or image node)
- Project descriptions in `project-data.service.ts` should include "Akhigbe Iruobe" at least once per project naturally (in achievements if not elsewhere)
- The `<footer>` must contain the full name as a text node

Name visibility in DOM text is one of the primary signals Google uses to associate the URL with an entity name. These rules are not optional.

---

### SEO Anti-Patterns — Never Do These

- Never call `updateSeo()` directly from components — only through the typed `set[Page]Seo()` wrappers
- Never set `og:image` without also setting `og:image:width` and `og:image:height`
- Never emit two `<script type="application/ld+json">` blocks — `addStructuredData()` removes the previous before inserting
- Never set `og:type: 'profile'` without also adding `profile:first_name`, `profile:last_name`, `profile:username` — incomplete OG object; use `'website'` instead
- Never set `robots: noindex` on any production route (except explicit thank-you/admin surfaces)
- Never hardcode a duplicate Person schema anywhere except the pre-hydration `ld-json-static` fallback in `index.html` (which `addStructuredData()` removes on first navigation)

---

### SEO File Map

| Purpose | File |
|---|---|
| All SEO logic | `src/app/core/services/seo.service.ts` |
| Sitemap | `src/sitemap.xml` |
| Robots directive | `src/robots.txt` |
| Pre-hydration JSON-LD | `src/index.html` → `<script id="ld-json-static">` |
| SPA redirect rules | `src/_redirects` |

### Other project docs

| Purpose | File |
|---|---|
| Dependency vulnerabilities, `npm audit` policy, override log | `docs/NPM-AUDIT.md` |

---

### Off-Page Signal Consistency

Google reconciles the portfolio entity against these external sources via `sameAs`. Every profile MUST use "Akhigbe Iruobe" as the display name and match the `sameAs` array exactly.

| Platform | URL | Required display name |
|---|---|---|
| LinkedIn | `https://www.linkedin.com/in/akhigbe-iruobe/` | Akhigbe Iruobe |
| GitHub | `https://github.com/ayomideesam` | Akhigbe Iruobe (in bio) |
| Twitter/X | `https://twitter.com/akhigbe_dev` | Akhigbe Iruobe |

Any mismatch creates a Knowledge Graph reconciliation conflict — Google may conclude the portfolio entity and the LinkedIn entity are different people.

---

### OG Image Priority Action

The current default OG image is a fraud dashboard screenshot. Every share to LinkedIn, WhatsApp, and Twitter shows a dark banking UI instead of a person. Create a dedicated **1200×630px** image:
- Professional headshot (left third)
- Name: "Akhigbe Iruobe" (large, readable at thumbnail size)
- Title: "Senior Angular Engineer · 9+ Years · Fintech"
- Place at `src/assets/img/og-default.png`
- Update `defaultImage` in `SeoService`

This single change improves social share CTR more than any other SEO fix.

---

## Quality Assurance & Testing

### Philosophy

Tests on this project serve two masters: engineering confidence and portfolio signalling. A recruiter or hiring manager who opens the repo and sees a well-structured test suite reads it as evidence of production discipline — because it is. Write tests accordingly.

**Test behaviour, not implementation.** Tests that break when you rename a private method are liabilities, not assets.

---

### What to Test (and What Not To)

**Test these — they have real failure modes:**
- `SeoService` — `updateSeo()`, `setHomeSeo()`, canonical URL formation, `@id` presence in structured data
- `project-data.service.ts` — data shape, all required fields present, no empty `title` or `description`
- `resume-data.service.ts` — same shape contract
- Routing — lazy module loads, 404 fallback, redirect rules
- Any component with conditional rendering logic (NgIf on data, error states)
- `ThemeService` — toggle persists to localStorage, class applied correctly to `<body>`
- `Lagos clock` — correct timezone output, not UTC

**Do not test these — no logic to validate:**
- Pure presentational components with no inputs/outputs
- CSS class bindings with no conditional logic
- Static template strings
- Third-party library internals

---

### Test Standards

```typescript
// File naming: *.spec.ts co-located with the source file
// Test IDs: describe → it reads as a sentence
describe('SeoService', () => {
  describe('setHomeSeo()', () => {
    it('should emit ProfilePage schema with Person @id on the home route', () => { });
    it('should set og:image:width to 1200', () => { });
    it('should include alternateName array with all three name variants', () => { });
  });
});
```

**Coverage targets:**
| Layer | Target |
|---|---|
| Services (core + data) | ≥ 90% |
| Routed page components | ≥ 70% (logic paths only) |
| Shared components | ≥ 60% (conditional branches) |
| Pure presentational | Skip |

**Overall project target: ≥ 80% statement coverage.** Do not sacrifice meaningful test quality to hit a number — a 95% coverage score built on shallow snapshot tests is worse than 75% built on behaviour tests.

---

### Manual QA Checklist

Run this before every production deploy. Do not skip any item because "it hasn't changed."

**SEO verification:**
- [ ] Open DevTools → Elements → `<head>`. Confirm `og:image:width` and `og:image:height` are present on all routes
- [ ] Confirm only one `<script type="application/ld+json">` block exists after navigating between routes
- [ ] Confirm `<link rel="canonical">` reflects the current route URL
- [ ] Paste the site URL into [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/) — verify image renders correctly

**Responsiveness:**
- [ ] Test all 8 breakpoints (320px → 1440px+) in Chrome DevTools device mode
- [ ] Hamburger menu opens/closes correctly at ≤1024px
- [ ] No horizontal scroll at any breakpoint
- [ ] Fixed elements (WhatsApp bubble, scroll-to-top) do not collide on mobile

**Animation:**
- [ ] Run Chrome Performance panel — no red Paint events during animations
- [ ] Animations pause on `:hover` without visual jump
- [ ] Reduced-motion preference is respected (`prefers-reduced-motion: reduce` in DevTools)

**Cross-browser:**
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (macOS, via BrowserStack if no Mac available)
- [ ] Mobile Chrome (Android)
- [ ] Mobile Safari (iOS)

**Performance (Lighthouse):**
- [ ] Run Lighthouse in Incognito (eliminates extension interference)
- [ ] Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 95, SEO = 100
- [ ] If score drops, do not deploy until root cause is identified

**Functionality:**
- [ ] All navigation links resolve — no 404s on any route
- [ ] Contact form submits without error (check network tab)
- [ ] PDF download link resolves on Resume page
- [ ] All project images load (no broken `<img>` src)
- [ ] Dark/light theme toggle persists on page refresh
- [ ] Lagos clock displays correct local time (compare to worldtimeserver.com/Nigeria)

---

### Regression Protocol

When a bug is fixed:
1. Write the test that would have caught the bug first
2. Confirm it fails on the pre-fix code (red)
3. Apply the fix
4. Confirm it passes (green)
5. Commit test and fix together in a single commit

This is not optional hygiene — it is the only way to prevent the same bug from recurring without notice.

---

## Core Web Vitals & Performance Budget

### Targets (non-negotiable before production deploy)

| Metric | Target | Why it matters |
|---|---|---|
| LCP (Largest Contentful Paint) | < 2.5s | Primary ranking signal; hero image/text is the LCP candidate |
| INP (Interaction to Next Paint) | < 200ms | Replaced FID in 2024; Angular change detection is the risk here |
| CLS (Cumulative Layout Shift) | < 0.1 | Animations and lazy-loaded images are the CLS risk |
| Lighthouse Performance | ≥ 90 | Portfolio-quality signal for recruiters |
| Total JS (gzipped) | < 250KB | Angular 20 with lazy routing should clear this comfortably |
| Total CSS (gzipped) | < 50KB | Component-scoped styles — no framework CSS debt |

---

### LCP Rules

The LCP element on the home route is almost always the hero image or the largest heading. Control it:

- Hero image MUST have `loading="eager"` and `fetchpriority="high"` — never lazy-load the LCP element
- Add `<link rel="preload" as="image">` in `index.html` for the hero image
- The OG image (`og-default.png`) must also be WebP format — use PNG as fallback only
- Never use CSS `background-image` for the hero — it is not LCP-eligible and cannot be preloaded

---

### INP / Change Detection Rules

Angular 20 NgModule + default change detection is the primary INP risk. Every component that animates, scrolls, or reacts to user input is a candidate.

- Use `ChangeDetectionStrategy.OnPush` on ALL components that receive data via `@Input()` only
- Never subscribe to observables in template expressions (`{{ obs$ | async }}` is fine, `{{ getDataFromService() }}` is not)
- Debounce scroll listeners — minimum 100ms throttle on `fromEvent(window, 'scroll')`
- Do not run change detection in animation callbacks — use `NgZone.runOutsideAngular()` for `requestAnimationFrame` loops

---

### CLS Rules

CLS failures on this project are most likely from:
1. Images without `width` and `height` attributes — the browser can't reserve space before load
2. Animations that shift layout (anything that changes `margin`, `padding`, `top`, `left`)
3. Late-loading fonts causing text reflow

Fixes:
- Every `<img>` MUST have explicit `width` and `height` attributes matching the intrinsic asset size
- Use `aspect-ratio` CSS on image containers as a fallback for dynamically-sized images
- Load body font via `<link rel="preload" as="font">` in `index.html` — do not rely on CSS `@font-face` alone
- All animations use `transform` and `opacity` only — this was already the rule; it also prevents CLS

---

### Bundle Size Rules

- Lazy-load every page module (`loadChildren` in the router) — this is already the architecture
- Never import an entire icon library — use individual icon imports only
- Run `ng build --stats-json` after adding any new dependency, then check with `webpack-bundle-analyzer`
- If any single lazy chunk exceeds 100KB gzipped, investigate before merging

---

### Netlify Performance Config

Ensure `netlify.toml` (or `_headers`) includes these for all assets:

```toml
[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/*.js"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/*.css"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/"
  [headers.values]
    Cache-Control = "public, max-age=0, must-revalidate"
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Permissions-Policy = "camera=(), microphone=(), geolocation=()"
```

The HTML document itself must have `max-age=0` (always revalidate) while hashed JS/CSS bundles get `immutable`. Swapping these is a common deploy mistake that causes stale SPA shells.

---

## Accessibility Standards

### Target: WCAG 2.1 AA

Minimum requirement for every component. This is not idealism — it is a portfolio signal. An enterprise Angular portfolio that fails basic accessibility tells hiring managers the engineer cuts corners on non-functional requirements. Fintech and banking platforms are legally required to be accessible in most jurisdictions where you are targeting roles.

---

### Color Contrast

All text must meet WCAG 2.1 AA contrast ratios:
- Normal text (< 18pt): **4.5:1 minimum** against background
- Large text (≥ 18pt or ≥ 14pt bold): **3:1 minimum**
- Interactive elements (buttons, links, form controls): **3:1 against adjacent colours**

The dark theme is the primary design — verify contrast on **both** dark and light modes. Use the [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/) before finalising any colour decision.

Common failure points on dark portfolio sites:
- Muted secondary text (`--text-secondary`) on `--card-background` — often fails at standard opacity
- Animated glow/shimmer that changes perceived contrast — test at the lowest-contrast animation frame
- Disabled state colours — must still meet 3:1

---

### Focus Management

- Every interactive element MUST have a visible focus indicator — not just the browser default ring, a styled one that matches the brand
- The focus ring must never be `outline: none` without a replacement — this is a WCAG 2.4.7 failure
- On route navigation, focus MUST move to a logical landmark (`<h1>` or `<main>`) — Angular Router does not do this automatically
- Implement a skip-to-content link as the first focusable element in `<body>`:

```html
<!-- In app.component.html, first child of body -->
<a class="skip-link" href="#main-content">Skip to main content</a>
```

```css
.skip-link {
  position: absolute;
  transform: translateY(-100%);
  transition: transform 0.2s;
}
.skip-link:focus {
  transform: translateY(0);
}
```

---

### ARIA Rules

- Never add `role` or `aria-*` attributes to elements that are already semantically correct — `<button>` does not need `role="button"`
- Use `aria-label` on icon-only buttons: `<button aria-label="Open navigation menu">`
- Animated elements that update visually must announce changes to screen readers: `aria-live="polite"` for non-urgent, `aria-live="assertive"` for critical status
- The Lagos clock component must have `aria-label` that describes what it shows: `aria-label="Current time in Lagos, Nigeria"`
- Navigation `<nav>` elements must have `aria-label` when more than one exists on the page: `aria-label="Main navigation"`, `aria-label="Footer navigation"`

---

### Keyboard Navigation

Every interaction must be achievable without a mouse:
- Tab order follows the visual reading order — never use `tabindex > 0`
- Hamburger menu: `Enter`/`Space` opens, `Escape` closes, focus returns to trigger on close
- Project cards: keyboard-navigable, `Enter` activates the same action as click
- Scroll-to-top button: keyboard accessible, announces action via `aria-label`
- All form inputs (contact form): labelled with `<label for>` — never placeholder-only labels

---

### Reduced Motion

Respect `prefers-reduced-motion: reduce` for ALL animations:

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

Add this to `src/styles.css` globally. This single rule handles all CSS animations and transitions. Angular Animations API (`@Component` animation triggers) need a separate guard — check `window.matchMedia('(prefers-reduced-motion: reduce)')` before triggering complex entrance animations.

---

### Accessibility Testing Protocol

**Before every deploy:**
- [ ] Run [axe DevTools](https://www.deque.com/axe/devtools/) browser extension on every route — zero critical violations
- [ ] Tab through the entire site with keyboard only — every interactive element is reachable and operable
- [ ] Test with screen reader: NVDA (Windows, free) or VoiceOver (macOS/iOS, built-in)
- [ ] Check all images have meaningful `alt` text — decorative images use `alt=""`
- [ ] Verify focus indicator is visible on every focusable element in both themes

**Automated (CI-ready):**
```bash
# axe-core via @axe-core/cli
npx axe http://localhost:4200 --include main --tags wcag2a,wcag2aa
npx axe http://localhost:4200/projects --include main --tags wcag2a,wcag2aa
npx axe http://localhost:4200/resume --include main --tags wcag2a,wcag2aa
npx axe http://localhost:4200/contact --include main --tags wcag2a,wcag2aa
```

Zero violations at `wcag2aa` is the pass criterion. Any violation blocks the deploy.

---

## Git Commit Rules

- **Never add `Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>`** (or any Claude co-author line) to commit messages in this repository.
- Use conventional commits format: `feat:`, `fix:`, `perf:`, `a11y:`, `seo:`, `test:`, `chore:`, `docs:`
- Commit message body (when needed) explains *why*, not *what* — the diff shows what
- SEO changes use prefix `seo:` — e.g. `seo: add ProfilePage schema to home route`
- Accessibility fixes use prefix `a11y:` — e.g. `a11y: add skip-to-content link and focus management on route change`
- Performance changes use prefix `perf:` — e.g. `perf: add fetchpriority=high to hero image for LCP improvement`