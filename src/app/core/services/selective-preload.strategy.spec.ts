import { TestBed } from '@angular/core/testing';
import { Route } from '@angular/router';
import { of } from 'rxjs';
import type { Mock } from 'vitest';
import { SelectivePreloadStrategy } from './selective-preload.strategy';

describe('SelectivePreloadStrategy', () => {
   let strategy: SelectivePreloadStrategy;
   let load: Mock;

   beforeEach(() => {
      TestBed.configureTestingModule({});
      strategy = TestBed.inject(SelectivePreloadStrategy);
      load = vi.fn().mockName('load').mockReturnValue(of('loaded'));
      // The strategy waits on an RxJS timer; fake timers let each spec step through that delay.
      vi.useFakeTimers();
   });

   afterEach(() => {
      vi.useRealTimers();
   });

   it('should not preload a route that has not opted in', () => {
      const route: Route = { path: 'resume' };
      strategy.preload(route, load).subscribe();
      vi.advanceTimersByTime(10000);

      expect(load).not.toHaveBeenCalled();
   });

   it('should preload a route marked with data.preload', () => {
      const route: Route = { path: 'services', data: { preload: true } };
      strategy.preload(route, load).subscribe();
      vi.advanceTimersByTime(3000);

      expect(load).toHaveBeenCalledTimes(1);
      expect(strategy.preloaded).toContain('services');
   });

   it('should wait before preloading so it never competes with the current route', () => {
      const route: Route = { path: 'projects', data: { preload: true } };
      strategy.preload(route, load).subscribe();

      vi.advanceTimersByTime(500);
      expect(load, 'must not fire immediately').not.toHaveBeenCalled();

      vi.advanceTimersByTime(2500);
      expect(load).toHaveBeenCalled();
   });

   it('should keep the resume route lazy, since it drags in the PDF toolchain', () => {
      // Mirrors the real route table: resume deliberately has no preload flag.
      const routes: Route[] = [
         { path: 'services', data: { preload: true } },
         { path: 'projects', data: { preload: true } },
         { path: 'contact', data: { preload: true } },
         { path: 'resume' }
      ];
      routes.forEach(r => strategy.preload(r, load).subscribe());
      vi.advanceTimersByTime(5000);

      expect(strategy.preloaded).not.toContain('resume');
      expect(strategy.preloaded.length).toBe(3);
   });
});
