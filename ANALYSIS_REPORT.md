# Analysis Report — Book Review Blog

> **Branch:** `analysis/architecture-ui-ux`
> **Date:** 2026-04-30
> **Scope:** Angular 18 frontend · Architecture · UI · UX

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Architecture Analysis](#architecture-analysis)
3. [UI Analysis](#ui-analysis)
4. [UX Analysis](#ux-analysis)
5. [Priority Matrix](#priority-matrix)

---

## Executive Summary

The **Book Review Blog** is a well-structured Angular 18 application targeting a single-operator use case (personal blog + YunoHost deployment). The codebase demonstrates solid modern Angular practices — standalone components, lazy loading, `ChangeDetectionStrategy.OnPush`, and a clean core/shared/features architecture.

**Overall scores:**

| Dimension | Score | Summary |
|-----------|-------|---------|
| Architecture | **7.5 / 10** | Clean structure, missing admin guard, fragile auth edge cases |
| UI | **7.0 / 10** | Good component quality, design consistency, accessibility gaps |
| UX | **7.0 / 10** | Solid reading flows, form/admin workflows need hardening |

**Top 3 priorities across all dimensions:**

1. 🔴 **Admin role guard missing** — any authenticated user can access `/admin` routes
2. 🔴 **Form submit UX** — no unsaved-changes warning, "cancel" goes to home not back, field errors missing after API failure
3. 🔴 **Active page indicator in header** — users have no visual cue of where they are

---

## Architecture Analysis

### 1. Folder / Module Organization

✅ Clean **Core / Shared / Features** split following Angular best practices  
✅ Consistent kebab-case folder naming  
✅ Each feature is self-contained (model + service + pages)  
✅ Core holds only infrastructure (guards, interceptors, services, models)  
✅ Shared holds only UI primitives and error pages  

⚠️ `features/blog/` contains only two static pages (about, contact) — could merge into `shared/pages/`  
⚠️ No `layout/` layer — header/footer wired directly in `AppComponent`  
⚠️ `features/admin/` could benefit from its own dedicated guards subfolder  

---

### 2. Routing Strategy

```
/ → HOME_ROUTES (lazy)
/reviews → inline children (lazy components)
/academics → inline children (lazy components)
/admin → ADMIN_ROUTES (lazy, NO admin guard ← 🔴)
/401, /404, /** → error pages
```

✅ All feature areas use `loadComponent` / `loadChildren` — full lazy loading  
✅ Protected routes (new, edit) use `canActivate: [authGuard]`  
✅ Wildcard `**` redirects to 404  

🔴 **`/admin` has no role guard** — any authenticated user can reach admin pages  
⚠️ No `canDeactivate` guard on forms — unsaved changes not blocked  
⚠️ No redirect from `/` to `/reviews` for new users  

---

### 3. Service Layer Analysis

#### ApiService
✅ Generic HTTP wrapper with proper `withCredentials: true`  
✅ Clean method signatures with generic types  

⚠️ No request timeout handling — HTTP calls can hang indefinitely  
⚠️ No request deduplication  
⚠️ No CSRF token header  

#### AuthService
✅ Elegant in-flight observable reuse (`pending$`) to prevent duplicate `/auth/me` calls  
✅ Angular signals for reactive state (`signal<AuthState | null>`)  
✅ `shareReplay(1)` on auth observable  
✅ Graceful 401 fallback (`{ authenticated: false }` rather than throwing)  

⚠️ No explicit logout method  
⚠️ Only `isAdmin()` role check — no `hasRole()` / `hasPermission()`  
🔴 SSO integration is fully implicit — no documented contract with YunoHost proxy  

#### SiteConfigService
✅ Loaded via `APP_INITIALIZER` before first render  
✅ CSS variable injection for runtime theming  
✅ Angular signals for reactive config state  
✅ Fallback defaults on load failure  

⚠️ No validation of color values from config  
⚠️ No cache-bust strategy for `assets/site.config.json`  

#### NotificationService
✅ Clean API (success / error / warning / info)  
✅ Auto-dismiss with configurable duration  
✅ BehaviorSubject for reactive updates  

⚠️ No priority queue — errors may be buried under other notifications  
⚠️ No persistence across navigation  

#### StorageService
✅ Type-safe localStorage wrapper with error handling  
⚠️ No expiration, size limits, or migration path  

---

### 4. State Management

**Approach:** BehaviorSubjects + RxJS (smart service pattern) — appropriate for this app size.

✅ Lightweight, no external library overhead  
✅ `ChangeDetectionStrategy.OnPush` used consistently  
✅ `async` pipe in templates  

⚠️ BehaviorSubjects exposed semi-publicly (should be `private` with `asObservable()` getter)  
⚠️ `ReviewListComponent` tracks `currentPage / totalItems / totalPages` locally — duplicates server state  
⚠️ No URL query param sync for pagination/filters (state lost on reload)  

---

### 5. Data Models

✅ Clean flat interfaces with pagination wrappers  
✅ Filter interfaces match all supported query params  
✅ Good consistency between Review and Academic models  

⚠️ `Date` fields typed as TypeScript `Date` but JSON deserializes as `string` — runtime mismatch  
⚠️ `genre` / `workType` are `string`, not enums — no compile-time validation  
⚠️ No DTO layer — models used directly for both API I/O and internal state  

---

### 6. Error Handling

✅ Centralised `errorInterceptor` for 401 / 403 / 404 / 500  
✅ User notifications for common error codes  
✅ Services use `retry(2)` for transient failures  

⚠️ No handling for 429 (rate limit), 502 / 503 (gateway errors)  
⚠️ Generic user-facing messages ("Server error occurred") — no context  
⚠️ No error tracking / telemetry (Sentry or similar)  
🔴 Possible race condition: interceptor redirects on 401 while authGuard still holds cached state  

---

### 7. Auth Architecture

**Flow:**
```
1. Access protected route
2. authGuard → AuthService GET /api/auth/me (cookies auto-sent)
3. authenticated=true → allow | false → redirect /401
4. Session managed by YunoHost SSO proxy
5. Session expiry → next API call returns 401 → interceptor redirects /401
```

✅ YunoHost SSO via browser cookies (`withCredentials: true`)  
✅ Simple server-driven model — no JWT or in-app login logic  

⚠️ No logout endpoint / client-side logout  
⚠️ No session expiry warning before redirect  
🔴 Admin routes unprotected by role guard  
🔴 SSO integration has no documented configuration requirements  

---

### 8. Environment Configuration

```typescript
// development:  apiUrl: '/api'
// production:   apiUrl: '/blog/api'
```

✅ Clean dev/prod separation  

⚠️ Only `apiUrl` and `production` flag — no feature flags, timeouts, log levels  
⚠️ No `IEnvironment` interface for type safety  
⚠️ Wrong `apiUrl` won't be caught until runtime  

---

### 9. app.config.ts Bootstrap

✅ `APP_INITIALIZER` ensures site config loads before render  
✅ `provideHttpClient(withInterceptors([errorInterceptor]))` correct setup  
✅ French locale registered  
✅ Markdown provider included  

⚠️ `appBaseHrefFactory` reads `<base href>` from DOM — fragile on subpath deployment  
⚠️ No error handling in `APP_INITIALIZER` — silent failure possible  
⚠️ No global error handler provider  

---

### 10. Angular Best Practices Adherence

✅ Standalone components throughout — no NgModules  
✅ `ChangeDetectionStrategy.OnPush` used consistently  
✅ `inject()` function pattern in guards  
✅ `takeUntil` unsubscription cleanup  
✅ `async` pipe in templates  
✅ Lazy loading for all feature routes  

⚠️ Some filter inputs use `[(ngModel)]` / FormsModule alongside reactive forms  
⚠️ Missing `trackBy` in some `ngFor` loops  

---

### 11. Technical Debt & Anti-Patterns

🔴 **BehaviorSubject mutability** — service state exposed without full encapsulation  
🔴 **No `canDeactivate` guard** — forms can lose data silently  
⚠️ Hardcoded genre / sort options duplicated across form and service  
⚠️ No URL state persistence for filters/pagination  
⚠️ Inconsistent error handling patterns across services  
⚠️ User-generated markdown rendered without explicit sanitization audit  

---

### 12. Missing Architecture Elements

🔴 `adminGuard` — protect `/admin` routes by role  
🔴 Query param routing — sync list filters/pagination to URL  
⚠️ `canDeactivate` guard on forms  
⚠️ DTO layer for API serialisation / date handling  
⚠️ Structured logging service (replace `console.error`)  
⚠️ SSO integration documentation  
⚠️ Environment config interface (`IEnvironment`)  

---

### Architecture Recommendations

| Priority | Item | Effort |
|----------|------|--------|
| 🔴 Critical | Add `adminGuard` for `/admin` routes | 30 min |
| 🔴 Critical | Document SSO integration requirements | 2 h |
| 🔴 Critical | Fix auth guard / interceptor race condition | 1 h |
| ⚠️ High | Sync filters/pagination to URL query params | 4 h |
| ⚠️ High | Add `canDeactivate` guard on forms | 2 h |
| ⚠️ High | Enhance error interceptor (429, 502, 503) | 3 h |
| ⚠️ Medium | Add DTO layer + date deserialiser | 5 h |
| ⚠️ Medium | Encapsulate BehaviorSubjects (private + asObservable) | 3 h |
| ⚠️ Medium | Add `IEnvironment` interface + feature flags | 2 h |
| ✅ Low | Structured logging service | 3 h |
| ✅ Low | Add input sanitization audit for markdown | 2 h |

---

## UI Analysis

### 1. Shared Components Inventory

#### ButtonComponent
✅ Well-designed API: `label`, `variant` (primary/secondary/danger/ghost), `size`, `isLoading`, `disabled`, `ariaLabel`  
✅ Loading state with spinner icon + "Loading…" text  
✅ Disabled state properly propagated  
✅ All variants maintain accessible contrast  

⚠️ `danger` variant uses Tailwind `rose-600/700` instead of CSS variables — inconsistent with design tokens  
⚠️ No icon-only variant with `aria-label` required pattern  

#### CardComponent
✅ Reusable wrapper with hover effects, border, shadow  
✅ Used consistently across reviews, academics, and home  

⚠️ Hover/focus state not distinct enough for keyboard navigation  

#### FooterComponent
✅ Semantic `role="contentinfo"`  
✅ Links to About and Contact  
⚠️ No social links  
⚠️ Copyright year hard-coded  

#### FormInputComponent / FormSelectComponent / FormTextareaComponent
✅ Required indicators (red asterisk `*`)  
✅ Error messages linked via `aria-describedby`  
✅ Focus ring on accent colour  
✅ Consistent border/radius/styling  
✅ `aria-invalid` set on error  

⚠️ Missing `aria-required="true"` (visual indicator only)  
⚠️ No field-level help text slot  
⚠️ No input mask (URLs, dates)  

#### HeaderComponent
✅ Skip-to-main-content link  
✅ `role="banner"`, `aria-label="Main navigation"`  
✅ Mobile menu: `role="dialog"`, `aria-modal="true"`, focus trap, Escape to close  
✅ Mobile menu closes on route change  
✅ Keyboard-accessible hamburger button  

⚠️ **No active page styling** — `routerLinkActive` not applied  
⚠️ Admin link visible to all users  
⚠️ Mobile menu appears without animation (jarring)  

#### LoadingSpinnerComponent
✅ `role="status"`, `aria-live="polite"`  
✅ Screen-reader text "Loading…" (`.sr-only`)  
⚠️ No size variants  

#### NotificationComponent
✅ 4 types with distinct colours and icons  
✅ Auto-dismiss with animated progress bar  
✅ `role="alert"`, `aria-live="polite"`, `aria-atomic="true"`  
✅ `prefers-reduced-motion` respected  
⚠️ Emoji icons read aloud by screen readers — add `aria-hidden`  
⚠️ May stack/overflow on very small screens  

#### PaginationComponent
✅ Full ARIA: descriptive `aria-label` on all buttons  
✅ Shows "Showing X to Y of Z items"  
✅ Mobile: hides page numbers, shows "Page X of Y"  
✅ Items-per-page selector included  
⚠️ `.pinterest-panel` class referenced but not defined locally  

#### ReviewCardSkeletonComponent
✅ Staggered pulse animation (0.08 s offset per child)  
✅ `prefers-reduced-motion` respected  
✅ `aria-hidden="true"` (decorative)  
⚠️ Hard-coded 9 shimmer lines — can't adapt to different card heights  
⚠️ Used for both reviews and academics despite component name  

#### StarRatingInputComponent
✅ Accessible `role="radiogroup"` + `role="radio"` pattern  
✅ Full keyboard support (arrows, Home/End, Space/Enter)  
✅ Roving tabindex pattern  
✅ Implements `ControlValueAccessor`  
✅ Respects disabled state  
⚠️ No "clear rating" / null option visible  
⚠️ `labelledBy` input has no fallback validation  

---

### 2. Feature Pages Assessment

#### Review List
✅ Multi-filter: search (debounced 350 ms), genre, rating, sort  
✅ Skeleton loaders, error state with retry, empty state, ARIA live region  
✅ Masonry card layout (1→2→3 columns)  

⚠️ FormsModule two-way binding mixed with reactive forms pattern  
⚠️ No "filters active" visual indicator  
🔴 Raw error text displayed without sanitization  

#### Review Detail
✅ Markdown prose rendering, back navigation, image placeholder, metadata sidebar  
✅ 404 state with friendly message and home CTA  
✅ Semantic `<article>` wrapper  
⚠️ No edit/delete button for admin  
⚠️ No related reviews section  

#### Review Form
✅ Reactive form, character counter (300), genre select, star rating, publish checkbox  
✅ Two-mode (create/edit) with data pre-fill  
⚠️ No `canDeactivate` guard  
⚠️ "Cancel" navigates to `/` not back to review  
⚠️ URL field has no format validation  

#### Academic List / Detail
✅ Mirrors review list structure (good consistency)  
✅ Detail has edit button, markdown rendering, metadata  
⚠️ Same filter issues as review list  
⚠️ Generic pulse skeleton on detail (not using ReviewCardSkeleton)  

#### Academic Form
✅ Edit/Preview tabs for markdown  
✅ Image upload with markdown insertion  
✅ Summary character counter with overflow warning  
⚠️ No image preview after upload  
⚠️ `cursor.setSelectionRange` restored via `setTimeout` (timing-dependent)  

#### Home Page
✅ Hero with CTAs, featured sections with skeleton loaders and empty states  
✅ Semantic `<section aria-labelledby>`  
⚠️ "À la une" label may not be clear to all users  

#### Admin Dashboard / Statistics / Admin Academics
✅ Quick-access action cards  
✅ Admin academics: publish/unpublish toggle, delete with confirm, edit  
⚠️ Statistics page is just a link to external Umami — no inline data  
⚠️ Delete uses `window.confirm()` (browser dialog) — not styled  
⚠️ No sorting/filtering in admin academics list  

#### Error / 404 / 401 Pages
✅ Friendly emoji and messaging, home CTA  
✅ 401 explains YunoHost SSO context  
⚠️ `error.component` generic but not wired to routing  

---

### 3. Design Consistency

**Color tokens:**
- Primary: `#7a365f` (plum)
- Secondary: `#d56fa1` (rose)
- Accent: `#f3b9d4` (light pink)
- Text: `#3d2031` (dark), `#463540` (muted)

✅ CSS variables used throughout — consistent design tokens  
✅ Inter (body) + Cormorant Garamond (headings) — elegant pairing  
✅ WCAG AA contrast ratios met for body text and links  
✅ Consistent spacing (Tailwind scale), border-radius (`rounded-xl`), shadows  

⚠️ `danger` button variant uses Tailwind colour names instead of CSS variables  
⚠️ No dark mode  
⚠️ Some inline styles in admin components (publish indicator)  

---

### 4. Accessibility

✅ ARIA coverage: `role="banner/contentinfo/navigation/alert/status/dialog/radiogroup"`  
✅ Skip-to-main-content link  
✅ Form inputs: `aria-label`, `aria-invalid`, `aria-describedby`  
✅ Star rating: full keyboard + roving tabindex  
✅ Mobile menu: focus trap, Escape, focus restoration  
✅ Images have `alt` text  
✅ `prefers-reduced-motion` respected in skeleton and notifications  

⚠️ Missing `aria-required="true"` on required inputs  
⚠️ Emoji in notification icons not `aria-hidden`  
⚠️ Tabs in academic form lack keyboard arrow navigation  
⚠️ No `<main>` wrapper on some pages  

---

### 5. Responsive Design

✅ Mobile-first with `sm:` / `md:` / `xl:` breakpoints  
✅ Review/academic grids: 1→2→3 columns  
✅ Pagination hides page numbers on mobile  
✅ Minimum 44 px touch targets on buttons  

⚠️ CSS columns masonry layout may not reflow optimally on all devices  
⚠️ Pagination row can overflow on very small screens  
⚠️ Tab interface in academic form not ideal for mobile  

---

### 6. Loading & Skeleton States

✅ ReviewCardSkeleton with staggered animation in lists and home sections  
✅ LoadingSpinner in detail pages and form submissions  
✅ `aria-busy` on loading regions  

⚠️ Academic detail uses generic CSS pulse instead of ReviewCardSkeleton  
⚠️ Skeleton card dimensions hard-coded (may cause layout shift)  
⚠️ No skeleton for form edit page initial load  

---

### 7. Component Reusability Gaps

⚠️ `ReviewListComponent` and `AcademicListComponent` share ~80% logic — candidate for generic `ListPageComponent<T>`  
⚠️ `ReviewDetailComponent` and `AcademicDetailComponent` share layout — candidate for `DetailPageComponent<T>`  
⚠️ FormInput / FormSelect / FormTextarea share ARIA/validation pattern — candidate for base `FormControlComponent`  

---

### UI Recommendations

| Priority | Item | Effort |
|----------|------|--------|
| 🔴 Critical | Add `routerLinkActive` active indicator in header | 30 min |
| 🔴 Critical | Hide admin link from unauthenticated users | 1 h |
| 🔴 Critical | Add `aria-required="true"` to all required inputs | 30 min |
| 🔴 Critical | Sanitize raw error text in review list | 30 min |
| ⚠️ High | Add edit/delete admin buttons to review detail | 2 h |
| ⚠️ High | Add mobile menu slide-in animation | 1 h |
| ⚠️ High | Add image upload preview to academic form | 2 h |
| ⚠️ High | `aria-hidden` emoji icons in notifications | 15 min |
| ⚠️ Medium | Extract generic `ListPageComponent<T>` | 6 h |
| ⚠️ Medium | Replace `window.confirm` with styled modal in admin | 2 h |
| ⚠️ Medium | Replace `danger` variant hardcoded colours with CSS vars | 30 min |
| ✅ Low | Add dark mode support | 8 h |
| ✅ Low | Keyboard arrow navigation for academic form tabs | 1 h |
| ✅ Low | Dynamic copyright year in footer | 15 min |

---

## UX Analysis

### 1. Information Architecture

✅ Clear hierarchy: Home → Reviews → Academics → Admin  
✅ Featured content on homepage surfaces key items immediately  
✅ Two distinct user roles separated: reader vs. admin  

⚠️ Admin link visible in nav for all users — may confuse non-admin visitors  
⚠️ "Travaux académiques" purpose not immediately obvious to casual visitors  
⚠️ No breadcrumbs across the site  

---

### 2. Navigation UX

✅ Skip-to-main-content link  
✅ Mobile hamburger with focus trap + Escape to close  
✅ Back navigation on detail pages ("← Retour aux critiques")  
✅ Nav closes on route change  

⚠️ **No active page styling** — users can't tell where they are  
⚠️ No page-number info on pagination ("Page 2 of 5")  
🔴 Pagination changes do not scroll-to-top — users may not realise content changed  

---

### 3. Authentication UX

✅ authGuard blocks protected routes  
✅ 401 page explains YunoHost SSO requirement  
✅ Toast notifications for success/error  
✅ Edit forms pre-fill with existing data  

⚠️ No session expiry warning before redirect  
⚠️ No logout button in-app  
🔴 Redirect on failed auth goes to static `/401` page — no recovery flow  

---

### 4. Content Browsing UX

✅ Review list: search (debounced), genre filter, rating filter, sort  
✅ Skeleton loaders during load  
✅ Empty state messaging  
✅ Error state with retry button  
✅ Responsive grid (1→2→3 columns)  

⚠️ Hardcoded genre list (Fiction, Non-fiction, Policier, Romance) — may be incomplete  
⚠️ No search result count before selecting  
🔴 No scroll-to-top or visual cue when pagination changes  

---

### 5. Review Detail UX

✅ Clean reading layout, markdown prose rendering  
✅ Star rating displayed prominently  
✅ Semantic `<article>` wrapper  
✅ 404 "not found" state with home CTA  

⚠️ No "read next" / related reviews  
⚠️ No edit button for admin on review detail (only academic detail has one)  
⚠️ No breadcrumb navigation  

---

### 6. Review Creation/Editing UX

✅ Inline validation on blur (`dirty || touched`)  
✅ Character counter for description (300 max)  
✅ Mode-aware title (Créer vs. Modifier)  
✅ Cancel button available  

🔴 **"Cancel" navigates to `/`** instead of back to the review  
🔴 **No unsaved-changes warning** on navigation away  
🔴 API save errors show generic "Impossible d'enregistrer" — no field-level feedback  
⚠️ Publish status checkbox at bottom — easily missed by admins  
⚠️ No markdown preview in review form (unlike academic form)  

---

### 7. Academic Section UX

✅ Consistent structure to reviews (list/detail/form)  
✅ Edit/Preview tabs in form  
✅ Featured checkbox for homepage promotion  

⚠️ "Travaux académiques" terminology unclear to casual visitors  
⚠️ Hardcoded theme/work-type options  
🔴 Image upload implementation incomplete — no preview, cursor restore via `setTimeout`  

---

### 8. Admin UX

✅ Dashboard with quick-access cards  
✅ Admin academics: publish/unpublish, delete, edit per item  

⚠️ Dashboard shows no stats summary (total reviews, recent activity)  
⚠️ Statistics page is only an external Umami link  
🔴 No interface to delete reviews from admin  
🔴 No bulk actions (publish all, delete drafts)  
🔴 `window.confirm` for delete — not keyboard-friendly, no undo  

---

### 9. Error States UX

✅ 404 page: friendly emoji, clear message, home CTA  
✅ 401 page: explains SSO requirement  
✅ List error state: retry button  
✅ All error pages have recovery CTAs  

⚠️ No distinct 403 Forbidden page  
⚠️ `error.component` exists but is not wired to routing  
🔴 API error messages shown verbatim to user — may expose technical details  

---

### 10. Loading States UX

✅ Skeleton loaders in review/academic lists and home sections  
✅ LoadingSpinner in detail pages  
✅ Button loading state with spinner  
✅ `aria-busy`, `aria-live="polite"` on async regions  

⚠️ No scroll-to-top on pagination → user may not notice new content  
⚠️ No loading state for review form edit initial data load  
⚠️ Skeleton card dimensions don't match actual card height (layout shift)  

---

### 11. Mobile UX

✅ Responsive grids (1→2→3 columns)  
✅ Mobile hamburger menu with full focus management  
✅ 44 px minimum touch targets  
✅ Pagination collapses on mobile  

⚠️ Pagination row can overflow on very small screens  
⚠️ Tab interface in academic form is hard to use on mobile  
⚠️ Image upload button may be difficult to tap on mobile  

---

### 12. Feedback & Notifications

✅ 4 notification types with auto-dismiss and progress bar  
✅ `prefers-reduced-motion` respected  
✅ Manual close button  

⚠️ No "undo" option after destructive actions  
⚠️ No notification on successful edit save (only navigation)  
⚠️ Form validation uses inline text only — no toast for submit failures  

---

### 13. Onboarding / Discoverability

✅ Hero with tagline "Critiques littéraires & travaux académiques"  
✅ Featured content immediately visible on home  
✅ About page explains site purpose  
✅ Clear CTAs: "Découvrir les critiques" and "Travaux académiques"  

⚠️ Admin link in nav confuses non-admin first-time visitors  
⚠️ Contact page not prominently linked from most pages  
⚠️ Academics section purpose less obvious than reviews  

---

### 14. Accessibility as UX

✅ 139+ ARIA attributes across codebase  
✅ Skip-to-main-content link  
✅ Mobile menu focus trap and Escape handling  
✅ Star rating full keyboard support  
✅ `aria-live` on dynamic regions  

⚠️ Missing `aria-required` on form inputs  
⚠️ Emoji in notifications not `aria-hidden`  
⚠️ Tabs in academic form missing arrow-key keyboard navigation  
⚠️ No color-independent indicators (rating/genre rely on color alone in some views)  

---

### UX Recommendations

| Priority | Item | Impact |
|----------|------|--------|
| 🔴 Critical | Fix "Cancel" in forms (navigate back, not home) | High |
| 🔴 Critical | Add `canDeactivate` unsaved-changes guard on forms | High |
| 🔴 Critical | Scroll-to-top on pagination change | High |
| 🔴 Critical | Add review delete + bulk actions to admin | High |
| 🔴 Critical | Show API field-level errors in forms | High |
| ⚠️ High | Add active page indicator in header | High |
| ⚠️ High | Add edit button on review detail (admin only) | High |
| ⚠️ High | Add breadcrumb navigation on detail pages | Medium |
| ⚠️ High | Session expiry warning + in-app logout | Medium |
| ⚠️ Medium | Replace `window.confirm` with styled modal + undo toast | Medium |
| ⚠️ Medium | Add markdown preview to review form | Medium |
| ⚠️ Medium | Complete image upload (preview + progress) | Medium |
| ⚠️ Medium | Show notification on successful edit save | Low |
| ✅ Low | Add "related reviews" section on review detail | Low |
| ✅ Low | Add inline analytics summary to admin dashboard | Low |
| ✅ Low | Expose contact page link more prominently | Low |

---

## Priority Matrix

All findings consolidated and ranked by **Risk × Impact**.

### 🔴 Critical — Address Immediately

| # | Finding | Dimension | Effort |
|---|---------|-----------|--------|
| C1 | **Add `adminGuard`** — any auth user can access `/admin` | Architecture | 30 min |
| C2 | **Active page indicator** — no `routerLinkActive` in header | UI / UX | 30 min |
| C3 | **Form "Cancel" navigates to `/`** instead of back | UX | 1 h |
| C4 | **No `canDeactivate`** guard — unsaved form data silently lost | Architecture / UX | 2 h |
| C5 | **API errors show verbatim** to user (info leak + bad UX) | UX | 2 h |
| C6 | **No review delete in admin** — only academic delete exists | UX | 3 h |
| C7 | **Admin link visible to all** users (confusing + security posture) | UI / UX | 1 h |
| C8 | **`aria-required`** missing on all required form inputs | UI / Accessibility | 30 min |
| C9 | **Emoji icons** in notifications not `aria-hidden` | UI / Accessibility | 15 min |

### ⚠️ High — Next Sprint

| # | Finding | Dimension | Effort |
|---|---------|-----------|--------|
| H1 | Scroll-to-top on pagination change | UX | 1 h |
| H2 | Sync filters/pagination to URL query params | Architecture / UX | 4 h |
| H3 | Auth/interceptor race condition on session expiry | Architecture | 1 h |
| H4 | Session expiry warning + in-app logout | UX | 2 h |
| H5 | Edit button on review detail (admin only) | UI / UX | 2 h |
| H6 | Mobile menu slide-in animation | UI | 1 h |
| H7 | Image upload preview + progress in academic form | UI / UX | 2 h |
| H8 | Replace `window.confirm` delete with styled modal | UI / UX | 2 h |
| H9 | Enhance error interceptor (429, 502, 503 + retry) | Architecture | 3 h |
| H10 | `canDeactivate` guard on all form routes | Architecture | 2 h |
| H11 | Document SSO integration requirements | Architecture | 2 h |

### ✅ Medium — Backlog

| # | Finding | Dimension | Effort |
|---|---------|-----------|--------|
| M1 | Add breadcrumb navigation on detail/edit pages | UX | 3 h |
| M2 | Extract generic `ListPageComponent<T>` | Architecture / UI | 6 h |
| M3 | Add DTO layer + date deserialiser | Architecture | 5 h |
| M4 | Encapsulate BehaviorSubjects (private + asObservable) | Architecture | 3 h |
| M5 | Markdown preview in review form | UI / UX | 2 h |
| M6 | Add `IEnvironment` interface + feature flags | Architecture | 2 h |
| M7 | Notification on successful edit save | UX | 30 min |
| M8 | Inline analytics summary in admin dashboard | UX | 4 h |
| M9 | Add tabs keyboard arrow navigation (academic form) | UI / Accessibility | 1 h |
| M10 | Sanitize raw error text in review list display | UI / Security | 30 min |

### 💡 Low — Nice-to-Have

| # | Finding | Effort |
|---|---------|--------|
| L1 | Dark mode support | 8 h |
| L2 | "Related reviews" section on review detail | 4 h |
| L3 | Structured logging service | 3 h |
| L4 | i18n framework if multi-language needed | 8 h |
| L5 | E2E tests (Playwright) for critical flows | 8 h |
| L6 | Dynamic copyright year in footer | 15 min |
| L7 | Replace `danger` button hardcoded colours with CSS vars | 30 min |
