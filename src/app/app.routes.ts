import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/reviews/pages/review-list/review-list.component').then(
        (m) => m.ReviewListComponent
      ),
  },
  {
    path: 'reviews',
    children: [
      {
        path: 'new',
        loadComponent: () =>
          import('./features/reviews/pages/review-form/review-form.component').then(
            (m) => m.ReviewFormComponent
          ),
      },
      {
        path: ':id',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./features/reviews/pages/review-detail/review-detail.component').then(
                (m) => m.ReviewDetailComponent
              ),
          },
          {
            path: 'edit',
            loadComponent: () =>
              import('./features/reviews/pages/review-form/review-form.component').then(
                (m) => m.ReviewFormComponent
              ),
          },
        ],
      },
    ],
  },
  {
    path: 'auth',
    loadChildren: () =>
      import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },
  {
    path: 'login',
    redirectTo: '/auth/login',
    pathMatch: 'full',
  },
  {
    path: 'register',
    redirectTo: '/auth/register',
    pathMatch: 'full',
  },
  {
    path: 'forgot-password',
    redirectTo: '/auth/forgot-password',
    pathMatch: 'full',
  },
  {
    path: 'admin',
    loadChildren: () =>
      import('./features/admin/admin.routes').then((m) => m.ADMIN_ROUTES),
  },
  {
    path: 'blog',
    loadChildren: () =>
      import('./features/blog/blog.routes').then((m) => m.BLOG_ROUTES),
  },
  {
    path: '404',
    loadComponent: () =>
      import('./shared/pages/not-found/not-found.component').then(
        (m) => m.NotFoundComponent
      ),
  },
  {
    path: '**',
    loadComponent: () =>
      import('./shared/pages/not-found/not-found.component').then(
        (m) => m.NotFoundComponent
      ),
  },
];

