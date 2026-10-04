import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PointerGlowDirective } from './pointer-glow.directive';

@Component({
  template: `<div appPointerGlow class="card" style="width:200px;height:100px"></div>`,
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false
})
class HostComponent { }

/**
 * The directive only binds on a device with a hovering, fine pointer and motion allowed. The
 * device is stubbed rather than read from the test environment, so both branches always run —
 * the shared jsdom shim (src/test-setup.ts) matches nothing, and a real browser would report
 * whatever its host happens to be.
 */
function stubDevice({ finePointer }: { finePointer: boolean }): void {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    writable: true,
    value: (query: string) => ({
      matches: finePointer && !query.includes('prefers-reduced-motion'),
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

const nextFrame = () => new Promise<void>(resolve => requestAnimationFrame(() => resolve()));

describe('PointerGlowDirective', () => {
  let fixture: ComponentFixture<HostComponent>;
  let card: HTMLElement;

  function create(): void {
    TestBed.configureTestingModule({
      declarations: [HostComponent, PointerGlowDirective]
    });
    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    card = fixture.nativeElement.querySelector('.card');
  }

  function move(x: number, y: number): void {
    const rect = card.getBoundingClientRect();
    card.dispatchEvent(new PointerEvent('pointermove', {
      clientX: rect.left + x, clientY: rect.top + y, bubbles: true
    }));
  }

  const sharedMatchMedia = window.matchMedia;
  afterEach(() => {
    Object.defineProperty(window, 'matchMedia', { configurable: true, writable: true, value: sharedMatchMedia });
  });

  describe('on a device with a fine pointer', () => {
    beforeEach(() => {
      stubDevice({ finePointer: true });
      create();
    });

    it('should create without setting any custom property before the pointer moves', () => {
      expect(card.style.getPropertyValue('--mx')).toBe('');
      expect(card.style.getPropertyValue('--my')).toBe('');
    });

    it('should write pointer coordinates relative to the host', async () => {
      move(40, 25);

      // The directive coalesces writes into one animation frame.
      await nextFrame();
      expect(card.style.getPropertyValue('--mx')).toBe('40px');
      expect(card.style.getPropertyValue('--my')).toBe('25px');
    });

    it('should clear the coordinates on pointerleave so the next hover recentres', async () => {
      move(10, 10);
      await nextFrame();

      card.dispatchEvent(new PointerEvent('pointerleave', { bubbles: true }));
      expect(card.style.getPropertyValue('--mx')).toBe('');
      expect(card.style.getPropertyValue('--my')).toBe('');
    });

    it('should detach listeners on destroy without throwing', () => {
      expect(() => {
        fixture.destroy();
        card.dispatchEvent(new PointerEvent('pointermove', { clientX: 5, clientY: 5, bubbles: true }));
      }).not.toThrow();
    });
  });

  describe('on a touch device', () => {
    beforeEach(() => {
      stubDevice({ finePointer: false });
      create();
    });

    it('should never bind, so moving costs nothing', async () => {
      move(40, 25);
      await nextFrame();
      expect(card.style.getPropertyValue('--mx')).toBe('');
    });
  });
});
