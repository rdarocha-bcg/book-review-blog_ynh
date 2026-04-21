import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () =>
      import('./features/home/home.routes').then((m) => m.HOME_ROUTES),
  },
  {
    path: 'about',
    loadComponent: () =>
      import('./features/blog/pages/about-page/about-page.component').then(
        (m) => m.AboutPageComponent
      ),
  },
  {
    path: 'contact',
    loadComponent: () =>
      import('./features/blog/pages/contact-page/contact-page.component').then(
        (m) => m.ContactPageComponent
      ),
  },
  {
    path: 'reviews',
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/reviews/pages/review-list/review-list.component').then(
            (m) => m.ReviewListComponent
          ),
      },
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
    path: 'academics',
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/academics/pages/academic-list/academic-list.component').then(
            (m) => m.AcademicListComponent
          ),
      },
      {
        path: 'new',
        loadComponent: () =>
          import('./features/academics/pages/academic-form/academic-form.component').then(
            (m) => m.AcademicFormComponent
          ),
      },
      {
        path: ':id',
        loadComponent: () =>
          import('./features/academics/pages/academic-detail/academic-detail.component').then(
            (m) => m.AcademicDetailComponent
          ),
      },
      {
        path: ':id/edit',
        loadComponent: () =>
          import('./features/academics/pages/academic-form/academic-form.component').then(
            (m) => m.AcademicFormComponent
          ),
      },
    ],
  },
  {
    path: 'admin',
    loadChildren: () =>
      import('./features/admin/admin.routes').then((m) => m.ADMIN_ROUTES),
  },
  {
    path: '401',
    loadComponent: () =>
      import('./shared/pages/unauthorized/unauthorized.component').then(
        (m) => m.UnauthorizedComponent
      ),
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
