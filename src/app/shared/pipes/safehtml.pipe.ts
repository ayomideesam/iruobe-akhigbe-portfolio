import { Pipe, PipeTransform, SecurityContext, inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
    name: 'safeHtml',
    standalone: false
})
export class SafeHtmlPipe implements PipeTransform {
  private sanitizer = inject(DomSanitizer);

  // Sanitize HTML input (defense-in-depth), then bypass for trusted SVG sources (IconService).
  // This ensures even if the source is compromised, injected scripts are stripped.
  transform(value: string): SafeHtml {
    const sanitized = this.sanitizer.sanitize(SecurityContext.HTML, value) || '';
    return this.sanitizer.bypassSecurityTrustHtml(sanitized);
  }
}