import { Component, OnInit, AfterViewInit, ElementRef, HostListener, inject, DestroyRef } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AnalyticsService } from 'src/app/core/services/analytics.service';
import { LoadingService } from 'src/app/core/services/loading.service';
import { PdfService } from 'src/app/core/services/pdf.service';
import { AtsPdfService } from 'src/app/core/services/ats-pdf.service';
import { ResumeDataService } from 'src/app/core/services/resume-data.service';
import { SeoService } from 'src/app/core/services/seo.service';
import { ThemeService } from 'src/app/core/services/theme.service';

interface Skill {
  name: string;
  level: number;
}

interface Job {
  company: string;
  role: string;
  period: string;
  location: string;
  description?: string;
  achievements?: string[];
  technicalAchievements?: string[];
  technicalLeadership?: string[];
}

interface Course {
  title: string;
  institution: string;
  period: string;
}

interface Reference {
  name: string;
  company: string;
  email: string;
  phone: string;
}

@Component({
    selector: 'app-resume',
    templateUrl: './resume.component.html',
    styleUrls: ['./resume.component.css'],
    standalone: false
})

export class ResumeComponent implements OnInit, AfterViewInit {
  private elementRef = inject(ElementRef);
  private router = inject(Router);
  private themeService = inject(ThemeService);
  private loadingService = inject(LoadingService);
  private resumeData = inject(ResumeDataService);
  private seoService = inject(SeoService);
  private pdfService = inject(PdfService);
  private atsPdfService = inject(AtsPdfService);
  private analytics = inject(AnalyticsService);

  get isDarkTheme(): boolean { return this.themeService.isDarkTheme(); }
  isGeneratingPDF = false;
  isInView = false;

  skills: Skill[] = [];
  employmentHistory: Job[] = [];
  courses: Course[] = [];
  references: Reference[] = [];
  keyTechnicalAchievements: string[] = [];
  private isPreparingForPdf = false;

  constructor() {
    this.initializeResumeData();
    this.router.events.pipe(
      takeUntilDestroyed(),
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => this.scrollToTop());
    this.seoService.setResumeSeo();
  }

  private initializeResumeData(): void {
    this.skills = this.resumeData.getSkills();
    this.employmentHistory = this.resumeData.getEmploymentHistory();
    this.courses = this.resumeData.getCourses();
    this.references = this.resumeData.getReferences();
    this.keyTechnicalAchievements = this.resumeData.getKeyTechnicalAchievements();
  }

  ngOnInit() {
    this.initScrollObserver();
  }

