import { Component, HostListener, OnInit } from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { Router } from '@angular/router';
import { SeoService } from 'src/app/core/services/seo.service';
import { ProjectDataService } from 'src/app/core/services/project-data.service';
import { AnalyticsService } from 'src/app/core/services/analytics.service';

interface Project {
  id: number;
  title: string;
  description: string;
  techStack: { name: string; color: string; }[];
  achievements: string[];
  isHovered?: boolean;
  images?: any;
  stats?: { value: string; label: string; }[];
  pipeline?: { name: string; meta: string; }[];
  pipelineLabel?: string;
}

@Component({
    selector: 'app-projects',
    templateUrl: './projects.component.html',
    styleUrls: ['./projects.component.css'],
    animations: [
        trigger('fadeIn', [
            transition(':enter', [
                style({ opacity: 0, transform: 'translateY(20px)' }),
                animate('0.6s ease', style({ opacity: 1, transform: 'translateY(0)' })),
            ]),
        ]),
        trigger('cardHover', [
            state('rest', style({
                transform: 'translateY(0)',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            })),
            state('hover', style({
                transform: 'translateY(-5px)',
                boxShadow: '0 12px 24px rgba(0, 0, 0, 0.15)'
            })),
            transition('rest <=> hover', animate('0.3s ease')),
        ]),
        trigger('scrollTextAnimation', [
            state('normal', style({
                opacity: 0.8,
                transform: 'translateY(0)'
            })),
            state('hidden', style({
                opacity: 0,
                transform: 'translateY(-20px)'
            })),
            transition('normal <=> hidden', [
                animate('1s ease-in-out')
            ])
        ])
    ],
    host: {
        '(mousemove)': 'onMouseMove($event)'
    },
    standalone: false
})

export class ProjectsComponent implements OnInit {
  scrollState = 'normal';
  readonly githubUrl = 'https://github.com/ayomideesam';

  aboutText = {
    para1: 'I build the software that banks use to run their most critical operations — credit approval workflows, real-time fraud detection, and trade finance platforms that regulators audit.',
    para2: 'Every project here was delivered inside a CBN-regulated environment: strict security requirements, multi-role access control, audit trail compliance, and zero tolerance for UI bugs on live financial data.',
    para3: 'My constraint is always the same: build it fast enough for a deadline, and robust enough for 100,000+ daily users. That tension is what I\'ve been solving across 9 years and six enterprise applications.',
    para4: 'If you\'re hiring a frontend engineer who delivers under compliance pressure and leads a team while doing it — these are the receipts.'
  };

  projects: Project[] = []

  @HostListener('window:scroll', [])
  onWindowScroll() {
    const scrollPosition = window.pageYOffset;
    if (scrollPosition > 100) {
      this.scrollState = 'hidden';
    } else {
      this.scrollState = 'normal';
    }
  }

  onMouseMove(event: MouseEvent) {
    const cards = document.querySelectorAll('.project-card');
    cards.forEach(card => {
      const rect = (card as HTMLElement).getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 100;
      const y = ((event.clientY - rect.top) / rect.height) * 100;
      (card as HTMLElement).style.setProperty('--x', `${x}%`);
      (card as HTMLElement).style.setProperty('--y', `${y}%`);
    });
  }

  constructor(
    private router: Router,
    private seoService: SeoService,
    private projectData: ProjectDataService,
    private analytics: AnalyticsService
  ) {
    this.projects = this.projectData.getProjects()
  }

  ngOnInit() {
    // Add any initialization logic
    this.initScrollReveal();
    this.initCircleAnimations();

    this.scrollToTop();
    if (this.projects.length > 0) {
      this.seoService.setProjectSeo(this.projects[0]);
    }
  }

  scrollToTop() {
    if (history.state.scrollToProject) {
      const fragment = this.router.url.split('#')[1];
      if (fragment) {
        setTimeout(() => {
          const element = document.getElementById(fragment);
          if (element) {
            const headerHeight = 100; // Adjust based on your header height
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerHeight;

            window.scrollTo({
              top: offsetPosition,
              behavior: 'smooth'
            });
          }
        }, 100);
      }
    }
  }

  getPipelineSubtitle(pipeline: { name: string; meta: string; }[] | undefined): string {
    if (!pipeline || pipeline.length === 0) return '';
    return `${pipeline[0].name} → ${pipeline[pipeline.length - 1].name}`;
  }

  onImageHover(element: EventTarget | null) {
    if (element instanceof HTMLImageElement) {
      element.style.transform = 'scale(1.1)';
      element.style.transition = 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
    }
  }

  onImageLeave(element: EventTarget | null) {
    if (element instanceof HTMLImageElement) {
      element.style.transform = 'scale(1)';
    }
  }

  private initScrollReveal() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px'
      }
    );

    document.querySelectorAll('.reveal-on-scroll').forEach(
      el => observer.observe(el)
    );
  }

  viewProject(id: string) {
    this.analytics.trackProjectView(id);
  }

  private initCircleAnimations() {
    const circles = document.querySelectorAll('.circle');
    circles.forEach((circle, index) => {
      if (circle instanceof HTMLElement) {
        // Add random starting positions and delays
        circle.style.animationDelay = `${index * -2}s`;

        // Add subtle pulse animation
        setInterval(() => {
          circle.style.transform = 'scale(1.1)';
          setTimeout(() => {
            circle.style.transform = 'scale(1)';
          }, 200);
        }, 3000 + (index * 1000));
      }
    });
  }


}