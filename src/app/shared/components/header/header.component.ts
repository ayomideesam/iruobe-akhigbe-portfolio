import {
  AfterViewInit, Component, DestroyRef, ElementRef, HostListener,
  OnInit, computed, inject, signal
} from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { interval } from 'rxjs';
import { filter } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ThemeService } from 'src/app/core/services/theme.service';

interface HdrTier {
  isMobile: boolean;
  showNav: boolean;
  showResume: boolean;
  badgeInline: boolean;
  badgeBelow: boolean;
  showClock: boolean;
  clockSec: boolean;
}

@Component({
  selector: 'app-header',
  template: `
    <nav class="nav-pill">
      <!-- Brand -->
      <a class="brand" routerLink="/" (click)="onLinkClick()">
        <span class="brand-chip">
          <img src="assets/icons/logo-mark-256.png" alt="Akhigbe Iruobe logo" width="28" height="28">
        </span>
        <span class="brand-text">
          <span class="brand-name">Akhigbe Iruobe</span>
          <span class="brand-sub">
            <span class="brand-title">Senior Frontend Engineer</span>
            @if (tier().badgeInline) {
              <span class="avail-badge"><span class="pulse-dot"></span>Available</span>
            }
          </span>
          @if (tier().badgeBelow) {
            <span class="avail-badge avail-below"><span class="pulse-dot"></span>Available</span>
          }
        </span>
      </a>

      <!-- Desktop nav -->
      @if (tier().showNav) {
        <div class="nav-links">
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }" (click)="onLinkClick()">Home</a>
          <a routerLink="/services" routerLinkActive="active" (click)="onLinkClick()">Services</a>
          <a routerLink="/projects" routerLinkActive="active" (click)="onLinkClick()">Projects</a>
          <a routerLink="/contact" routerLinkActive="active" (click)="onLinkClick()">Contact</a>
          @if (tier().showResume) {
            <a routerLink="/resume" routerLinkActive="active" (click)="onLinkClick()">Resume</a>
          }
        </div>
        <div class="nav-end">
          <span class="nav-clock" aria-label="Your local time"><span class="clock-dot"></span><span class="clock-time"></span></span>
          <button class="theme-switch" (click)="toggleTheme()" role="switch" [attr.aria-checked]="isDarkTheme()" aria-label="Toggle theme">
            <span class="ts-sun"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"></path></svg></span>
            <span class="ts-moon"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg></span>
            <span class="ts-knob" [style.transform]="knobTransform()"><span class="ts-knob-face" [class.ts-spin-a]="spinFlip()" [class.ts-spin-b]="!spinFlip()"></span></span>
          </button>
        </div>
      }

      <!-- Mobile bar -->
      @if (tier().isMobile) {
        <div class="mobile-bar">
          @if (tier().showClock) {
            <span class="nav-clock nav-clock-mobile" aria-label="Your local time"><span class="clock-dot"></span><span class="clock-time"></span></span>
          }
          <button class="theme-switch" (click)="toggleTheme()" role="switch" [attr.aria-checked]="isDarkTheme()" aria-label="Toggle theme">
            <span class="ts-sun"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"></path></svg></span>
            <span class="ts-moon"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg></span>
            <span class="ts-knob" [style.transform]="knobTransform()"><span class="ts-knob-face" [class.ts-spin-a]="spinFlip()" [class.ts-spin-b]="!spinFlip()"></span></span>
          </button>
          <button class="burger" (click)="toggleMenu()" aria-label="Toggle menu">
            <span></span><span></span><span></span>
          </button>
        </div>
      }
    </nav>

    <!-- Full-screen mobile menu -->
    @if (isMenuOpen()) {
      <div class="mobile-menu">
        <div class="mm-blob mm-blob-1" aria-hidden="true"></div>
        <div class="mm-blob mm-blob-2" aria-hidden="true"></div>

        <div class="mm-head">
          <span class="mm-brand">
            <span class="mm-brand-chip"><img src="assets/icons/logo-mark-256.png" alt="Akhigbe Iruobe logo" width="28" height="28"></span>
            <span class="mm-brand-text">
              <span class="brand-name">Akhigbe Iruobe</span>
              <span class="brand-title">Senior Frontend Engineer</span>
            </span>
          </span>
          <button class="mm-close" (click)="closeMenu()" aria-label="Close menu">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M5 5l14 14M19 5L5 19"></path></svg>
          </button>
        </div>

        <nav class="mm-nav">
          <a routerLink="/" (click)="closeMenu()" class="mm-i mm-link">
            <span class="mm-num">01</span>
            <span class="mm-label mm-label-active">Home</span>
            <svg class="mm-arrow" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--pr)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"></path></svg>
          </a>
          <a routerLink="/services" (click)="closeMenu()" class="mm-i mm-link">
            <span class="mm-num">02</span>
            <span class="mm-label">Services</span>
            <svg class="mm-arrow" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--pr)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"></path></svg>
          </a>
          <a routerLink="/projects" (click)="closeMenu()" class="mm-i mm-link">
            <span class="mm-num">03</span>
            <span class="mm-label">Projects</span>
            <svg class="mm-arrow" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--pr)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"></path></svg>
          </a>
          <a routerLink="/contact" (click)="closeMenu()" class="mm-i mm-link">
            <span class="mm-num">04</span>
            <span class="mm-label">Contact</span>
            <svg class="mm-arrow" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--pr)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"></path></svg>
          </a>
          <a routerLink="/resume" (click)="closeMenu()" class="mm-i mm-link">
            <span class="mm-num">05</span>
            <span class="mm-label">Resume</span>
            <svg class="mm-arrow" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--pr)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"></path></svg>
          </a>
          <a href="https://www.youtube.com/@AyomideIruobe" target="_blank" rel="noopener noreferrer" class="mm-i mm-link mm-link-yt">
            <span class="mm-num">06</span>
            <span class="mm-label mm-label-yt">
              YouTube
              <svg class="mm-yt-icon" width="22" height="22" viewBox="0 0 24 24" fill="#f43f5e"><path d="M23.5 6.2c-.3-1.1-1.1-1.9-2.2-2.2C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.3.5c-1.1.3-1.9 1.1-2.2 2.2C0 8 0 12 0 12s0 4 .5 5.8c.3 1.1 1.1 1.9 2.2 2.2 1.8.5 9.3.5 9.3.5s7.5 0 9.3-.5c1.1-.3 1.9-1.1 2.2-2.2.5-1.8.5-5.8.5-5.8s0-4-.5-5.8zM9.5 15.5v-7l6.2 3.5-6.2 3.5z"></path></svg>
            </span>
            <svg class="mm-arrow" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f43f5e" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17L17 7M9 7h8v8"></path></svg>
          </a>
        </nav>

        <div class="mm-foot mm-i">
          <div class="mm-appearance">
            <span class="mm-appearance-text">
              <span class="mm-appearance-title">Appearance</span>
              <span class="mm-appearance-sub">{{ isDarkTheme() ? 'Dark mode' : 'Light mode' }}</span>
            </span>
            <button class="theme-switch theme-switch-plain" (click)="toggleTheme()" role="switch" [attr.aria-checked]="isDarkTheme()" aria-label="Toggle theme">
              <span class="ts-sun"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"></path></svg></span>
              <span class="ts-moon"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg></span>
              <span class="ts-knob ts-knob-white" [style.transform]="knobTransform()"><span class="ts-knob-face" [class.ts-spin-a]="spinFlip()" [class.ts-spin-b]="!spinFlip()"></span></span>
            </button>
          </div>
          <div class="mm-social-row">
            <span class="mm-avail"><span class="pulse-dot"></span>Available for roles</span>
            <span class="mm-socials">
              <a href="https://github.com/ayomideesam" target="_blank" rel="noopener noreferrer" aria-label="GitHub" class="mm-soc">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"></path></svg>
              </a>
              <a href="https://www.linkedin.com/in/akhigbe-iruobe/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" class="mm-soc mm-soc-li">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"></path></svg>
              </a>
              <a href="https://wa.me/2347038772342" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" class="mm-soc mm-soc-wa">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"></path></svg>
              </a>
            </span>
          </div>
        </div>
      </div>
    }
  `,
  styleUrls: ['./header.component.css'],
  standalone: false
})
export class HeaderComponent implements OnInit, AfterViewInit {
  private router = inject(Router);
  private themeService = inject(ThemeService);
  private destroyRef = inject(DestroyRef);
  private el = inject(ElementRef);

