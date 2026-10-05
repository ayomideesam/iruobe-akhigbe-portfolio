// Vitest setup (angular.json → test.options.setupFiles).
//
// Tests run in jsdom, which implements neither matchMedia nor IntersectionObserver. Pages read both
// while initialising, so inert versions are installed here: no media query matches and nothing ever
// intersects. A spec that depends on a particular device stubs matchMedia itself (see
// pointer-glow.directive.spec.ts).
//
// jsdom does define scrollTo, but only to log "Not implemented"; pages scroll to the top on init.
window.scrollTo = () => undefined;

if (typeof window.matchMedia !== 'function') {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    writable: true,
    value: (query: string): MediaQueryList => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      addListener: () => undefined,
      removeListener: () => undefined,
      dispatchEvent: () => false
    })
  });
}

if (typeof window.IntersectionObserver !== 'function') {
  class InertIntersectionObserver implements IntersectionObserver {
    readonly root = null;
    readonly rootMargin = '0px';
    readonly scrollMargin = '0px';
    readonly thresholds: ReadonlyArray<number> = [0];
    observe(): void { }
    unobserve(): void { }
    disconnect(): void { }
    takeRecords(): IntersectionObserverEntry[] { return []; }
  }
  Object.defineProperty(window, 'IntersectionObserver', {
    configurable: true,
    writable: true,
    value: InertIntersectionObserver
  });
}
