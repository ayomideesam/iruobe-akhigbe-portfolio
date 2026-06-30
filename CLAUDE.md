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

## Tech Stack & Architecture

| Layer | Detail |
|---|---|
| Framework | Angular 20, TypeScript, NgModules |
| Animations | Angular Animations API + CSS `@keyframes` (GPU-composited only) |
| Routing | Angular Router, lazy-loaded feature modules |
| Deployment | Netlify (`src/_redirects` handles SPA routing) |
| SEO | Meta tags, OpenGraph, structured data, `robots.txt`, `sitemap.xml` |

### Directory conventions
```
src/app/shared/          → Header, Footer, reusable components
src/app/pages/           → Home, Projects, Contact, Resume (feature modules)
src/app/core/services/   → Data services: project-data, resume-data, theme, analytics
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

## Git Commit Rules

- **Never add `Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>`** (or any Claude co-author line) to commit messages in this repository.
