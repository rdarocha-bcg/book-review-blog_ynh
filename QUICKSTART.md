# Quick Start Guide 🚀

For the **full local launch runbook** (Node check, API proxy, Windows port cleanup), see **[docs/LOCAL_DEV.md](./docs/LOCAL_DEV.md)**.

## 30-Second Setup

Run on **Windows natively** (PowerShell or CMD)—WSL is not required and avoids extra RAM/CPU from the Linux VM.

```powershell
cd $HOME\source\repos\newdir   # or: cd C:\Users\remid\source\repos\newdir
npm install   # first time only
npm start
# Visit http://127.0.0.1:4200
```

Done! The app is running.

---

## First Time Users - 5 Minutes

### 1. Start the App
```bash
npm start
```
Wait for "✔ Browser application bundle generation complete" message.

### 2. Open in Browser
Navigate to: `http://127.0.0.1:4200`

### 3. Create Account
- Click **Login** (top right)
- Click **Create Account** link
- Fill in the form
- Click **Create Account**

### 4. Create a Review
- Click **+ New Review** button (top right)
- Fill in review details:
  - **Review Title**: "My First Review"
  - **Book Title**: Any book title
  - **Book Author**: Author name
  - **Genre**: Select from dropdown
  - **Rating**: Choose 1-5
  - **Description**: Short summary
  - **Full Review**: Detailed review
- Click **Create Review**

### 5. View Your Review
- Click on your review in the list
- See full details page

---

## Common Tasks

### 📝 Add a New Component

```bash
ng generate component features/my-feature/components/my-component --standalone
```

Or create manually:
```
src/app/features/my-feature/components/my-component/
├── my-component.component.ts
└── my-component.component.spec.ts
```

### 🔧 Add a New Service

Create file: `src/app/core/services/my.service.ts`
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

### 🎨 Style a Component

Use Tailwind CSS classes in templates:
```html
<button class="bg-yellow-400 text-slate-900 px-4 py-2 rounded hover:bg-yellow-300">
  Click Me
</button>
```

### 🧪 Run Tests

```bash
npm test                    # Run all tests
npm test:coverage          # With coverage report
npm test -- --watch        # Watch mode
```

### 🔨 Build for Production

```bash
npm run build:prod
# Output: dist/book-review-blog/
```

---

## Project Files You'll Edit Most

| File | Purpose |
|------|---------|
| `src/app/app.routes.ts` | Main routing |
| `src/environments/environment.ts` | API configuration |
| `src/app/features/*/` | Feature components |
| `tailwind.config.js` | Styling config |

---

## API Configuration

### Update API URL for Yunohost

Edit `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'https://your-yunohost-domain.com/api',  // ← Change this
};
```

---

## Stop the Server

Press `Ctrl + C` in the terminal.

---

## Rebuild After Major Changes

If styles don't update or components don't load:
```bash
# Stop server (Ctrl + C)
npm install
npm start
```

---

## View Logs & Errors

- **Browser Console**: Press `F12`, go to Console tab
- **Terminal**: Watch terminal for build errors
- **Network**: In DevTools Network tab, check failed requests

---

## Need Help?

Read:
- `DEVELOPER_GUIDE.md` — development workflow and patterns
- `ARCHITECTURE.md` — structure and layers
- `API.md` — backend contract expected by the frontend

🔍 Search:
- Component: `src/app/shared/components/`
- Service: `src/app/core/services/`
- Feature: `src/app/features/`

---

## Debug Mode

### Check API Calls
1. Open DevTools (F12)
2. Go to Network tab
3. Perform action
4. See requests/responses

### Check Component State
1. Install Angular DevTools extension
2. Open DevTools
3. Go to Angular tab
4. Inspect components and services

### Console Logging
```typescript
console.log('My variable:', variable);
console.error('An error:', error);
```

---

## Deploy

### To Staging
```bash
npm run build:prod
# Upload dist/ folder to staging server
```

### To Yunohost
```bash
npm run build:prod
# Follow YUNOHOST_INTEGRATION.md
```

---

## Useful Commands

```bash
npm start                    # Dev server
npm run build               # Build (dev)
npm run build:prod          # Build (production)
npm test                    # Tests
npm run lint                # Code quality
npm install                 # Install dependencies
```

---

## Before You Start Editing

1. Skim `README.md` — scope and commands
2. Read `ARCHITECTURE.md` — how the app is organized
3. Follow existing feature code in `src/app/features/`
4. Use `DEVELOPER_GUIDE.md` for patterns and testing

---

## Key Locations

```
src/
├── app/
│   ├── core/              ← Services & guards
│   ├── shared/            ← Reusable components
│   ├── features/
│   │   ├── reviews/       ← Review feature
│   │   ├── auth/          ← Login/Register
│   │   ├── blog/          ← Blog pages
│   │   └── admin/         ← Admin dashboard
│   ├── app.routes.ts      ← Main routing
│   └── app.component.ts   ← Root component
└── environments/
    ├── environment.ts     ← Dev config
    └── environment.prod.ts ← Prod config
```

---

## The Essentials

### Must Know
- ✅ How to use `npm start`
- ✅ How to create components
- ✅ How to use Tailwind CSS
- ✅ How to make API calls

### Should Know
- 🟡 How services work
- 🟡 How routing works
- 🟡 How to test
- 🟡 How to handle errors

### Nice to Know
- 🔷 RxJS observables
- 🔷 Angular performance
- 🔷 Component life cycle
- 🔷 TypeScript advanced

---

## Support

### Questions?
Check the docs:
1. `DEVELOPER_GUIDE.md`
2. `ARCHITECTURE.md`
3. Existing code under `src/app/`

### Stuck?
1. Check browser console for errors
2. Check terminal for build errors
3. Read error message carefully
4. Search in documentation

### Problem with API?
Check `YUNOHOST_INTEGRATION.md`

---

## Quick Reference

### Creating Something New
```bash
# Component
ng generate component features/my-feature/pages/my-page --standalone

# Service
ng generate service core/services/my --skip-tests
```

### Styling
```html
<!-- Padding/Margin -->
<div class="p-4 m-2">

<!-- Grid (responsive) -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">

<!-- Colors -->
<button class="bg-yellow-400 text-slate-900 hover:bg-yellow-300">

<!-- Focus states (a11y) -->
<input class="focus:ring-2 focus:ring-yellow-400">
```

### Making API Calls
```typescript
// In component
constructor(private myService: MyService) {}

ngOnInit() {
  this.myService.getData().subscribe(data => {
    console.log('Data:', data);
  });
}
```

### Handling Errors
```typescript
ngOnInit() {
  this.myService.getData().pipe(
    catchError(error => {
      this.notificationService.error('Failed to load');
      return throwError(() => error);
    })
  ).subscribe(data => {
    // Use data
  });
}
```

---

## 🎉 You're Ready!

Start with `npm start` and build something awesome!

*Happy coding!* 🚀

---

*Quick Start Guide - Book Review Blog*
