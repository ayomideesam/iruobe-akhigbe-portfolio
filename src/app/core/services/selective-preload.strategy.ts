import { Injectable } from '@angular/core';
import { PreloadingStrategy, Route } from '@angular/router';
import { Observable, of, timer } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

/**
 * Preloads only the routes a visitor is actually likely to open next, and only
 * once the current page has settled.
 *
 * Replaces `PreloadAllModules`, which downloaded every lazy chunk on every visit.
 * On /services that meant pulling ~1.6 MB of chunks for routes the visitor was
 * not on — including the resume route's PDF toolchain (jspdf, html2canvas,
 * canvg ≈ 770 KB raw) that only matters if someone clicks "Download PDF".
 *
 * Routes opt in with `data: { preload: true }`. Anything heavy and rarely used
 * stays genuinely lazy and loads on navigation instead.
 *
 * The delay matters as much as the selection: preloading immediately competes
 * with the current route's own rendering for bandwidth and main-thread time,
 * which is what made the first paint slow on a throttled connection.
 */
@Injectable({ providedIn: 'root' })
export class SelectivePreloadStrategy implements PreloadingStrategy {
   /** Routes already pulled, exposed for assertions in tests. */
   readonly preloaded: string[] = [];

   private static readonly DELAY_MS = 2000;

   preload(route: Route, load: () => Observable<unknown>): Observable<unknown> {
      if (!route.data?.['preload']) {
         return of(null);
      }

      return timer(SelectivePreloadStrategy.DELAY_MS).pipe(
         mergeMap(() => {
            this.preloaded.push(route.path ?? '');
            return load();
         })
      );
   }
}
