# Angular 20.3 Development Standards
**CAP-Frontend Project**  
**Last Updated:** June 25, 2026  
**Angular Version:** 20.3.x | **CLI:** 20.3.30 | **TypeScript:** 5.9.x

> **Filename note:** This document is intentionally kept at `docs/ANGULAR-19-STANDARDS.md`. It is cited as a stable anchor across the codebase and in `CLAUDE.md` ("See ANGULAR-19-STANDARDS.md - [pattern]"). The **content** tracks the current Angular version; the filename is a permalink, not a version marker. Do not rename without updating every `// See ANGULAR-19-STANDARDS.md` citation and the `CLAUDE.md` routing references.

---

## 📌 Purpose
This document is the **single source of truth** for modern Angular development patterns in this project. All code changes, fixes, and features must reference and follow these standards. When Angular version changes in `package.json`, this file must be updated accordingly.

**Referenced in PRs/Commits as:** "See ANGULAR-19-STANDARDS.md - [pattern name]"

---

## 🎯 Core Principles
1. **Signals over RxJS** - Faster, simpler, no subscription overhead
2. **Type Safety** - Strict mode enabled (`noImplicitAny`, `strictNullChecks`)
3. **Zero Boilerplate** - Modern control flow, DI via `inject()`
4. **Performance First** - Computed properties, effect tracking, automatic change detection
5. **Standalone First** - All components are standalone (the **implicit default** in v20 — do **not** write `standalone: true`), zero NgModules
6. **`linkedSignal` over sync-effects** - Use `linkedSignal()` to seed editable local state from inputs, not a manual `effect()`

---

## 🚀 STATE MANAGEMENT: Signals vs BehaviorSubject

### ❌ OLD PATTERN (BehaviorSubject)
```typescript
// Slow, subscription overhead, verbose
private state = new BehaviorSubject<MyState>({ ... });
public state$ = this.state.asObservable();

// In component
this.myService.state$.subscribe(state => {
  this.localState = state;  // Manual subscription
});
```
**Issues:** Memory leaks, boilerplate, change detection overhead, requires `.value` access

---

### ✅ NEW PATTERN (Signals)
```typescript
// Fast, zero overhead, automatic
private state = signal<MyState>({ ... });
public state = signal<MyState>({ ... }); // expose directly or via computed()

// In component - automatic updates, no subscription needed
state = inject(MyService).state;  // Direct access
```
**Benefits:** 10-30% faster, no subscription management, automatic change detection, type-safe

---

## 📊 Signal Patterns Reference

### 1️⃣ Writing State
```typescript
// Service
import { signal, computed, effect, inject } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class MyService {
  // Private state signal
  private itemsSignal = signal<Item[]>([]);
  
  // Public computed (read-only)
  public items = computed(() => this.itemsSignal());
  public itemCount = computed(() => this.itemsSignal().length);
  
  // Update state
  updateItems(items: Item[]): void {
    this.itemsSignal.set(items);
    // OR for immutable update:
    // this.itemsSignal.update(prev => [...prev, newItem]);
  }
}
```

### 2️⃣ Reading State in Components
```typescript
// Component
export class MyComponent {
  private myService = inject(MyService);
  
  // Direct signal access (auto-updates)
  items = this.myService.items;
  itemCount = this.myService.itemCount;
  
  // In template: {{ items().length }} or {{ itemCount() }}
}
```

### 3️⃣ Derived State with Computed
```typescript
private user = signal<User | null>(null);
private permissions = signal<Permission[]>([]);

// Computed automatically updates when dependencies change
public canEdit = computed(() => {
  const user = this.user();
  const perms = this.permissions();
  return user && perms.includes('EDIT');
});
```

