# Architecture - Book Review Blog

## Overview
This project is a modern Angular application for publishing and consulting book reviews. The architecture follows Angular best practices with **standalone components**, **lazy-loaded feature routes**, and a **Core / Shared / Features** structure.

## Implementation Summary

- **Angular**: Standalone components and directives; no NgModules for features. `app.config.ts` provides `provideHttpClient`, `provideRouter`, `provideAnimations`, and HTTP interceptors (`authInterceptor`, `errorInterceptor`).
- **Routing**: Root routes in `app.routes.ts`; feature routes lazy-loaded (`reviews`, `blog`, `admin`, `auth`). Admin routes protected by `AuthGuard`. Catch-all `**` maps to `NotFoundComponent`.
- **Core**: `ApiService` (HTTP wrapper), `AuthService` (login, register, logout, token/user state), `StorageService` (localStorage), `NotificationService` (toasts). Interceptors: attach JWT (`auth.interceptor.ts`), global HTTP error handling (`error.interceptor.ts`). Guards: `AuthGuard`, `RoleGuard`.
- **Shared**: Reusable UI components (Header, Footer, Button, Card, LoadingSpinner, Pagination, Notification, form controls). Shared pages: NotFound, Unauthorized, Error.
- **Features**: **Reviews** (list with pagination/filters/sort, detail, create/edit form, `ReviewService` with CRUD and state); **Auth** (login, register, password reset); **Admin** (dashboard, user management, moderation, statistics); **Blog** (home, about, contact, contribution guide).
- **Styling**: Tailwind CSS; custom palette and animations in `tailwind.config.js`; global styles in `styles.scss`.
- **Environment**: `environment.ts` / `environment.prod.ts` for API base URL and configuration.

## Project Structure

```
src/
├── app/
│   ├── core/                          # Singleton services, guards, interceptors
│   │   ├── services/
│   │   │   ├── auth.service.ts
│   │   │   ├── api.service.ts
│   │   │   └── storage.service.ts
│   │   ├── guards/
│   │   │   ├── auth.guard.ts
│   │   │   └── can-deactivate.guard.ts
│   │   ├── interceptors/
│   │   │   └── http-error.interceptor.ts
│   │   └── core.module.ts
│   │
│   ├── shared/                        # Reusable components, directives, pipes
│   │   ├── components/
│   │   │   ├── header/
│   │   │   ├── footer/
│   │   │   └── loading-spinner/
│   │   ├── directives/
│   │   ├── pipes/
│   │   └── shared.module.ts
│   │
│   ├── features/                      # Feature modules
│   │   ├── reviews/                   # Feature: Review management
│   │   │   ├── components/
│   │   │   │   ├── review-list/
│   │   │   │   ├── review-detail/
│   │   │   │   ├── review-form/
│   │   │   │   └── review-card/
│   │   │   ├── services/
│   │   │   │   └── review.service.ts
│   │   │   ├── models/
│   │   │   │   └── review.model.ts
│   │   │   ├── reviews-routing.module.ts
│   │   │   └── reviews.module.ts
│   │   │
│   │   ├── blog/                      # Feature: Blog/Pages
│   │   │   ├── components/
│   │   │   ├── services/
│   │   │   ├── models/
│   │   │   ├── blog-routing.module.ts
│   │   │   └── blog.module.ts
│   │   │
│   │   └── admin/                     # Feature: Administration
│   │       ├── components/
│   │       ├── services/
│   │       ├── admin-routing.module.ts
│   │       └── admin.module.ts
│   │
│   ├── app-routing.module.ts
│   ├── app.component.ts
│   ├── app.component.html
│   ├── app.component.css
│   └── app.module.ts
│
├── assets/
│   ├── images/
│   ├── icons/
│   └── fonts/
│
├── styles/
│   ├── global.css                     # Global styles
│   ├── tailwind.css                   # Tailwind configuration
│   └── variables.css                  # CSS variables
│
├── environments/
│   ├── environment.ts
│   └── environment.prod.ts
│
├── index.html
└── main.ts
```

## Naming Conventions

### Files and Folders
- **Folders:** kebab-case (e.g., `review-list`, `admin-panel`)
- **Component files:** `component-name.component.ts/html/css`
- **Service files:** `service-name.service.ts`
- **Model files:** `entity-name.model.ts`
- **Modules:** `feature-name.module.ts`, `feature-name-routing.module.ts`

