# Architecture Details - Book Review Blog

## 🏗️ Architectural Patterns

### 1. Standalone Components
All components are standalone, reducing bundle size and improving tree-shaking:

```typescript
@Component({
  selector: 'app-my-component',
  standalone: true,  // ← Standalone
  imports: [CommonModule, FormsModule],  // Explicit imports
})
```

### 2. Smart/Dumb Components Pattern

**Smart Component** (Handles logic):
```typescript
// pages/review-list/review-list.component.ts
export class ReviewListComponent {
  reviews$ = this.reviewService.getReviews$();
  
  constructor(private reviewService: ReviewService) {}
}
```

**Dumb Component** (Displays data):
```typescript
// components/review-card/review-card.component.ts
@Component({
  selector: 'app-review-card',
  inputs: ['review', 'hoverable'],  // Only inputs
  outputs: ['click'],  // Only outputs
})
export class ReviewCardComponent {
  @Input() review: Review;
  @Output() click = new EventEmitter<void>();
}
```

### 3. Reactive Architecture with RxJS

State management using Observables:
```typescript
@Injectable()
export class ReviewService {
  private reviews$ = new BehaviorSubject<Review[]>([]);
  
  getReviews$(): Observable<Review[]> {
    return this.reviews$.asObservable();
  }
}
```

### 4. Dependency Injection

All services use Angular's DI system:
```typescript
// Providing at root level
@Injectable({ providedIn: 'root' })
export class MyService {}

// Injecting in component
constructor(private myService: MyService) {}
```

### 5. Lazy Loading

Feature modules loaded on demand:
```typescript
// app.routes.ts
{
  path: 'admin',
  loadChildren: () => import('./features/admin/admin.routes')
    .then(m => m.ADMIN_ROUTES),
}
```

---

## 📊 Data Flow Architecture

### Request Flow
```
Component 
  ↓ (calls service method)
Service 
  ↓ (calls ApiService)
ApiService 
  ↓ (HTTP request)
ErrorInterceptor 
  ↓ (handles errors)
Yunohost Backend API
  ↓ (response)
Service (updates BehaviorSubject)
  ↓ (emits new value)
Component (subscribes with async pipe)
  ↓
Template (renders data)
```

### Example: Loading Reviews

```
1. Component ngOnInit()
   ↓
2. Calls: this.reviewService.getReviews(filters)
   ↓
3. Service makes HTTP GET request
   ↓
4. ApiService calls: this.http.get('/reviews')
   ↓
5. Response received
   ↓
6. Service updates: this.reviews$.next(response.data)
   ↓
7. Component observes: reviews$ = this.reviewService.getReviews$()
   ↓
8. Template renders: *ngFor="let review of reviews$ | async"
```

---

## 🔒 Security Architecture

### Authentication Flow

```
User enters credentials
  ↓
LoginComponent → AuthService.login()
  ↓
ApiService → POST /auth/login
  ↓
Backend validates and returns JWT token
  ↓
AuthService stores token in localStorage
  ↓
AuthService updates isAuthenticated$ = true
  ↓
Router navigates to home
  ↓
All subsequent API calls include Authorization header
```

### Error Handling Flow

```
HTTP Error Response (401, 403, 500, etc.)
  ↓
ErrorInterceptor catches error
  ↓
- If 401: Logout and redirect to login
- If 403: Show "Access Denied"
- If 500: Show "Server Error"
  ↓
Component error handler
  ↓
NotificationService.error()
  ↓
Toast notification displayed to user
```

---

## 🎯 Component Hierarchy

```
AppComponent
├── HeaderComponent
│   ├── Navigation Links
│   ├── User Menu
│   └── New Review Button
├── RouterOutlet
│   └── Feature Components (lazy loaded)
│       ├── ReviewListComponent
│       │   ├── ReviewFilterComponent (inline)
│       │   └── ReviewCardComponent (repeated)
│       ├── ReviewDetailComponent
│       ├── ReviewFormComponent
│       ├── LoginComponent
│       ├── RegisterComponent
│       └── ...
├── FooterComponent
│   ├── Footer Links
│   └── Copyright
└── NotificationComponent
    └── Toast Notifications (dynamic)
```