  // ≤1024 burger. Prototype value is 820 — revert by setting NAV_MIN = 820.
  private static readonly NAV_MIN = 1025;

  readonly isDarkTheme = computed(() => this.themeService.isDarkTheme());
  readonly knobTransform = computed(() => this.isDarkTheme() ? 'translateX(28px)' : 'translateX(0px)');

  // rotate(0deg)->rotate(360deg) resolves to the same matrix once committed, so a
  // plain CSS transition can't re-interpolate it on the next toggle (nothing to
  // diff against). Alternating between two identically-defined keyframe names
  // forces the animation to restart every click regardless of the knob's resting
  // transform state.
  readonly spinFlip = signal(false);

  readonly tier = signal<HdrTier>(HeaderComponent.computeHdr(window.innerWidth));
  readonly isMenuOpen = signal(false);

  // Progressive tier system — identical to the prototype's computeHdr apart from
  // the burger threshold (NAV_MIN). Nothing disappears all at once.
  //
  // Services was added as the 2nd inline link and YouTube was dropped from the
  // desktop bar (it remains in the mobile menu, the footer and the home CTA).
  // Removing the YouTube link freed enough horizontal room that Resume now
  // survives down to 940px instead of 1000px — the nav is less crowded below
  // 1160px than it was before Services existed.
  private static computeHdr(w: number): HdrTier {
    return {
      isMobile: w < HeaderComponent.NAV_MIN,
      showNav: w >= HeaderComponent.NAV_MIN,
      showResume: w >= 940,
      badgeInline: w >= 1440,
      badgeBelow: w >= 560 && w < 1440,
      showClock: w >= 420,
      clockSec: w >= 1160
    };
  }

