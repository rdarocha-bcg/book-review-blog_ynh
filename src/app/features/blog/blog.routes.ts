import { Routes } from '@angular/router';

export const BLOG_ROUTES: Routes = [
  {
    path: 'about',
    loadComponent: () =>
      import('./pages/about-page/about-page.component').then(
        (m) => m.AboutPageComponent,
      ),
  },
  {
    path: 'contact',
    loadComponent: () =>
      import('./pages/contact-page/contact-page.component').then(
        (m) => m.ContactPageComponent,
      ),
  },
];
