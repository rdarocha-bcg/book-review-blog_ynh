import { Routes } from '@angular/router';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/admin-dashboard/admin-dashboard.component').then(
        (m) => m.AdminDashboardComponent
      ),
  },
  {
    path: 'stats',
    loadComponent: () =>
      import('./pages/statistics/statistics.component').then(
        (m) => m.StatisticsComponent
      ),
  },
  {
    path: 'academics',
    loadComponent: () =>
      import('./pages/admin-academics/admin-academics.component').then(
        (m) => m.AdminAcademicsComponent
      ),
  },
  {
    path: 'reviews',
    loadComponent: () =>
      import('./pages/admin-reviews/admin-reviews.component').then(
        (m) => m.AdminReviewsComponent
      ),
  },
];
