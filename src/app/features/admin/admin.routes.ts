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
    path: 'moderation',
    loadComponent: () =>
      import('./pages/review-moderation/review-moderation.component').then(
        (m) => m.ReviewModerationComponent
      ),
  },
  {
    path: 'stats',
    loadComponent: () =>
      import('./pages/statistics/statistics.component').then(
        (m) => m.StatisticsComponent
      ),
  },
];
