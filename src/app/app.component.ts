// app.component.ts - Part 1: Base Setup
import { Component, OnInit, NgZone, inject, DestroyRef } from '@angular/core';
import { ThemeService } from './core/services/theme.service';
import { trigger, state, style, animate, transition, keyframes } from '@angular/animations';
import { NavigationEnd, NavigationStart, Router, Event as RouterEvent } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LoadingService } from './core/services/loading.service';

interface FloatingLetter {
  char: string;
  x: number;
  y: number;
  speed: number;
  opacity: number;
  size: number;
  direction: number;
  rotation: number;
  rotationVelocity: number;
  velocityX: number;
  velocityY: number;
  rotationDirection?: number;
  isExploded: boolean;
  isVisible: boolean;
}

@Component({
    selector: 'app-root',
    template: `
    <div class="app-container" [ngClass]="{'dark-theme': isDarkTheme}">
      <app-spinner [isLoading]="isSpinner" [text]="loadingText"></app-spinner>
      <!-- Rest of your template -->
      <div class="floating-letters-container">
        @for (letter of floatingLetters; track letter.char) {
        <div
          [ngStyle]="{
            'left.%': letter.isVisible ? letter.x : 50,
            'top.%': letter.isVisible ? letter.y : 50,
            'opacity': letter.isVisible ? letter.opacity : 0,
            'font-size.rem': letter.size,
            'display': letter.isVisible ? 'block' : 'none'
          }"
          class="floating-letter"
          [class.exploded]="letter.isExploded"
          [@explosionAnimation]="{
            value: letter.isExploded ? 'exploded' : 'gathered',
            params: {
              finalX: letter.x,
              finalY: letter.y,
              rotation: letter.rotation * (letter.rotationDirection || 1),
              delay: letter.isVisible ? letter.char.charCodeAt(0) * 30 : 0,
              opacity: letter.opacity
            }
          }">
          {{letter.char}}
        </div>
        }
      </div>

      <!-- Loading Overlay -->
      <div class="loading-overlay" [class.active]="!isLoadingComplete" [@overlayAnimation]>
        <!-- Welcome Message with Pulse and Background -->
        @if (!hasExploded) {
        <div class="welcome-message-container" [@welcomeAnimation]>
          <div class="welcome-message-background"></div>
          <div class="welcome-message">
            Welcome
          </div>
        </div>
        }
      </div>

      <!-- Main Content -->
      @if (isLoadingComplete) {
      <app-header></app-header>
      }
      <main [@mainContentAnimation]="isLoadingComplete ? 'visible' : 'hidden'">
        <router-outlet></router-outlet>
      </main>
      @if (isLoadingComplete) {
      <a href="https://wa.me/2347038772342"
        target="_blank"
        rel="noopener noreferrer"
        class="whatsapp-float">
        <svg viewBox="0 0 24 24" class="whatsapp-icon">
          <path fill="currentColor" d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.274.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.1.824zm-3.423-14.416c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm.029 18.88c-1.161 0-2.305-.292-3.318-.844l-3.677.964.984-3.595c-.607-1.052-.927-2.246-.926-3.468.001-3.825 3.113-6.937 6.937-6.937 1.856.001 3.598.723 4.907 2.034 1.31 1.311 2.031 3.054 2.03 4.908-.001 3.825-3.113 6.938-6.937 6.938z"/>
        </svg>
      </a>
      }
      @if (isLoadingComplete) {
      <app-footer></app-footer>
      }
    </div>
  `,
    styles: [`
    :host {
      font-family: "Sora", serif;
    }

    .app-container {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      transition: background-color 0.3s ease, color 0.3s ease;
      position: relative;
      overflow: hidden;
    }

    .app-container.dark-theme {
      background-color: #1a1a1a;
      color: #ffffff;
    }

    .loading-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.3);
      backdrop-filter: blur(3px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      transition: all 0.5s ease;
    }

    .loading-overlay.active {
      opacity: 1;
      visibility: visible;
    }

    .loading-overlay:not(.active) {
      opacity: 0;
      visibility: hidden;
      pointer-events: none;
    }

    main {
      flex: 1;
      padding: 2rem;
      max-width: 1440px;
      margin: 0 auto;
      width: 100%;
      position: relative;
      opacity: 0;
    }

    .welcome-message-container {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .welcome-message-background {
      position: absolute;
      width: 300px;
      height: 300px;
      background-color: rgba(255, 255, 255, 0.05);
      border-radius: 50%;
      animation: pulse 1.5s infinite;
      z-index: 1;
    }

    @keyframes pulse {
      0% {
        transform: scale(0.9);
        box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.1);
      }
      70% {
        transform: scale(1);
        box-shadow: 0 0 0 20px rgba(255, 255, 255, 0);
      }
      100% {
        transform: scale(0.9);
        box-shadow: 0 0 0 0 rgba(255, 255, 255, 0);
      }
    }

    .welcome-message {
      position: absolute;
      left: 50%;
      top: 50%;
      font-family: "Macondo", "Sora", serif;
      transform: translate(-50%, -50%);
      font-size: 4.5rem;
      font-weight: 300;
      color: var(--primary-color);
      z-index: 1001;
      text-align: center;
      line-height: 1.4;
      text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
    }

    .floating-letters-container {
      position: fixed;
      inset: 0;
      pointer-events: none;
      z-index: 0;  /* Below content but always visible */
    }

    .floating-letter {
      position: absolute;
      font-family: "Macondo", serif;
      font-weight: 300;
      transform-origin: center;
      /* Base centering — animation overrides during burst, this resumes after */
      transform: translate(-50%, -50%);
      transition: opacity 0.3s ease;
      will-change: transform, opacity, left, top;
      filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
    }

    .floating-letter.exploded {
      transition: none;
    }

    .app-container:not(.dark-theme) .floating-letter {
      color: rgba(79, 70, 229, 0.18);
    }

    .app-container.dark-theme .floating-letter {
      color: rgba(129, 140, 248, 0.18);
    }

    .whatsapp-float {
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 1000;
      animation: pulse 4s infinite;
      transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .whatsapp-icon {
      width: 50px;
      height: 50px;
      color: #25D366;
      filter: drop-shadow(0 0 17.5px rgba(37, 211, 102, 0.3));
      transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .whatsapp-float:hover .whatsapp-icon {
      transform: scale(1.3);
      transition: all 0.7s ease-in-out cubic-bezier(0.4, 0, 0.2, 1);
      filter: drop-shadow(0 0 20px rgba(37, 211, 102, 0.4));
    }

    .app-container:not(.dark-theme) .whatsapp-icon {
      width: 50px;
      height: 50px;
      color: #25D366;
      background: #fff;
      border-radius: 50%;
      filter: drop-shadow(0 0 17.5px rgba(79, 70, 229, 0.3)); /* Changed to match primary color */
      transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .app-container:not(.dark-theme) .whatsapp-float:hover .whatsapp-icon {
      filter: drop-shadow(0 0 35px rgba(79, 70, 229, 0.4)); /* Hover effect with same color */
    }

    @keyframes pulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.15); }
      100% { transform: scale(1); }
    }

    @media (max-width: 600px) {
      .whatsapp-icon {
        width: 40px;
        height: 40px;
      }
      
      .whatsapp-float {
        bottom: 15px;
        right: 15px;
      }
    }
  `],
    animations: [
        trigger('welcomeAnimation', [
            transition(':enter', [
                style({ opacity: 0, transform: 'translate(-50%, -50%) scale(0.8)' }),
                animate('0.3s cubic-bezier(0.4, 0, 0.2, 1)', style({ opacity: 1, transform: 'translate(-50%, -50%) scale(0.7)' }))
            ]),
            transition(':leave', [
                animate('0.5s cubic-bezier(0.4, 0, 0.2, 1)', style({
                    opacity: 0,
                    transform: 'translate(-50%, -50%) scale(2)'
                }))
            ])
        ]),
        trigger('explosionAnimation', [
            state('gathered', style({
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%) scale(0)',
                opacity: 0
            })),
            // Empty style: releases Angular's grip on left/top/opacity after the burst
            // so [ngStyle] can drive the floating phase freely without interference.
            state('exploded', style({})),
            transition('gathered => exploded', [
                animate('2s cubic-bezier(0.4, 0, 0.2, 1)', keyframes([
                    style({
                        left: '50%',
                        top: '50%',
                        transform: 'translate(-50%, -50%) scale(0)',
                        opacity: 0,
                        offset: 0
                    }),
                    style({
                        left: '50%',
                        top: '50%',
                        transform: 'translate(-50%, -50%) scale(1.5)',
                        opacity: 0.5,
                        offset: 0.3
                    }),
                    style({
                        left: '{{finalX}}%',
                        top: '{{finalY}}%',
                        transform: 'translate(-50%, -50%) scale(1) rotate({{rotation}}deg)',
                        opacity: '{{opacity}}',
                        offset: 1
                    })
                ]))
            ])
        ]),
        trigger('overlayAnimation', [
            transition(':leave', [
                animate('0.6s ease-out', style({ opacity: 0, visibility: 'hidden' }))
            ])
        ]),
        trigger('mainContentAnimation', [
            state('hidden', style({
                opacity: 0,
                transform: 'translateY(20px)'
            })),
            state('visible', style({
                opacity: 1,
                transform: 'translateY(0)'
            })),
            transition('hidden => visible', [
                animate('0.8s cubic-bezier(0.4, 0, 0.2, 1)')
            ])
        ])
    ],
    standalone: false
})

