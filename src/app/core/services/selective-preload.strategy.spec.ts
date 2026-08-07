import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { Route } from '@angular/router';
import { of } from 'rxjs';
import { SelectivePreloadStrategy } from './selective-preload.strategy';

describe('SelectivePreloadStrategy', () => {
   let strategy: SelectivePreloadStrategy;
   let load: jasmine.Spy;

   beforeEach(() => {
      TestBed.configureTestingModule({});
      strategy = TestBed.inject(SelectivePreloadStrategy);
      load = jasmine.createSpy('load').and.returnValue(of('loaded'));
   });

   it('should not preload a route that has not opted in', fakeAsync(() => {
      const route: Route = { path: 'resume' };
      strategy.preload(route, load).subscribe();
      tick(10000);

      expect(load).not.toHaveBeenCalled();
   }));

   it('should preload a route marked with data.preload', fakeAsync(() => {
      const route: Route = { path: 'services', data: { preload: true } };
      strategy.preload(route, load).subscribe();
      tick(3000);

      expect(load).toHaveBeenCalledTimes(1);
      expect(strategy.preloaded).toContain('services');
   }));

   it('should wait before preloading so it never competes with the current route', fakeAsync(() => {
      const route: Route = { path: 'projects', data: { preload: true } };
      strategy.preload(route, load).subscribe();

      tick(500);
      expect(load).withContext('must not fire immediately').not.toHaveBeenCalled();

      tick(2500);
      expect(load).toHaveBeenCalled();
   }));

   it('should keep the resume route lazy, since it drags in the PDF toolchain', fakeAsync(() => {
      // Mirrors the real route table: resume deliberately has no preload flag.
      const routes: Route[] = [
         { path: 'services', data: { preload: true } },
         { path: 'projects', data: { preload: true } },
         { path: 'contact', data: { preload: true } },
         { path: 'resume' }
      ];
      routes.forEach(r => strategy.preload(r, load).subscribe());
      tick(5000);

      expect(strategy.preloaded).not.toContain('resume');
      expect(strategy.preloaded.length).toBe(3);
   }));
});