  ngAfterViewInit() {
    // Ensure scroll to top after view initialization
    // setTimeout(() => this.scrollToTop(), 100);
    this.scrollToTop();
    this.initAchievementAnimations();
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

  initAchievementAnimations(): void {
    // Skip animation setup if we're preparing for PDF
    if (this.isPreparingForPdf) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, index) => {
          if (entry.isIntersecting) {
            // Only apply staggered animation if not preparing for PDF
            if (!this.isPreparingForPdf) {
              setTimeout(() => {
                entry.target.classList.add('achievement-visible');
              }, index * 100);
            } else {
              // Immediately add class if preparing for PDF
              entry.target.classList.add('achievement-visible');
            }

            this.trackAchievementInteraction(index, 'viewed');
          }
        });
      },
      {
        threshold: 0.2,
        rootMargin: '50px'
      }
    );

    // Observe all achievement items after view initialization
    setTimeout(() => {
      const achievementItems = this.elementRef.nativeElement.querySelectorAll('.achievement-item');
      achievementItems.forEach((item: Element) => observer.observe(item));
    }, 100);
  }

  private initScrollObserver() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.isInView = true;
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1
      }
    );

    const skillBars = this.elementRef.nativeElement.querySelectorAll('.skill-progress');
    skillBars.forEach((bar: any) => observer.observe(bar));
  }

  @HostListener('window:scroll', ['$event'])
  onScroll() {
    const skillBars = this.elementRef.nativeElement.querySelectorAll('.skill-progress');
    skillBars.forEach((bar: any) => {
      const rect = bar.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        bar.classList.add('animated');
      }
    });
  }

  formatAchievement(achievement: string): string {
    const colonIndex = achievement.indexOf(':');

    if (colonIndex !== -1) {
      const title = achievement.substring(0, colonIndex).trim();
      const description = achievement.substring(colonIndex + 1).trim();

      const emojiMatch = title.match(/^([\u{1F300}-\u{1F9FF}][\u{200D}\u{FE0F}]*)\s*/u);
      const emoji = emojiMatch ? emojiMatch[1] : '';
      const titleText = emoji ? title.replace(emojiMatch![0], '').trim() : title;

      // Add PDF-specific attributes for easier targeting
      return `
        <div class="achievement-title" 
             role="heading" 
             aria-level="4"
             data-pdf-element="title">
          ${emoji ? `<span class="achievement-emoji" 
                            aria-hidden="true"
                            data-pdf-element="emoji">${emoji}</span>` : ''}
          <span class="achievement-title-text" 
                data-pdf-element="title-text">${titleText}</span>
        </div>
        <div class="achievement-description" 
             role="text"
             data-pdf-element="description">
          ${description}
        </div>
      `;
    }

    return `<div class="achievement-description"
                 role="text"
                 data-pdf-element="fallback">${achievement}</div>`;
  }

  // Computes a human-readable tenure (e.g. "3 yrs 9 mos") from a period like "Jun 2018 — Feb 2022"
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

    const parts = period.split('—');
    if (parts.length < 2) return '';

    const start = parse(parts[0]);
    const end = parse(parts[1]);
    if (!start || !end) return '';

    // Inclusive of both the start and end month (matches LinkedIn-style durations)
    let totalMonths = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth()) + 1;
    if (totalMonths < 1) totalMonths = 1;

    const years = Math.floor(totalMonths / 12);
    const remMonths = totalMonths % 12;
    const yearLabel = years > 0 ? `${years} yr${years > 1 ? 's' : ''}` : '';
    const monthLabel = remMonths > 0 ? `${remMonths} mo${remMonths > 1 ? 's' : ''}` : '';

    return [yearLabel, monthLabel].filter(Boolean).join(' ') || '1 mo';
  }

  // For the most-recent role of a company that has multiple (promotion) roles,
  // returns the combined tenure across those consecutive roles. Empty otherwise.
  getCompanyTenure(index: number): string {
    const job = this.employmentHistory[index];
    if (!job) return '';

    // Only annotate the head (most recent) role of a company group
    const previous = this.employmentHistory[index - 1];
    if (previous && previous.company === job.company) return '';

    // Walk forward collecting consecutive roles at the same company
    const group: Job[] = [job];
    for (let i = index + 1; i < this.employmentHistory.length; i++) {
      if (this.employmentHistory[i].company === job.company) {
        group.push(this.employmentHistory[i]);
      } else {
        break;
      }
    }
    if (group.length < 2) return '';

    const earliestStart = group[group.length - 1].period.split('—')[0];
    const latestEnd = group[0].period.split('—')[1];
    return this.getTenure(`${earliestStart}—${latestEnd}`);
  }

  trackAchievementInteraction(index: number, interactionType: string): void {
    this.analytics.trackEvent('Resume', 'Achievement_Interaction', `${interactionType}_${index}`);
  }

  trackAchievementView(index: number): void {
    this.analytics.trackEvent('Resume', 'Achievement_Viewed', `Achievement_${index}`);
  }

  async downloadPDF(): Promise<void> {
    try {
      this.loadingService.show('Generating PDF');
      this.isPreparingForPdf = true;

      const downloadSection = document.querySelector('.references-section .download-pdf');
      if (downloadSection) {
        downloadSection.classList.add('hidden');
      }

      const content = document.getElementById('resume-content');
      if (!content) return;

      // CRITICAL: Prepare animations for PDF generation
      await this.prepareAnimationsForPdf();

      const fileName = this.isDarkTheme ?
        'AkhigbeIruobe-Resume-Dark.pdf' :
        'AkhigbeIruobe-Resume-Light.pdf';

      this.analytics.trackEvent('Resume', 'Download', 'PDF_Image_Based');

      await this.pdfService.generatePDF({
        content,
        isDarkTheme: this.isDarkTheme,
        fileName
      });

    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      this.isPreparingForPdf = false;
      this.loadingService.hide();

      // Restore animations for normal viewing
      this.restoreAnimationsAfterPdf();

      const downloadSection = document.querySelector('.references-section .download-pdf');
      if (downloadSection) {
        downloadSection.classList.remove('hidden');
      }
    }
  }

  async downloadATSFriendlyPDF(): Promise<void> {
    try {
      this.loadingService.show('Generating ATS-Friendly PDF');

      const stripEmoji = (text: string): string =>
        text.replace(/[\u{1F000}-\u{1FFFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F300}-\u{1F9FF}]/gu, '').replace(/\*\*/g, '').trim();

      const resumeData = {
        name: 'AKHIGBE IRUOBE',
        title: 'SENIOR FRONTEND ENGINEER',
        phone: '+2347038772342',
        email: 'Iruobeakhigbe@gmail.com',
        linkedin: 'IRUOBE AKHIGBE',
        portfolio: 'iruobeakhigbe.netlify.app',
        profile: [
          'Senior Angular Engineer and Frontend Technical Lead with 9+ years of experience architecting scalable web applications and leading high-performing development teams. Proven track record of leading 6+ engineers at Zenith Bank and Globus Bank, driving architectural decisions across cross-functional teams, and delivering enterprise-grade solutions serving 100,000+ users.',
          'Expert in Angular 17+/20, TypeScript, and modern frontend architecture patterns including standalone components, signals, micro-frontends, and server-side rendering. Demonstrated success in establishing CI/CD pipelines, implementing secure coding practices, and mentoring teams to achieve 40% faster delivery cycles.',
          'Led architectural review meetings with designers, engineers, QA, product officers, and business managers, ensuring technical solutions align with business objectives. Specialized in fraud detection systems, credit approval platforms, trade finance applications, and AI-powered productivity platforms.',
          'Results-oriented engineer passionate about leveraging cutting-edge technologies to deliver measurable business value. Equally comfortable owning hands-on delivery as mentoring peers, with a proven ability to transform technical challenges into strategic advantages.'
        ],
        keyAchievements: this.keyTechnicalAchievements.map(stripEmoji),
        skills: this.skills,
        employment: this.employmentHistory,
        education: {
          degree: 'Bachelors of Science',
          institution: 'Babcock University, Ogun State, Nigeria - B.Sc Information Resource Management',
          period: 'Sep 2011 — Jul 2016',
          grade: 'Grade B or 2:1 [Second Class-Upper Division]'
        },
        certifications: this.courses,
        hobbies: ['Coding', 'Software Testing', 'Board Games', 'Swimming', 'Reading', 'Console Games'],
        languages: ['English', 'Yoruba', 'Hausa'],
        references: this.references
      };

      this.analytics.trackEvent('Resume', 'Download', 'PDF_ATS_Friendly');

      await this.atsPdfService.generateATSFriendlyPDF(resumeData, this.isDarkTheme);

    } catch (error) {
      console.error('Error generating ATS-friendly PDF:', error);
    } finally {
      this.loadingService.hide();
    }
  }

  private async prepareAnimationsForPdf(): Promise<void> {
    // Force all achievement items to their final visible state
    const achievementItems = this.elementRef.nativeElement.querySelectorAll('.achievement-item');

    // Add a temporary class that overrides animation states for PDF
    achievementItems.forEach((item: Element, index: number) => {
      // Immediately add the visible class without delay
      item.classList.add('achievement-visible');

      // Add a PDF-specific class for styling overrides
      item.classList.add('pdf-ready');

      // Ensure the item is fully visible for PDF capture
      (item as HTMLElement).style.opacity = '1';
      (item as HTMLElement).style.transform = 'translateY(0)';
      (item as HTMLElement).style.visibility = 'visible';
    });

    // Also prepare the main achievements section
    const achievementsSection = this.elementRef.nativeElement.querySelector('.key-achievements-section');
    if (achievementsSection) {
      achievementsSection.classList.add('pdf-ready');
    }

    // Force a layout reflow to ensure all changes are applied
    void this.elementRef.nativeElement.offsetHeight;

    // Wait for any pending animations to complete
    await new Promise(resolve => setTimeout(resolve, 100));

    // Disable any ongoing intersection observers during PDF generation
    this.pauseIntersectionObservers();

    console.log('Animations prepared for PDF generation');
  }

  // Method to restore normal animation behavior after PDF generation
  private restoreAnimationsAfterPdf(): void {
    const achievementItems = this.elementRef.nativeElement.querySelectorAll('.achievement-item');

    achievementItems.forEach((item: Element) => {
      // Remove PDF-specific overrides
      item.classList.remove('pdf-ready');

      // Clear inline styles that were set for PDF
      (item as HTMLElement).style.opacity = '';
      (item as HTMLElement).style.transform = '';
      (item as HTMLElement).style.visibility = '';
    });

    const achievementsSection = this.elementRef.nativeElement.querySelector('.key-achievements-section');
    if (achievementsSection) {
      achievementsSection.classList.remove('pdf-ready');
    }

    // Re-enable intersection observers
    this.resumeIntersectionObservers();

    console.log('Animations restored for normal viewing');
  }

  // Method to temporarily disable intersection observers during PDF generation
  private pauseIntersectionObservers(): void {
    // Store reference to current observers if needed
    // For now, we'll just ensure all items are visible
    const achievementItems = this.elementRef.nativeElement.querySelectorAll('.achievement-item');
    achievementItems.forEach((item: Element) => {
      item.classList.add('achievement-visible');
    });
  }

  // Method to re-enable intersection observers after PDF generation
  private resumeIntersectionObservers(): void {
    // If you need to restart observers, you can do so here
    // For now, we'll leave the items in their visible state
    console.log('Intersection observers resumed');
  }
}