import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { FormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared.module';

import { HomeComponent } from './home.component';

// Was a bare CLI scaffold with no TestBed configuration at all, so it threw on
// creation. It never surfaced because a compile error in app.component.spec.ts
// failed the whole Karma run before any spec executed.
describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HomeComponent],
      imports: [SharedModule, RouterTestingModule, FormsModule, NoopAnimationsModule],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('window controls and dock', () => {
    const visible = () => component.visibleProjects.map(p => p.key);
    const docked = () => component.dockProjects.map(p => p.key);

    beforeEach(() => vi.useFakeTimers());
    afterEach(() => vi.useRealTimers());

    it('closing a window brings in the next docked project and docks the closed one last', () => {
      component.swapProject(1, 'close');
      expect(visible()).toEqual(['nxp', 'cap', 'fms']); // waits for the exit animation
      vi.runAllTimers();
      expect(visible()).toEqual(['nxp', 'trade', 'fms']);
      expect(docked()).toEqual(['costaff', 'tiger', 'xpath', 'cap']);
      expect(component.swapAnnouncement()).toContain('Globus Trade — Import opened');
    });

    it('ignores a second control while a window is still leaving', () => {
      component.swapProject(0, 'minimise');
      component.swapProject(2, 'close');
      vi.runAllTimers();
      expect(visible()).toEqual(['trade', 'cap', 'fms']);
    });

    it('opens a docked project in the stalest slot, rightmost first, and docks the window it replaces in place', () => {
      expect(component.restoreTarget.key).toBe('fms'); // what the dock tooltip promises
      component.restoreProject('xpath');
      vi.runAllTimers();
      expect(visible()).toEqual(['nxp', 'cap', 'xpath']);
      expect(docked()).toEqual(['trade', 'costaff', 'tiger', 'fms']);

      component.restoreProject('tiger');
      vi.runAllTimers();
      expect(visible()).toEqual(['nxp', 'tiger', 'xpath']);
      expect(component.restoreTarget.key).toBe('nxp');

      component.restoreProject('costaff');
      vi.runAllTimers();
      expect(visible()).toEqual(['costaff', 'tiger', 'xpath']);
    });
  });

  describe('rollout odometer', () => {
    it('lands each column on its digit, with column i spinning i full turns', () => {
      const [exportModule, , corporate] = component.currentlyBuilding.modules;
      expect(exportModule.odometer.map(c => c.to)).toEqual([1, 10, 20]);
      expect(corporate.odometer.map(c => c.to)).toEqual([1, 10]);
      expect(exportModule.odometer[2].digits.at(-1)).toBe(0);
    });
  });
});
