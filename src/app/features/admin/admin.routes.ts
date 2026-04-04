import { Routes } from '@angular/router';
import { AuthGuard } from '../../core/guards/auth.guard';
import { RoleGuard } from '../../core/guards/role.guard';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/admin-dashboard/admin-dashboard.component').then(
        (m) => m.AdminDashboardComponent
      ),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['admin'] },
  },
  {
    path: 'users',
    loadComponent: () =>
      import('./pages/user-management/user-management.component').then(
        (m) => m.UserManagementComponent
      ),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['admin'] },
  },
  {
    path: 'moderation',
    loadComponent: () =>
      import('./pages/review-moderation/review-moderation.component').then(
        (m) => m.ReviewModerationComponent
      ),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['admin'] },
  },
  {
    path: 'stats',
    loadComponent: () =>
      import('./pages/statistics/statistics.component').then(
        (m) => m.StatisticsComponent
      ),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['admin'] },
  },
];

