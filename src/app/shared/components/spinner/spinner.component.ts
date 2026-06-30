import { Component, Input, OnInit } from '@angular/core';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
    selector: 'app-spinner',
    template: `
      <div class="spinner-overlay" [class.active]="isLoading">
         <div class="spinner"></div>
         <div class="spinner-text" *ngIf="isLoading" [@fadeInOut]>
            {{displayText}}
            <span class="dots">
               <span class="dot">.</span>
               <span class="dot">.</span>
               <span class="dot">.</span>
               <span class="dot">.</span>
            </span>
         </div>
      </div>
  `,
    styles: [`
      .spinner-overlay {
         position: fixed;
         inset: 0;
         background: rgba(0, 0, 0, 0.7);
         display: flex;
         flex-direction: column;
         align-items: center;
         justify-content: center;
         z-index: 9999;
         opacity: 0;
         visibility: hidden;
         transition: opacity 0.3s;
         backdrop-filter: blur(3px);
      }

      .spinner-overlay.active {
         opacity: 1;
         visibility: visible;
      }

      .spinner {
         width: 50px;
         height: 50px;
         border: 4px solid var(--primary-color, #4f46e5);
         border-top: 4px solid transparent;
         border-radius: 50%;
         animation: spin 1s linear infinite;
      }

      .spinner-text {
         color: white;
         margin-top: 1rem;
         font-size: 1rem;
         display: flex;
         align-items: center;
      }

      .dots {
         display: inline-flex;
         margin-left: 2px;
      }

      .dot {
         opacity: 0;
         animation: fade 1.5s infinite;
      }

      .dot:nth-child(1) { animation-delay: 0s; }
      .dot:nth-child(2) { animation-delay: 0.375s; }
      .dot:nth-child(3) { animation-delay: 0.75s; }
      .dot:nth-child(4) { animation-delay: 1.125s; }
      
      @keyframes spin {
         0% { transform: rotate(0deg); }
         100% { transform: rotate(360deg); }
      }

      @keyframes fade {
         0%, 100% { opacity: 0; }
         50% { opacity: 1; }
      }
  `],
    animations: [
        trigger('fadeInOut', [
            transition(':enter', [
                style({ opacity: 0, transform: 'translateY(10px)' }),
                animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
            ]),
            transition(':leave', [
                animate('300ms ease-in', style({ opacity: 0, transform: 'translateY(-10px)' }))
            ])
        ])
    ],
    standalone: false
})

export class SpinnerComponent implements OnInit {
   @Input() isLoading = false;
   @Input() text?: string;
   displayText = 'Loading';

   ngOnInit() {
      this.displayText = this.text || 'Loading';
   }

   ngOnChanges() {
      this.displayText = this.text || 'Loading';
   }
}