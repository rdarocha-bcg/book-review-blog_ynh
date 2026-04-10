# Coding Standards - Book Review Blog

## Language

- **Code and comments**: English only.
- **User-facing strings**: Can be localized later; keep in templates or a future i18n file.

## TypeScript

- Use **strict** mode (already in `tsconfig.json`).
- Prefer **interfaces** for object shapes; use **type** for unions/intersections.
- Avoid `any`; use `unknown` and narrow, or generic types.
- Use **path aliases**: `@core/*`, `@shared/*`, `@features/*`, `@environments/*`.

### Example

```typescript
// Good
import { ApiService } from '@core/services/api.service';
import { Review } from '../models/review.model';

export interface ReviewFilter {
  genre?: string;
  page?: number;
}

// Avoid
import { ApiService } from '../../../core/services/api.service';
```

## Angular Components

- **Standalone** components only; no NgModules for features.
- Use **ChangeDetectionStrategy.OnPush** for all components.
- **Naming**: selector `app-feature-name`, class `FeatureNameComponent`.
- **Template**: Prefer inline template for small templates; extract to `.html` when long.

### Example

```typescript
@Component({
  selector: 'app-review-card',
  standalone: true,
  imports: [CommonModule],
  template: `...`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReviewCardComponent {
  @Input() review!: Review;
  @Output() clicked = new EventEmitter<string>();
}
```

## Page layout

- Wrap primary page content in **`page-container`** (see `src/styles.scss`) for a consistent max width (`1240px`) and horizontal padding (`1rem`).
- Use **`page-container page-container--narrow`** for form-heavy or long-form pages that should read like a single column (~`48rem` max width).
- Use **`page-container--roomy-y`** when a screen needs more vertical breathing room (e.g. auth flows); use **`page-container--tight-y`** for dense admin lists.
- Keep **header** and **footer** layout rows on their existing `container` wrappers when they define navigation chrome; align the **main** page body with `page-container` as above.

## Services

- Use **providedIn: 'root'** unless the service is truly feature-scoped.
- **Naming**: `*.service.ts`, class `XxxService`.
- Expose streams as **Observables** (e.g. `getReviews$(): Observable<Review[]>`); use **BehaviorSubject** internally for state.

### Example

```typescript
@Injectable({ providedIn: 'root' })
export class ReviewService {
  private reviews$ = new BehaviorSubject<Review[]>([]);

  getReviews$(): Observable<Review[]> {
    return this.reviews$.asObservable();
  }
}
```

## RxJS

- **Unsubscribe** in `ngOnDestroy` using `takeUntil(destroy$)` with a `Subject<void>`.
- Prefer **async** pipe in templates when possible.
- Use **pipe()** for multiple operators.

### Example

```typescript
private destroy$ = new Subject<void>();

ngOnInit() {
  this.reviewService.getReviews$()
    .pipe(takeUntil(this.destroy$))
    .subscribe(data => this.reviews = data);
}

ngOnDestroy() {
  this.destroy$.next();
  this.destroy$.complete();
}
```

## Forms

- Use **Reactive Forms** for forms with validation.
- **Validation**: required, minLength, custom validators; show errors next to controls with `aria-describedby` and `aria-invalid`.

## Accessibility

- **Semantic HTML**: `<header>`, `<main>`, `<footer>`, `<nav>`, `<button>`, `<a>`.
- **ARIA**: `aria-label` on icon-only buttons, `aria-invalid` and `aria-describedby` on inputs with errors.
- **Focus**: Use `:focus-visible` in global styles for keyboard focus outline; avoid removing focus outline without replacement.

## Testing

- One **`.spec.ts`** per component/service; place next to the file.
- **Naming**: `describe('ComponentName')`, `it('should ...')`.
- **Mocking**: Use `jasmine.createSpyObj` for dependencies; `HttpClientTestingModule` for HTTP.

### Example

```typescript
describe('ReviewListComponent', () => {
  let component: ReviewListComponent;
  let fixture: ComponentFixture<ReviewListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReviewListComponent, RouterTestingModule],
      providers: [
        { provide: ReviewService, useValue: jasmine.createSpyObj('ReviewService', ['getReviews']) },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(ReviewListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
```

## File and Folder Structure

- **Components**: `feature-name/component-name.component.ts` (and `.spec.ts`, `.html` if used).
- **Services**: `services/name.service.ts`.
- **Models**: `models/name.model.ts`.
- **Routes**: `feature.routes.ts` or `feature-routes.ts`.

## Linting

- Run **`npm run lint`** before committing.
- Fix ESLint and Angular template lint issues.

## Git / Commits

- Prefer short, descriptive commit messages (e.g. "feat: add password reset page", "fix: guard redirect when no token").