export class AppComponent implements OnInit {
  private themeService = inject(ThemeService);
  private ngZone = inject(NgZone);
  private router = inject(Router);
  private loadingService = inject(LoadingService);
  private destroyRef = inject(DestroyRef);

  get isDarkTheme(): boolean { return this.themeService.isDarkTheme(); }
  floatingLetters: FloatingLetter[] = [];
  private animationFrame: number | null = null;
  hasExploded = false;
  isLoadingComplete = false;
  isLoading = false;
  isSpinner = false;
  loadingText = '';

  private readonly HEADER_MARGIN = 5;
  private readonly FOOTER_MARGIN = 5;
  private readonly LETTER_SIZE = 30;

  constructor() {
    this.destroyRef.onDestroy(() => {
      if (this.animationFrame) {
        cancelAnimationFrame(this.animationFrame);
      }
    });

    const name = "AKHIGBE IRUOBE";
    this.floatingLetters = Array.from(name).map((char, i) => ({
      char,
      x: 50,
      y: 50,
      speed: 0.05 + Math.random() * 0.05,
      opacity: 0.18 + Math.random() * 0.1,
      size: 3.5 + Math.random() * 1.5,
      direction: Math.random() > 0.5 ? 1 : -1,
      rotation: Math.random() * (1080 - 720) + 720,
      rotationVelocity: (Math.random() - 0.5) * 4,
      velocityX: 0,
      velocityY: 0,
      rotationDirection: Math.random() > 0.5 ? 1 : -1,
      isExploded: false,
      isVisible: false
    }));

    this.router.events.pipe(takeUntilDestroyed()).subscribe((event: RouterEvent) => {
      if (event instanceof NavigationStart) {
        this.isLoading = true;
      }
      if (event instanceof NavigationEnd) {
        this.isLoading = false;
      }
    });

    this.loadingService.loading$.pipe(takeUntilDestroyed()).subscribe(
      isLoading => this.isSpinner = isLoading
    );
    this.loadingService.loadingText$.pipe(takeUntilDestroyed()).subscribe(
      text => this.loadingText = text
    );
  }