  constructor() {
    this.router.events
      .pipe(takeUntilDestroyed(), filter(e => e instanceof NavigationEnd))
      .subscribe(() => this.closeMenu());
  }

  ngOnInit(): void {
    this.tick();
    interval(1000).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.tick());
  }

  ngAfterViewInit(): void {
    this.tick();
  }

  @HostListener('window:resize')
  onResize(): void {
    this.tier.set(HeaderComponent.computeHdr(window.innerWidth));
    this.tick();
  }

  // Clock — direct DOM update to avoid change-detection storms (prototype behavior),
  // plus a 320ms opacity pulse per tick. Updates whichever .clock-time is rendered.
  private tick(): void {
    const now = new Date();
    const opts: Intl.DateTimeFormatOptions = this.tier().clockSec
      ? { hour: '2-digit', minute: '2-digit', second: '2-digit' }
      : { hour: '2-digit', minute: '2-digit' };
    const text = now.toLocaleTimeString('en-US', opts);
    const els: NodeListOf<HTMLElement> = this.el.nativeElement.querySelectorAll('.clock-time');
    els.forEach(elm => {
      elm.textContent = text;
      try { elm.animate([{ opacity: 0.45 }, { opacity: 1 }], { duration: 320, easing: 'ease-out' }); } catch { /* no-op */ }
    });
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
    this.spinFlip.update(v => !v);
  }

  toggleMenu(): void {
    const open = !this.isMenuOpen();
    this.isMenuOpen.set(open);
    document.body.style.overflow = open ? 'hidden' : '';
  }

  closeMenu(): void {
    this.isMenuOpen.set(false);
    document.body.style.overflow = '';
  }

  onLinkClick(): void {
    window.scrollTo(0, 0);
    this.closeMenu();
  }
}
