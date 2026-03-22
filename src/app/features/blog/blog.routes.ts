import { Routes } from '@angular/router';

export const BLOG_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/blog-home/blog-home.component').then(
        (m) => m.BlogHomeComponent
      ),
  },
  {
    path: 'about',
    loadComponent: () =>
      import('./pages/about/about.component').then((m) => m.AboutComponent),
  },
  {
    path: 'contact',
    loadComponent: () =>
      import('./pages/contact/contact.component').then(
        (m) => m.ContactComponent
      ),
  },
  {
    path: 'contribute',
    loadComponent: () =>
      import('./pages/contribution-guide/contribution-guide.component').then(
        (m) => m.ContributionGuideComponent
      ),
  },
];