### 4️⃣ Side Effects with Effect
```typescript
// Auto-run when dependency changes (replaces subscriptions)
effect(() => {
  const user = this.user();
  if (user) {
    console.log('User changed:', user);
    this.loadUserData(user.id);
  }
});
```
> **v20 note:** `effect()` now flushes during change detection (not as a microtask), and writing to signals inside an effect is allowed by default. The `allowSignalWrites` option has been **removed** — passing it is a compile error.

### 5️⃣ Writable Derived State with `linkedSignal` (Angular 20)
`linkedSignal()` is writable like a `signal`, but **recomputes/resets** whenever its source changes. It replaces the legacy "effect that mirrors an input into an editable local signal" pattern.

```typescript
// ❌ OLD (v19): manual effect to mirror an input into editable local state
readonly savedOtherFees = input<string>('');
otherFees = signal('');
constructor() {
  effect(() => this.otherFees.set(this.savedOtherFees() || ''));
}

// ✅ NEW (v20): linkedSignal — one line, no effect, no injection-context concern
readonly savedOtherFees = input<string>('');
otherFees = linkedSignal(() => this.savedOtherFees() || '');
```
**Use it for:** local form fields seeded from `@Input`/`input()` that the user can edit, but which must reset when the source input changes. **Do not** reach for `effect()` for this anymore. For conditional seeding, use the advanced form: `linkedSignal({ source, computation: (src, prev) => ... })`.

---

## 🔗 DEPENDENCY INJECTION Pattern

### ❌ OLD (Constructor DI)
```typescript
constructor(private http: HttpClient, private router: Router) { }
```

### ✅ NEW (inject() Pattern)
```typescript
private http = inject(HttpClient);
private router = inject(Router);
```
**Benefits:** Cleaner, works in any function, tree-shakeable, better for standalone

---

## 🌐 HTTP PATTERNS

### ⚠️ RxJS HttpClient (Legacy but still used)
```typescript
// If using RxJS-based HTTP (temporary, being phased out)
initiateDisbursement(id: string): Observable<ApiResponse> {
  return this.http.get<ApiResponse>(`/api/facility/${id}`);
}

// In component
this.myService.getData().pipe(
  takeUntil(this.unSubscribe),
  finalize(() => this.isLoading = false)
).subscribe({
  next: (data) => { /* handle */ },
  error: (error) => { /* handle */ }
});
```

### ✅ MODERN: resource() / httpResource API (Angular 20 — stable)
**Status:** **Stable in Angular 20.** Preferred for new simple read operations.

```typescript
// Service
import { resource } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class MyService {
  private http = inject(HttpClient);
  
  // httpResource automatically handles loading/error states
  getData = resource({
    request: ({ id }: { id: string }) => ({ id }),
    loader: ({ request }) => this.http.get(`/api/data/${request.id}`)
  });
}

// Component - simpler, no subscription management
export class MyComponent {
  service = inject(MyService);
  data = this.service.getData;
  
  loadData(id: string) {
    this.data.reload({ request: { id } });
  }
  
  // Template: {{ data.value() | json }}
  // Template: @if(data.isLoading()) { <spinner/> }
  // Template: @if(data.error()) { Error: {{ data.error().message }} }
}
```

### 📋 HTTP Pattern Decision Tree
- **Simple read operations** → Use `httpResource`
- **Complex workflows** → Use `rxjs + HttpClient` with proper cleanup
- **Legacy code** → Keep `HttpClient` subscriptions but add to unsubscribe management

---

## 🎮 CONTROL FLOW Patterns

### ❌ OLD (Structural Directives)
```html
<div *ngIf="isLoading">Loading...</div>
<div *ngFor="let item of items">{{ item.name }}</div>
<div [ngSwitch]="status">
  <div *ngSwitchCase="'active'">Active</div>
</div>
```

### ✅ NEW (Control Flow Blocks)
```html
@if (isLoading()) {
  <div>Loading...</div>
}

@for (let item of items(); track item.id) {
  <div>{{ item.name }}</div>
}

@switch (status()) {
  @case ('active') {
    <div>Active</div>
  }
  @case ('inactive') {
    <div>Inactive</div>
  }
}

@empty {
  <div>No items</div>
}
```
**Benefits:** Faster, ergonomic, default strict null checking