  ngOnInit() {
    this.startLoadingSequence();
  }

  // Track by function to improve performance
  trackByFn(index: number, letter: FloatingLetter): string {
    return letter.char;
  }

  private async startLoadingSequence() {
    // 1. Show welcome message
    await new Promise(resolve => setTimeout(resolve, 800));

    // 2. Make letters visible but not exploded
    this.floatingLetters = this.floatingLetters.map(letter => ({
      ...letter,
      isVisible: true,
      x: 50,
      y: 50,
      isExploded: false,
      opacity: 0,
      velocityX: 0,
      velocityY: 0
    }));

    // 3. Wait for letters to gather
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 4. Trigger explosion
    this.hasExploded = true;

    // 5. Calculate explosion positions and execute
    this.explodeLetters();

    // 6. Wait for explosion animation
    await new Promise(resolve => setTimeout(resolve, 700));

    // 7. Start floating animation
    this.startFloatingAnimation();

    // 8. Wait a bit before showing content
    await new Promise(resolve => setTimeout(resolve, 1));

    // 9. Complete loading
    this.isLoadingComplete = true;

    // 🆕 NEW STEP: Ensure letters remain visible and continue floating
    this.floatingLetters = this.floatingLetters.map(letter => ({
      ...letter,
      isVisible: true,  // Explicitly set to true
      opacity: 0.18 + Math.random() * 0.1  // Restore original opacity range
    }));
  }

