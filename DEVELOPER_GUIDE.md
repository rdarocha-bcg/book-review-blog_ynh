# Developer Guide - Book Review Blog

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Initial Setup

Use **Windows** (PowerShell/CMD) with **Node.js for Windows**—not WSL—so the dev server does not run inside the Linux VM.

```powershell
cd $HOME\source\repos\newdir   # adjust if your clone path differs

# Dependencies (if needed):
npm install --legacy-peer-deps

npm start
# Browser: http://127.0.0.1:4200
```

In **Cursor/VS Code**: open the folder from the Windows path (e.g. `C:\Users\...\newdir`), not via **Remote - WSL** or `\\wsl$\...`.

---

## 📁 Project Structure

### Core Layer (`src/app/core/`)
Services for cross-cutting concerns:
- **ApiService**: All HTTP requests
- **StorageService**: localStorage wrapper
- **NotificationService**: Toast notifications
- **ErrorInterceptor**: Global error handling (logging only)

### Shared Layer (`src/app/shared/`)
Reusable components and pages:
- **Components**: Button, Card, Header, Footer, etc.
- **Pages**: 404, 500, 401 error pages

### Features Layer (`src/app/features/`)
Feature-specific areas:
- **reviews/**: Book review CRUD
- **admin/**: Moderation and statistics

---

## 🔧 Development Workflow

### Creating a New Component

```bash
# Using Angular CLI (automatic)
ng generate component features/reviews/components/review-card --standalone

# Or manually create the file following existing patterns
```

**Component Template:**
```typescript
import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-my-component',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div>Your template here</div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MyComponent {}
```

### Creating a New Service

```typescript
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class MyService {
  constructor() {}

  // Methods here
}
```

### Creating a New Route

1. Create the component
2. Add to the routes file:

```typescript
export const FEATURE_ROUTES: Routes = [
  {
    path: 'my-route',
    loadComponent: () =>
      import('./pages/my-page/my-page.component').then(m => m.MyPageComponent),
  },
];
```

---

## 🎨 Styling Guidelines

### Using Tailwind CSS

```html
<!-- Spacing -->
<div class="p-4 m-2 gap-4"></div>

<!-- Colors -->
<button class="bg-yellow-400 text-slate-900 hover:bg-yellow-300"></button>

<!-- Responsive -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"></div>

<!-- Accessibility -->
<button class="focus:outline-none focus:ring-2 focus:ring-yellow-400"></button>
```

### Custom Colors
Defined in `tailwind.config.js`:
- `primary`: #1f2937 (Slate-900)
- `secondary`: #059669 (Green-600)
- `accent`: #f59e0b (Yellow-400)

---

## 📦 State Management

### Services as State Managers

```typescript
// In your service
private items$ = new BehaviorSubject<Item[]>([]);

getItems(): Observable<Item[]> {
  return this.items$.asObservable();
}

// In your component
items$ = this.service.getItems();

// In template
<div *ngFor="let item of items$ | async">{{ item.name }}</div>
```

### Handling Subscriptions

```typescript
// ALWAYS use takeUntil to avoid memory leaks
private destroy$ = new Subject<void>();

ngOnInit(): void {
  this.service.getData()
    .pipe(takeUntil(this.destroy$))
    .subscribe(data => this.processData(data));
}

ngOnDestroy(): void {
  this.destroy$.next();
  this.destroy$.complete();
}
```

---

## 🔐 Access control

The UI is aimed at a single operator. Sign-in is not implemented in the Angular app; use YunoHost SSO or your reverse proxy to protect the site and API if the instance is exposed.

---

## 🎯 Forms

### Reactive Forms Example

```typescript
import { ReactiveFormsModule } from '@angular/forms';

export class MyComponent {
  form: FormGroup;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
    });
  }

  onSubmit(): void {
    if (this.form.valid) {
      console.log(this.form.value);
    }
  }
}
```

### Template-Driven Forms

```html
<form (ngSubmit)="onSubmit()">
  <input [(ngModel)]="name" name="name" required />
  <button type="submit">Submit</button>
</form>
```

---

## 📡 API Integration

### Making API Calls

```typescript
// In your service
constructor(private apiService: ApiService) {}

getReviews(filters): Observable<ReviewResponse> {
  return this.apiService.get<ReviewResponse>('reviews', { params: filters });
}

createReview(review): Observable<Review> {
  return this.apiService.post<Review>('reviews', review);
}
```

### Error Handling

```typescript
this.apiService.get('/endpoint')
  .pipe(
    catchError(error => {
      this.notificationService.error('Failed to load data');
      return throwError(() => error);
    })
  )
  .subscribe(data => {
    // Process data
  });
```

---

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm test:coverage

# Run specific test file
npm test -- --include='**/my.spec.ts'
```

### Writing Tests

```typescript
describe('MyService', () => {
  let service: MyService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MyService);
  });

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  it('should return data', (done) => {
    service.getData().subscribe(data => {
      expect(data).toBeDefined();
      done();
    });
  });
});
```

---

## 🐛 Debugging

### Browser DevTools
- Open Chrome DevTools (F12)
- Go to Sources tab
- Set breakpoints in your code
- Use Console for logging

### Logging

```typescript
// Use console for debugging
console.log('Debug info:', variable);
console.error('Error:', error);
console.warn('Warning:', warning);
```

### Angular DevTools Extension
- Install from Chrome Web Store
- View component tree and properties
- Inspect services and providers

---

## 📋 Code Style & Conventions

### Naming Conventions
- **Components**: kebab-case filenames, PascalCase class names
  - `my-component.component.ts` → `MyComponentComponent`
- **Services**: kebab-case filenames, PascalCase class names
  - `my.service.ts` → `MyService`
- **Variables**: camelCase
  - `myVariable`, `userData`
- **Constants**: UPPER_SNAKE_CASE
  - `MAX_ITEMS = 100`
- **Observables**: suffix with `$`
  - `items$`, `loading$`

### File Organization
```
my-feature/
├── components/
│   └── my-component/
│       └── my-component.component.ts
├── pages/
│   └── my-page/
│       └── my-page.component.ts
├── services/
│   └── my.service.ts
├── models/
│   └── my.model.ts
└── my-feature.routes.ts
```

### Comments & Documentation

```typescript
/**
 * Brief description of what this service does
 * More details if needed
 */