### Classes and Interfaces
- **Components:** PascalCase with `Component` suffix (e.g., `ReviewListComponent`)
- **Services:** PascalCase with `Service` suffix (e.g., `ReviewService`)
- **Interfaces/Models:** PascalCase without suffix (e.g., `Review`, `Author`)
- **Enums:** PascalCase (e.g., `ReviewStatus`, `UserRole`)

### Variables and Functions
- **Variables/properties:** camelCase (e.g., `isLoading`, `reviewCount`)
- **Functions/methods:** camelCase (e.g., `getReviewById()`, `createReview()`)
- **Constants:** UPPER_SNAKE_CASE (e.g., `DEFAULT_PAGE_SIZE`, `API_TIMEOUT`)

## Module Architecture

### Core Module
- Imported once in `AppModule`
- Contains singleton services (AuthService, HttpClient, etc.)
- Contains global interceptors and guards
- Protection against multiple imports

### Shared Module
- Imported in feature modules
- Contains reusable components (Header, Footer, etc.)
- Contains common pipes and directives
- Lightweight and business-logic independent

### Feature Modules
- One module per major functionality (Reviews, Blog, Admin)
- Lazy-loaded for performance optimization
- Contains its own services, components, and models
- Autonomous and easily testable

## Design Principles

### 1. Single Responsibility Principle (SRP)
Each component/service has one well-defined responsibility.

### 2. Dependency Injection
- Use `providedIn: 'root'` for global services
- Use `providedIn: 'YourModule'` for module-specific services

### 3. Lazy Loading
Feature modules are lazy-loaded via routing to optimize performance.

### 4. Inter-component Communication
- Parent → Child: `@Input()`
- Child → Parent: `@Output()` and EventEmitter
- Between modules: Services with BehaviorSubject/Observable

### 5. State Management
- Simple states: Services with BehaviorSubject
- Complex states: NgRx (to be evaluated if needed)

## Service Architecture

### AuthService (Core)
- Authentication
- Token management
- Permission verification

### ReviewService (Reviews Feature)
- Retrieve reviews
- CRUD operations on reviews
- Filtering and search

### ApiService (Core)
- Communication with Yunohost backend
- Centralized HTTP calls
- Error handling

### StorageService (Core)
- Client-side data persistence
- localStorage/sessionStorage management

## Patterns Used

### Observable Pattern
- RxJS for asynchronous management
- BehaviorSubject for shared states
- Async pipe in templates for auto-subscription

### Smart/Dumb Components
- **Smart Components:** Logic management, service interaction
- **Dumb Components:** Presentation only, receive data via @Input

### OnPush Change Detection
- Used to optimize performance
- Manually for Smart Components if necessary

## Error Handling

- Centralized HTTP interceptor for error management
- Notification service for user messages
- Structured error logging

## Testing

- Unit tests with Jasmine/Karma
- Test structure: One `.spec.ts` file per test subject
- Integration tests for critical services

## Implementation Details (Current Codebase)

- **No NgModules**: The app uses standalone components only. Each feature exposes routes via `loadChildren` / `loadComponent` returning dynamic imports.
- **Path aliases**: `@core/*`, `@shared/*`, `@features/*`, `@environments/*` in `tsconfig.json` for cleaner imports.
- **Guards**: `AuthGuard` checks `AuthService.isAuthenticatedSync()` and redirects to `/auth/login`. `RoleGuard` reads `route.data['roles']` and `AuthService.getCurrentUser().role`; redirects to `/` if role not allowed.
- **Interceptors**: `auth.interceptor.ts` attaches `Authorization: Bearer <token>` when token exists. `error.interceptor.ts` handles 401 (redirect login), 403/404/500 (log).
- **ReviewService**: Uses `ApiService.get/post/put/delete`; maintains `reviews$`, `selectedReview$`, `loading$`; `getReviews()` uses `retry(2)` and returns empty pagination on error.

## Deployment

- Production build: `ng build --configuration production` or `npm run build:prod`
- Optimizations: Tree-shaking, minification, AOT; bundle budgets in `angular.json`
- Proxy: `proxy.conf.json` for local dev against Yunohost API; see YUNOHOST_INTEGRATION.md