  private explodeLetters() {
    const positions = [
      { x: 12, y: 15 },  // A - top left area
      { x: 85, y: 25 },  // K - top right area
      { x: 35, y: 8 },   // H - top middle area
      { x: 72, y: 45 },  // I - right middle area
      { x: 15, y: 65 },  // G - bottom left area
      { x: 45, y: 82 },  // B - bottom middle area
      { x: 88, y: 78 },  // E - bottom right area
      { x: 25, y: 35 },  // space - middle left area
      { x: 65, y: 15 },  // I - top right middle area
      { x: 8, y: 85 },   // R - bottom left corner
      { x: 92, y: 45 },  // U - right edge middle
      { x: 48, y: 28 },  // O - center top area
      { x: 28, y: 92 },  // B - bottom area
      { x: 78, y: 88 },  // E - bottom right corner
      { x: 52, y: 62 }   // extra position for safety
    ];
  
    this.floatingLetters = this.floatingLetters.map((letter, i) => {
      const targetPos = positions[i];
      const angleToTarget = Math.atan2(targetPos.y - 50, targetPos.x - 50);
      const speed = 2 + Math.random();
      
      return {
        ...letter,
        x: targetPos.x,
        y: targetPos.y,
        velocityX: Math.cos(angleToTarget) * speed,
        velocityY: Math.sin(angleToTarget) * speed,
        rotation: Math.random() * 720 - 360,
        rotationVelocity: (Math.random() - 0.5) * 4,
        isExploded: true
      };
    });
  }

  private startFloatingAnimation() {
    // Use a mutable working array outside Angular to avoid per-frame object churn.
    // CD is only triggered every ~6 frames (~10fps visual update) to stay light.
    // Restore opacity here — the explosion init set it to 0 and style({}) releases
    // Angular's animation hold, so [ngStyle] would otherwise render opacity: 0.
    const letters = this.floatingLetters.map(l => ({
      ...l,
      opacity: 0.18 + Math.random() * 0.1
    }));
    let cdFrame = 0;

    this.ngZone.runOutsideAngular(() => {
      const animate = () => {
        for (let i = 0; i < letters.length; i++) {
          const letter = letters[i];
          let { x, y, velocityX, velocityY, rotation, rotationVelocity } = letter;

          x += velocityX * 0.05;
          y += velocityY * 0.05;

          if (x <= this.HEADER_MARGIN) {
            x = this.HEADER_MARGIN;
            velocityX = Math.abs(velocityX) * 0.8;
          } else if (x >= (100 - this.HEADER_MARGIN)) {
            x = 100 - this.HEADER_MARGIN;
            velocityX = -Math.abs(velocityX) * 0.8;
          }

          if (y <= this.HEADER_MARGIN) {
            y = this.HEADER_MARGIN;
            velocityY = Math.abs(velocityY) * 0.8;
          } else if (y >= (100 - this.FOOTER_MARGIN)) {
            y = 100 - this.FOOTER_MARGIN;
            velocityY = -Math.abs(velocityY) * 0.8;
          }

          velocityX *= 0.999;
          velocityY *= 0.999;

          if (Math.random() < 0.1) {
            const randomForce = 0.01;
            velocityX += (Math.random() - 0.5) * randomForce;
            velocityY += (Math.random() - 0.5) * randomForce;
          }

          const minVelocity = 0.1;
          const maxVelocity = 0.5;
          if (Math.abs(velocityX) < minVelocity) velocityX = minVelocity * (velocityX < 0 ? -1 : 1);
          else if (Math.abs(velocityX) > maxVelocity) velocityX = maxVelocity * (velocityX < 0 ? -1 : 1);
          if (Math.abs(velocityY) < minVelocity) velocityY = minVelocity * (velocityY < 0 ? -1 : 1);
          else if (Math.abs(velocityY) > maxVelocity) velocityY = maxVelocity * (velocityY < 0 ? -1 : 1);

          rotation += rotationVelocity * 0.1;
          rotationVelocity *= 0.995;

          letter.x = x; letter.y = y;
          letter.velocityX = velocityX; letter.velocityY = velocityY;
          letter.rotation = rotation; letter.rotationVelocity = rotationVelocity;
        }

        // Only push to Angular's CD every 6 frames — visually smooth, CPU-light.
        if (++cdFrame % 6 === 0) {
          this.ngZone.run(() => {
            this.floatingLetters = letters.map(l => ({ ...l }));
          });
        }

        this.animationFrame = requestAnimationFrame(animate);
      };

      this.animationFrame = requestAnimationFrame(animate);
    });
  }

  getLetterTransform(letter: FloatingLetter): string {
    const rotationDir = letter.rotationDirection || 1;
    return `
      translate(-50%, -50%)
      rotate(${letter.rotation * rotationDir}deg)
      scale(${letter.isExploded ? 1 : 0.8})
    `;
  }

}
