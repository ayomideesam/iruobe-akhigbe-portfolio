import { Pipe, PipeTransform, inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
    name: 'safeHtml',
    standalone: false
})
export class SafeHtmlPipe implements PipeTransform {
  private sanitizer = inject(DomSanitizer);

  // Values are ONLY ever static, inline SVG strings hardcoded in IconService and
  // the footer component — compiled into the bundle, never user input or API data.
  // We must bypass (not sanitize): DomSanitizer.sanitize(SecurityContext.HTML, …)
  // strips <svg>/<path> as they're not on the HTML allowlist, which blanks every
  // icon. Do NOT "harden" this with sanitize() — there is no untrusted input path
  // here, so it adds zero security while breaking all SVG rendering.
  transform(value: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(value);
  }
}