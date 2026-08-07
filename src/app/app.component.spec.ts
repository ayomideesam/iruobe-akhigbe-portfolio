import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AppComponent } from './app.component';

// The two removed specs here were Angular CLI scaffold leftovers asserting on a
// `title` property and a `.content span` element that this AppComponent has never
// had. They were a TypeScript compile error, which failed the whole Karma run
// before a single spec executed — so nothing in this project was actually being
// tested. Kept the one assertion that describes real behaviour.
describe('AppComponent', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [RouterTestingModule],
    declarations: [AppComponent],
    schemas: [NO_ERRORS_SCHEMA]
  }));

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