---

## 🔄 LIFECYCLE & CLEANUP

### Pattern: SubscriptionManagementDirective
```typescript
// Base class handles all subscriptions
export class MyComponent extends SubscriptionManagementDirective implements OnInit, OnDestroy {
  private myService = inject(MyService);
  
  ngOnInit() {
    // Use takeUntil(this.unSubscribe) for any RxJS operations
    this.myService.getData()
      .pipe(takeUntil(this.unSubscribe))
      .subscribe(data => { /* handle */ });
  }
  
  override ngOnDestroy() {
    super.ngOnDestroy(); // Handles cleanup
  }
}
```

---

## 💾 FORM STATE Management

### ❌ OLD (ngModel, Template Variables)
```html
<input [(ngModel)]="name" #nameInput>
<input [(ngModel)]="email">
```

### ✅ NEW (Signals + Template Variables)
```typescript
export class MyComponent {
  formState = signal({
    name: '',
    email: ''
  });
  
  updateForm(field: string, value: string) {
    this.formState.update(state => ({
      ...state,
      [field]: value
    }));
  }
}
```

---

## 📤 OUTPUT & Input Events

### Pattern: `@Output EventEmitter` with Signals
```typescript
export class ChildComponent {
  // Input
  @Input() selectedItem: Item | null = null;
  
  // Output
  @Output() itemChanged = new EventEmitter<Item>();
  
  selectItem(item: Item) {
    this.itemChanged.emit(item);
  }
}

// Parent component
export class ParentComponent {
  selectedItem = signal<Item | null>(null);
  
  onItemChanged(item: Item) {
    this.selectedItem.set(item);
  }
}
```

---

## 🛡️ TYPE SAFETY Checklist

Project has **strict mode enabled**. All code must:
- ✅ Have explicit type annotations on public APIs
- ✅ Use `signal<T>()` with generic type
- ✅ Use `computed<T>()` with explicit return type when not inferable
- ✅ Handle `null` and `undefined` explicitly
- ✅ Use `?.` optional chaining, not `!` non-null assertion (avoid when possible)

```typescript
// ✅ GOOD
private user = signal<User | null>(null);
public userName = computed<string>(() => this.user()?.name ?? 'Unknown');

// ❌ BAD
private user = signal<any>(null);  // Don't use any
public userName = computed(() => this.user()!.name);  // Don't assert non-null
```

---

## ⚡ PERFORMANCE Best Practices

### 1. Use `track` in @for loops
```html
<!-- ✅ GOOD: Prevents re-rendering on position changes -->
@for (item of items(); track item.id) {
  <div>{{ item.name }}</div>
}

<!-- ❌ BAD: Re-renders entire list -->
@for (item of items(); track $index) {
  <div>{{ item.name }}</div>
}
```

### 2. Unsubscribe Properly
```typescript
// If using RxJS (legacy)
private destroy$ = new Subject<void>();

ngOnInit() {
  this.observable$
    .pipe(takeUntil(this.destroy$))
    .subscribe(/* ... */);
}

ngOnDestroy() {
  this.destroy$.next();
  this.destroy$.complete();
}
```

### 3. Avoid Memory Leaks in Timers
```typescript
// ❌ BAD: Timer not cleaned up
setTimeout(() => { /* ... */ }, 5000);

// ✅ GOOD: Proper cleanup
private timerId: any;
ngOnInit() {
  this.timerId = setTimeout(() => { /* ... */ }, 5000);
}
ngOnDestroy() {
  if (this.timerId) clearTimeout(this.timerId);
}
```

---

## 🎯 Session Management Example

**See:** `src/app/core/services/session.service.ts`