---

## 🔄 State Management Strategy

### Global State
Managed at root level through services:
- `AuthService`: Authentication state
- `NotificationService`: Active notifications

### Feature State
Managed within feature services:
- `ReviewService`: Reviews list and current review
- Other feature services as needed

### Component State
Local state using reactive forms:
```typescript
reviewForm: FormGroup = this.fb.group({
  title: ['', Validators.required],
  // ...
});
```

---

## 🧩 Dependency Injection Configuration

### App Configuration (`app.config.ts`)
```typescript
export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([errorInterceptor])
    ),
    // Services automatically provided with providedIn: 'root'
  ],
};
```

### Interceptor Chain
```
HTTP Request
  ↓
ErrorInterceptor (catches errors)
  ↓
API Call
  ↓
Response
```

---

## 📦 Module Structure

### Core Module Pattern (Services Only)
```
core/
├── services/          ← No imports needed in other services
│   ├── api.service.ts
│   ├── auth.service.ts
│   ├── storage.service.ts
│   └── notification.service.ts
├── interceptors/
│   └── error.interceptor.ts
└── guards/
    └── auth.guard.ts
```

### Shared Module Pattern (Reusable Components)
```
shared/
├── components/        ← Can be used anywhere
│   ├── header/
│   ├── footer/
│   ├── button/
│   ├── card/
│   ├── pagination/
│   └── ...
└── pages/            ← Error pages
    ├── not-found/
    ├── error/
    └── unauthorized/
```

### Feature Module Pattern (Feature-Specific)
```
features/
├── reviews/
│   ├── models/       ← Types specific to this feature
│   ├── services/     ← Feature service
│   └── pages/        ← Feature components
├── auth/
├── blog/
└── admin/
```

---

## 🔌 Service Architecture

### ApiService (HTTP Layer)
```typescript
@Injectable()
export class ApiService {
  // Generic CRUD methods
  get<T>(endpoint, options?): Observable<T>
  post<T>(endpoint, data, options?): Observable<T>
  put<T>(endpoint, data, options?): Observable<T>
  patch<T>(endpoint, data, options?): Observable<T>
  delete<T>(endpoint, options?): Observable<T>
}
```

### ReviewService (Business Logic)
```typescript
@Injectable()
export class ReviewService {
  private reviews$ = new BehaviorSubject<Review[]>([]);
  
  getReviews(filters): Observable<ReviewPaginationResponse>
  getReviewById(id): Observable<Review>
  createReview(data): Observable<Review>
  updateReview(id, data): Observable<Review>
  deleteReview(id): Observable<void>
  
  getReviews$(): Observable<Review[]>
  getLoading$(): Observable<boolean>
}
```

### AuthService (Authentication)
```typescript
@Injectable()
export class AuthService {
  login(credentials): Observable<Response>
  register(userData): Observable<Response>
  logout(): void
  getToken(): string | null
  getCurrentUser$(): Observable<User>
  isAuthenticated(): Observable<boolean>
  refreshToken(): Observable<Response>
}
```

---

## 🌊 Observable Patterns Used

### 1. BehaviorSubject (State)
```typescript
private state$ = new BehaviorSubject<State>(initialState);
// Always emits current value on subscribe
```

### 2. Subject (Events)
```typescript
private destroy$ = new Subject<void>();
// Used for unsubscribing
```

### 3. Observable (Streams)
```typescript
function$(): Observable<T> {
  return this.http.get<T>(url);
}
// Cold observable, created on each subscription
```

### 4. AsyncPipe (Auto-unsubscribe)
```html
<div *ngFor="let item of items$ | async">
  {{ item.name }}
</div>
<!-- AsyncPipe automatically unsubscribes when component is destroyed -->
```

---

