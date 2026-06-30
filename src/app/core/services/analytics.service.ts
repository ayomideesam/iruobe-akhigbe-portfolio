import { Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

declare var gtag : any;

@Injectable({providedIn: 'root'})

export class AnalyticsService {

  constructor(private router: Router) {
    // Track route changes
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event) => {
      gtag('event', 'page_view', {
        page_path: event.urlAfterRedirects
      });
    });
  }

  trackEvent(category: string, action: string, label?: string, value?: number) {
    gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value
    });
  }

  // Track specific interactions
  trackProjectView(projectId: string) {
    this.trackEvent('Projects', 'View', projectId);
  }

  trackDownload(fileType: string) {
    this.trackEvent('Downloads', 'Download', fileType);
  }
}