```typescript
// Use signals for state
private sessionStateSignal = signal<SessionState>({
  isActive: false,
  timeRemaining: 0,
  showWarning: false
});

// Expose computed
public sessionState = computed(() => this.sessionStateSignal());
public timeRemaining = computed(() => this.sessionStateSignal().timeRemaining);

// Use interval (not timer) for efficiency
effect(() => {
  interval(60000)
    .pipe(takeUntil(this.destroy$))
    .subscribe(() => {
      const newState = this.sessionStateSignal();
      this.sessionStateSignal.set({ ...newState, timeRemaining: calculateRemaining() });
    });
});
```

---

## 📚 Common Migration Patterns

| Old Pattern | New Pattern | File | Reason |
|---|---|---|---|
| `BehaviorSubject` | `signal` | `session.service.ts` | 10-30% faster |
| `Observable.subscribe()` | `effect()` or `computed()` | Various | No subscription overhead |
| `*ngIf`, `*ngFor` | `@if`, `@for` | Templates | Faster, cleaner syntax |
| `.subscribe({ })` | `resource()` or effect | Services | Automatic cleanup |
| Constructor DI | `inject()` | All | Tree-shakeable |
| `ngModel` | Signals | Forms | Better performance |

---

## 🧩 CUSTOM WEB COMPONENTS (`gb-*` Design System)

Every standalone component that uses a `gb-*` custom element **must** declare `CUSTOM_ELEMENTS_SCHEMA` in its `@Component` decorator. Without it, Angular's template compiler throws unknown-element errors.

```typescript
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@Component({
  selector: 'app-my-component',
  // standalone: true is the v20 default — omit it
  imports: [DecimalPipe],
  templateUrl: './my-component.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]   // ← required for all gb-* usage
})
```

### Binding Pattern for `gb-*` Elements

`gb-*` components do not support `formControlName` or `[(ngModel)]`. All bindings are explicit:

```html
<!-- ✅ CORRECT: property binding + custom event -->
<gb-input-field
  [value]="mySignal()"
  (inputValueChanged)="onMyChange($event)">
</gb-input-field>

<!-- ❌ WRONG: will not work -->
<gb-input-field [(ngModel)]="myValue"></gb-input-field>
<gb-input-field formControlName="myField"></gb-input-field>
```

```typescript
// Extract value from CustomEvent
onMyChange(event: any): void {
  const value = (event as CustomEvent).detail;
  this.mySignal.set(value);
}
```

### `type="count"` Field Events

Count fields have three distinct events — do not conflate them:

| Event | Payload | When it fires |
|---|---|---|
| `inputValueChanged` | `any` (the typed value) | User types in the field |
| `plusButtonClicked` | `void` | User clicks `+` |
| `minusButtonClicked` | `void` | User clicks `-` |

```html
<gb-input-field type="count" input-type="number"
  [value]="displaySignal()"
  (inputValueChanged)="onTyped($event)"
  (plusButtonClicked)="onIncrement()"
  (minusButtonClicked)="onDecrement()">
</gb-input-field>
```

When a count field has a `min`/`max` constraint, use **two signals**: a display signal (bound to `[value]`, only updated on init, restore, and button clicks) and a stored signal (updated on every event, used for payload). Never update the display signal from `inputValueChanged` — it resets the component's internal input state mid-typing.

---

## 🔀 RxJS ↔ Signal Boundary

Angular 19 is signal-first but HTTP and some third-party APIs remain RxJS-based. Manage the boundary explicitly.

### Observable → Signal (`toSignal`)
```typescript
import { toSignal } from '@angular/core/rxjs-interop';

// In injection context (constructor, field initializer, or inject())
private myService = inject(MyService);
readonly data = toSignal(this.myService.getData$(), { initialValue: [] });
// Template: {{ data() }} — no subscribe, no async pipe
```