## 🎨 Change Detection Strategy

### OnPush (Recommended)
```typescript
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MyComponent {
  // Only runs when:
  // 1. @Input properties change
  // 2. Events fire
  // 3. Observables emit
}
```

**Benefits:**
- Better performance
- Forces immutability
- Clear data flow

---

## 🧪 Testing Architecture

### Unit Testing Pattern
```typescript
describe('MyService', () => {
  let service: MyService;
  
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MyService]
    });
    service = TestBed.inject(MyService);
  });

  it('should do something', () => {
    // Arrange
    const input = 'test';
    
    // Act
    const result = service.process(input);
    
    // Assert
    expect(result).toBe('expected');
  });
});
```

### Component Testing Pattern
```typescript
describe('MyComponent', () => {
  let component: MyComponent;
  let fixture: ComponentFixture<MyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should render title', () => {
    const title = fixture.debugElement.query(By.css('h1')).nativeElement;
    expect(title.textContent).toContain('Expected Title');
  });
});
```

---

## 📱 Responsive Design Architecture

### Breakpoints (Tailwind CSS)
- **Mobile**: < 640px (default)
- **Tablet**: 768px+ (`md:`)
- **Desktop**: 1024px+ (`lg:`)

### Responsive Components
```html
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
  <!-- 1 column on mobile, 2 on tablet, 3 on desktop -->
</div>
```

---

## 🚀 Performance Optimizations

### 1. TrackBy Functions
```typescript
trackByReviewId(index: number, review: Review): string {
  return review.id;
}

// In template
<div *ngFor="let review of reviews; trackBy: trackByReviewId">
</div>
```

### 2. Lazy Loading Routes
```typescript
{
  path: 'admin',
  loadChildren: () => import('./features/admin/admin.routes')
}
```

### 3. OnPush Change Detection
Reduces change detection cycles

### 4. Unsubscribe Pattern
Prevents memory leaks and unnecessary observables

---

## 🔗 Routing Architecture

### Main Routes (`app.routes.ts`)
```
/ → ReviewListComponent
/reviews/new → ReviewFormComponent (create)
/reviews/:id → ReviewDetailComponent
/reviews/:id/edit → ReviewFormComponent (edit)
/auth/login → LoginComponent
/auth/register → RegisterComponent
/admin → AdminDashboardComponent (lazy)
/blog → BlogRoutes (lazy)
```

### Child Routes
```typescript
{
  path: 'reviews/:id',
  children: [
    { path: '', component: DetailComponent },
    { path: 'edit', component: FormComponent },
  ]
}
```

---

## 📡 API Communication Contract

### Request Format
```typescript
GET /api/reviews?genre=fiction&rating=5&page=1&limit=10
POST /api/reviews { title, content, rating, ... }
PUT /api/reviews/:id { ... updated fields ... }
DELETE /api/reviews/:id
```

### Response Format
```typescript
{
  data: Review[],
  total: number,
  page: number,
  limit: number,
  totalPages: number
}
```

### Error Format
```typescript
{
  error: true,
  message: "Error description",
  code: "ERROR_CODE"
}
```

---

## 🎯 Design Decisions

### Why Standalone Components?
- Simpler component declaration
- Better tree-shaking
- Easier to understand dependencies
- Modern Angular approach

### Why RxJS for State?
- Powerful reactive programming
- Built-in Angular integration
- Memory leak protection with takeUntil
- Clear data flow

### Why OnPush Change Detection?
- Better performance
- Forces immutability
- Clearer component contracts
- Reduces bugs

### Why Lazy Loading?
- Smaller initial bundle
- Better perceived performance
- Scales with feature growth

---

## 🔄 Future Improvements

1. **NgRx Store** - For complex state management
2. **Error Boundary** - Component-level error handling
3. **Virtual Scrolling** - For large lists
4. **Web Workers** - For heavy computation
5. **Service Worker** - For offline support

---

*Architecture documentation for Angular 17 Book Review Blog*
