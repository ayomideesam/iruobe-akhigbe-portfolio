// components/project-card/project-card.component.ts
import { Component, Input, HostListener } from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';

interface TechStack {
  name: string;
  color: string;
}

interface ProjectMetric {
  label: string;
  value: string;
  icon: string;
}

@Component({
    selector: 'app-project-card',
    template: `
    <article 
      class="project-card" 
      [@hover]="isHovered ? 'hovered' : 'rest'"
      (mouseenter)="isHovered = true"
      (mouseleave)="isHovered = false">
      <div class="card-content">
        <div class="project-header">
          <h3 class="project-title">{{ title }}</h3>
          <div class="project-links">
            @if (demoUrl) {
            <a [href]="demoUrl" target="_blank" class="link-button demo">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                <polyline points="15 3 21 3 21 9"></polyline>
                <line x1="10" y1="14" x2="21" y2="3"></line>
              </svg>
              Live Demo
            </a>
            }
          </div>
        </div>

        <p class="project-description">{{ description }}</p>

        <div class="metrics-grid">
          @for (metric of metrics; track metric.label) {
          <div class="metric-item" [@metricAppear]="'in'">
            <div class="metric-icon" [innerHTML]="metric.icon"></div>
            <div class="metric-details">
              <span class="metric-value">{{ metric.value }}</span>
              <span class="metric-label">{{ metric.label }}</span>
            </div>
          </div>
          }
        </div>

        <div class="tech-stack">
          @for (tech of techStack; track tech.name) {
          <span class="tech-badge"
                [style.backgroundColor]="tech.color + '20'"
                [style.color]="tech.color">
            {{ tech.name }}
          </span>
          }
        </div>

        <div class="key-achievements">
          <h4>Key Achievements</h4>
          <ul>
            @for (achievement of achievements; track $index; let i = $index) {
            <li [@achievementAppear]="'in'"
                [style.animation-delay]="i * 100 + 'ms'">
              {{ achievement }}
            </li>
            }
          </ul>
        </div>
      </div>

      <div class="card-backdrop" [@backdropAnimation]="isHovered ? 'hovered' : 'rest'"></div>
    </article>
  `,
    styleUrls: ['./project-card.component.css'],
    animations: [
        trigger('hover', [
            state('rest', style({
                transform: 'translateY(0)',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            })),
            state('hovered', style({
                transform: 'translateY(-5px)',
                boxShadow: '0 12px 24px rgba(0,0,0,0.15)'
            })),
            transition('rest <=> hovered', animate('300ms cubic-bezier(0.4, 0, 0.2, 1)'))
        ]),
        trigger('backdropAnimation', [
            state('rest', style({ opacity: 0 })),
            state('hovered', style({ opacity: 1 })),
            transition('rest <=> hovered', animate('300ms ease'))
        ]),
        trigger('metricAppear', [
            transition(':enter', [
                style({ opacity: 0, transform: 'translateY(20px)' }),
                animate('500ms cubic-bezier(0.4, 0, 0.2, 1)', style({ opacity: 1, transform: 'translateY(0)' }))
            ])
        ]),
        trigger('achievementAppear', [
            transition(':enter', [
                style({ opacity: 0, transform: 'translateX(-20px)' }),
                animate('500ms cubic-bezier(0.4, 0, 0.2, 1)', style({ opacity: 1, transform: 'translateX(0)' }))
            ])
        ])
    ],
    standalone: false
})
export class ProjectCardComponent {
  @Input() title!: string;
  @Input() description!: string;
  @Input() demoUrl?: string;
  @Input() techStack: TechStack[] = [];
  @Input() metrics: ProjectMetric[] = [];
  @Input() achievements: string[] = [];

  isHovered = false;

  @HostListener('mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    (event.target as HTMLElement).style.setProperty('--mouse-x', `${x}px`);
    (event.target as HTMLElement).style.setProperty('--mouse-y', `${y}px`);
  }
}