@Injectable()
export class MyService {
  /**
   * Get items from the API
   * @param filters Optional filter parameters
   * @returns Observable of items array
   */
  getItems(filters?: Filter): Observable<Item[]> {
    // Implementation
  }
}
```

---

## 🚨 Common Issues & Solutions

### Issue: "Cannot find module"
**Solution**: Check path aliases in `tsconfig.json`
```typescript
// Use aliases instead of relative paths
import { ApiService } from '@core/services/api.service'; // ✅
import { ApiService } from '../../core/services/api.service'; // ❌
```

### Issue: Memory leaks with subscriptions
**Solution**: Always unsubscribe
```typescript
private destroy$ = new Subject<void>();

constructor(private service: MyService) {
  this.service.data$
    .pipe(takeUntil(this.destroy$))
    .subscribe(data => {});
}

ngOnDestroy(): void {
  this.destroy$.next();
  this.destroy$.complete();
}
```

### Issue: ExpressionChangedAfterCheckError
**Solution**: Use OnPush change detection and proper data flow
```typescript
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
})
```

### Issue: CORS errors
**Solution**: Configure CORS in YunoHost API or use proxy
```typescript
// In environment.ts
apiUrl: 'http://localhost:3000/api', // Dev with proxy
```

---

## 🔄 Workflow for Adding a Feature

1. **Create the component/service structure**
   ```
   features/my-feature/
   ├── models/
   ├── services/
   └── pages/
   ```

2. **Define models/interfaces**
   ```typescript
   export interface MyModel {
     id: string;
     name: string;
   }
   ```

3. **Create service with API calls**
   ```typescript
   @Injectable()
   export class MyService {
     constructor(private api: ApiService) {}
   }
   ```

4. **Create components**
   - List component (display data)
   - Detail component (show single item)
   - Form component (create/edit)

5. **Add routes**
   ```typescript
   export const MY_ROUTES: Routes = [
     { path: '', component: ListComponent },
   ];
   ```

6. **Write tests**
   ```typescript
   describe('MyComponent', () => {
     // Test cases
   });
   ```

7. **Update main routing**
   ```typescript
   { path: 'my-feature', loadChildren: () => ... }
   ```

---

## 📚 Resources

- [Angular Documentation](https://angular.io/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [RxJS Documentation](https://rxjs.dev/guide/overview)

---

## 📞 Questions?

Refer to:
- `README.md` — setup and command reference
- `ARCHITECTURE.md` — design and folder layout
- `API.md` and `docs/API_SSO.md` — backend contract and SSO
- `docs/LOCAL_DEV.md` — full local stack

---

*Happy coding! 🚀*
