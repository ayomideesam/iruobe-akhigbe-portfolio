// contact.component.ts
import { Component, ElementRef, OnInit, ViewChild, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { trigger, state, style, animate, transition, query } from '@angular/animations';
import { IconService } from 'src/app/core/services/icon.service';
import emailjs, { type EmailJSResponseStatus } from '@emailjs/browser';
import { AnalyticsService } from 'src/app/core/services/analytics.service';

interface ContactMethod {
  icon: string;
  title: string;
  description: string;
  action: string;
  link: string;
  colorClass?: string;
  isHovered?: boolean;
}

@Component({
    selector: 'app-contact',
    templateUrl: './contact.component.html',
    styleUrls: ['./contact.component.css'],
    animations: [
        trigger('fadeInUp', [
            transition(':enter', [
                style({ transform: 'translateY(20px)', opacity: 0 }),
                animate('0.6s cubic-bezier(0.35, 0, 0.25, 1)', style({ transform: 'translateY(0)', opacity: 1 }))
            ])
        ]),
        trigger('methodHover', [
            state('rest', style({
                transform: 'translateY(0)',
                backgroundColor: 'var(--card-bg)'
            })),
            state('hovered', style({
                transform: 'translateY(-5px)',
                backgroundColor: 'var(--card-bg-hover)'
            })),
            transition('rest <=> hovered', animate('0.3s ease'))
        ]),
        trigger('formAnimation', [
            transition(':enter', [
                style({ transform: 'scale(0.95)', opacity: 0 }),
                animate('0.5s cubic-bezier(0.4, 0, 0.2, 1)', style({ transform: 'scale(1)', opacity: 1 }))
            ])
        ]),
        trigger('inputFocus', [
            state('unfocused', style({
                transform: 'scale(1)',
                boxShadow: 'none'
            })),
            state('focused', style({
                transform: 'scale(1.02)',
                boxShadow: '0 0 0 3px rgba(var(--primary-rgb), 0.15)'
            })),
            transition('unfocused <=> focused', animate('0.2s ease'))
        ]),
        trigger('successMessageSlide', [
            transition(':enter', [
                style({
                    opacity: 0,
                    transform: 'translateY(20px)'
                }),
                animate('0.6s cubic-bezier(0.4, 0, 0.2, 1)', style({
                    opacity: 1,
                    transform: 'translateY(0)'
                })),
                query('.success-icon', [
                    style({ transform: 'scale(0)' }),
                    animate('0.5s 0.3s cubic-bezier(0.4, 0, 0.2, 1)', style({
                        transform: 'scale(1)'
                    }))
                ])
            ])
        ]),
        trigger('errorMessageSlide', [
            transition(':enter', [
                style({
                    opacity: 0,
                    transform: 'translateY(20px)'
                }),
                animate('0.6s cubic-bezier(0.4, 0, 0.2, 1)', style({
                    opacity: 1,
                    transform: 'translateY(0)'
                })),
                query('.error-icon', [
                    style({ transform: 'scale(0)' }),
                    animate('0.5s 0.3s cubic-bezier(0.4, 0, 0.2, 1)', style({
                        transform: 'scale(1)'
                    }))
                ])
            ])
        ]),
        trigger('checkmarkAnimation', [
            transition(':enter', [
                style({ opacity: 0, transform: 'scale(0.8)' }),
                animate('0.3s ease', style({ opacity: 1, transform: 'scale(1)' }))
            ])
        ]),
        trigger('errorAnimation', [
            transition(':enter', [
                style({ transform: 'scale(0)' }),
                animate('0.5s cubic-bezier(0.4, 0, 0.2, 1)', style({ transform: 'scale(1)' })),
                query('circle', [
                    style({ strokeDasharray: 100, strokeDashoffset: 100 }),
                    animate('0.5s cubic-bezier(0.4, 0, 0.2, 1)', style({ strokeDashoffset: 0 }))
                ])
            ])
        ])
    ],
    host: {
        '(mousemove)': 'onMouseMove($event)'
    },
    standalone: false
})

export class ContactComponent implements OnInit {
  private fb = inject(FormBuilder);
  private iconService = inject(IconService);
  private analytics = inject(AnalyticsService);

  @ViewChild('emailForm') emailForm!: ElementRef;
  contactForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [
      Validators.required,
      Validators.pattern(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
    ]],
    subject: ["Akhigbe Iruobe I'd like to hire you!", Validators.required],
    message: ['', [Validators.required, Validators.minLength(10)]]
  });
  isSubmitting = false;
  submitSuccess = false;
  showErrorMessage = false;
  submittedName = '';

  readonly githubUrl = 'https://github.com/ayomideesam';

  contactMethods: ContactMethod[] = [
    {
      icon: this.iconService.getEmailIcon(),
      title: 'Email',
      description: 'Preferred for role enquiries and introductions. I reply within 24 hours.',
      action: 'iruobeakhigbe@gmail.com',
      link: "mailto:iruobeakhigbe@gmail.com?subject=Senior Frontend Role — Enquiry",
      colorClass: 'method-email'
    },
    {
      icon: this.iconService.getLinkedInIcon(),
      title: 'LinkedIn',
      description: 'View my full work history, 8 recommendations, and project portfolio.',
      action: 'Connect on LinkedIn',
      link: 'https://www.linkedin.com/in/akhigbe-iruobe/',
      colorClass: 'method-linkedin'
    },
    {
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>`,
      title: 'GitHub',
      description: 'Personal projects, open-source contributions, and this portfolio\'s source code.',
      action: 'github.com/ayomideesam',
      link: 'https://github.com/ayomideesam',
      colorClass: 'method-github'
    },
    {
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>`,
      title: 'WhatsApp',
      description: 'Quickest way to reach me directly. Available Mon – Sat, 9am – 6pm WAT.',
      action: '+234 703 877 2342',
      link: 'https://api.whatsapp.com/send/?phone=2347038772342&text&type=phone_number&app_absent=0',
      colorClass: 'method-whatsapp'
    },
    {
      icon: this.iconService.getTwitterIcon(),
      title: 'Twitter / X',
      description: 'Tech updates, Angular tips, and frontend engineering insights.',
      action: 'Follow on X',
      link: 'https://twitter.com/akhigbe_dev',
      colorClass: 'method-twitter'
    }
  ];

  ngOnInit(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  private scrollToMessage(selector: string): void {
    setTimeout(() => {
      const element = document.querySelector(selector);
      element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  }

  onMouseMove(event: MouseEvent) {
    const cards = document.querySelectorAll('.form-section');
    cards.forEach(card => {
      const rect = (card as HTMLElement).getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 100;
      const y = ((event.clientY - rect.top) / rect.height) * 100;
      (card as HTMLElement).style.setProperty('--x', `${x}%`);
      (card as HTMLElement).style.setProperty('--y', `${y}%`);
    });
  }

  // Add scroll behavior after successful submission
  async onSubmit(e: Event): Promise<void> {
    e.preventDefault();
    
    if (this.contactForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      
      try {
        this.submittedName = this.contactForm.get('name')?.value ?? '';
        
        const form = e.target as HTMLFormElement;
        const response = await emailjs.sendForm(
          'service_2n4p82e',
          'template_922sdt7',
          form,
          'whYgOMU_1lsZs9PtH'
        );

        this.analytics.trackEvent('Contact', 'Form Submit', 'Contact Form');

        if (response.status === 200) {
          this.submitSuccess = true;
          this.contactForm.reset();
          this.contactForm.get('subject')?.setValue("Akhigbe Iruobe I'd like to hire you!");
          this.scrollToMessage('.success-background');
          console.log('SUCCESS!');
        }
      } catch (error) {
        console.error('Error:', error);
        this.showErrorMessage = true;
        this.scrollToMessage('.error-background');
        console.log('FAILED...', (error as EmailJSResponseStatus).text);
      } finally {
        this.isSubmitting = false;
      }
    } else {
      this.markFormGroupTouched(this.contactForm);
    }
  }

  viewProject(id: string) {
    this.analytics.trackProjectView(id);
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  closeSuccessMessage() {
    this.submitSuccess = false;
  }

  closeErrorMessage() {
    this.showErrorMessage = false;
  }
}