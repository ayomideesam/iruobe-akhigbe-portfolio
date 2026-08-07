import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PointerGlowDirective } from './pointer-glow.directive';

@Component({
  template: `<div appPointerGlow class="card" style="width:200px;height:100px"></div>`,
  standalone: false
})
class HostComponent { }

describe('PointerGlowDirective', () => {
  let fixture: ComponentFixture<HostComponent>;
  let card: HTMLElement;
  const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches
    && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [HostComponent, PointerGlowDirective]
    });
    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    card = fixture.nativeElement.querySelector('.card');
  });

  it('should create without setting any custom property before the pointer moves', () => {
    expect(card.style.getPropertyValue('--mx')).toBe('');
    expect(card.style.getPropertyValue('--my')).toBe('');
  });

  it('should write pointer coordinates relative to the host', done => {
    if (!canHover) { pending('environment reports no fine pointer'); return; }

    const rect = card.getBoundingClientRect();
    card.dispatchEvent(new PointerEvent('pointermove', {
      clientX: rect.left + 40, clientY: rect.top + 25, bubbles: true
    }));

    // The directive coalesces writes into one animation frame.
    requestAnimationFrame(() => {
      expect(card.style.getPropertyValue('--mx')).toBe('40px');
      expect(card.style.getPropertyValue('--my')).toBe('25px');
      done();
    });
  });

  it('should clear the coordinates on pointerleave so the next hover recentres', done => {
    if (!canHover) { pending('environment reports no fine pointer'); return; }

    const rect = card.getBoundingClientRect();
    card.dispatchEvent(new PointerEvent('pointermove', {
      clientX: rect.left + 10, clientY: rect.top + 10, bubbles: true
    }));

    requestAnimationFrame(() => {
      card.dispatchEvent(new PointerEvent('pointerleave', { bubbles: true }));
      expect(card.style.getPropertyValue('--mx')).toBe('');
      expect(card.style.getPropertyValue('--my')).toBe('');
      done();
    });
  });

  it('should detach listeners on destroy without throwing', () => {
    expect(() => {
      fixture.destroy();
      card.dispatchEvent(new PointerEvent('pointermove', { clientX: 5, clientY: 5, bubbles: true }));
    }).not.toThrow();
  });
});