### Signal → Observable (`toObservable`)
```typescript
import { toObservable } from '@angular/core/rxjs-interop';

readonly filter = signal('');
readonly filter$ = toObservable(this.filter);

// Use when an RxJS operator (debounceTime, switchMap) is needed on a signal
this.filter$
  .pipe(debounceTime(300), switchMap(q => this.api.search(q)), takeUntil(this.destroy$))
  .subscribe(results => this.results.set(results));
```

### Decision Rule
- **Signal → template** — always direct, no conversion needed
- **HTTP call** — stays as Observable with `takeUntil(this.destroy$)`, result stored in a signal
- **Signal driving an RxJS pipeline** — use `toObservable()`
- **Observable as read-only state** — use `toSignal()` with `initialValue`

---

## ✅ Code Review Checklist

When reviewing code, verify:
- [ ] No `BehaviorSubject` for new code (use `signal`)
- [ ] All state exposed via `signal`/`computed`
- [ ] Proper cleanup in `ngOnDestroy` (or use `effect`)
- [ ] `@if` and `@for` used instead of `*ngIf`/`*ngFor`
- [ ] `track` specified in all `@for` loops
- [ ] No `any` types
- [ ] `inject()` used for dependencies
- [ ] No redundant `standalone: true` (it is the v20 implicit default)
- [ ] `linkedSignal()` (not a manual `effect()`) used to seed editable local state from inputs
- [ ] No `allowSignalWrites` passed to `effect()` (removed in v20)
- [ ] Public API types explicitly defined
- [ ] No memory leaks in timers/subscriptions
- [ ] `httpResource` used for simple HTTP calls
- [ ] `CUSTOM_ELEMENTS_SCHEMA` declared in every component using `gb-*` elements
- [ ] `gb-*` bindings use `[value]` + `(inputValueChanged)`, never `ngModel`/`formControlName`
- [ ] RxJS/Signal boundary managed via `toSignal()`/`toObservable()` where needed

---

## 🔗 References & Resources
- **Angular 20 Docs:** https://angular.dev
- **Signals Guide:** https://angular.dev/guide/signals
- **linkedSignal:** https://angular.dev/guide/signals/linked-signal
- **Control Flow:** https://angular.dev/guide/control-flow
- **Strict Mode:** https://angular.dev/guide/strict-mode
- **resource() / httpResource:** https://angular.dev/api/core/resource (stable in v20)

---

## 📋 Update History

| Date | Angular Version | Changes |
|------|---|---|
| 2026-03-28 | 19.2.20+ | Initial standards document created |
| | | Session service refactored to Signals |
| | | ANGULAR-19-STANDARDS.md established |
| 2026-06-11 | 19.2.20+ | Added `gb-*` custom web component binding patterns and `CUSTOM_ELEMENTS_SCHEMA` requirement |
| | | Added RxJS ↔ Signal boundary patterns (`toSignal`, `toObservable`) |
| | | Updated code review checklist |
| 2026-06-25 | **20.3.x** | Upgraded Angular 19 → 20 (CLI 20.3.30, TypeScript 5.9.x); cleared 10 `@angular/*` CVEs |
| | | `standalone: true` now the implicit default — removed from examples and disbursement components |
| | | Added `linkedSignal()` pattern; promoted `resource()`/`httpResource` to stable |
| | | Noted `effect()` CD-flush timing change and `allowSignalWrites` removal |

---

## 🚦 When to Update This File

Update this document when:
- ✅ Angular version changes in `package.json`
- ✅ New Angular features become available/recommended (httpResource stabilized, etc.)
- ✅ Team discovers new best practices or performance improvements
- ✅ Major pattern shift needed across codebase

**Do NOT update for:** Individual component/service changes (those reference this file instead)

---

## 📞 Questions?
Reference this file in code comments:
```typescript
// See ANGULAR-19-STANDARDS.md - Using Signals instead of BehaviorSubject
private state = signal<MyState>({ ... });
```
