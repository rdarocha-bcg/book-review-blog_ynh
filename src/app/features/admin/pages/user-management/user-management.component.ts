import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '@core/services/api.service';
import { NotificationService } from '@core/services/notification.service';
import { LoadingSpinnerComponent } from '@shared/components/loading-spinner/loading-spinner.component';
import { Subject, takeUntil } from 'rxjs';

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt?: string;
}

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, RouterLink, LoadingSpinnerComponent],
  template: `
    <div class="page-container page-container--tight-y">
      <a routerLink="/admin" class="text-blue-600 hover:underline mb-2 inline-block">← Back to Dashboard</a>
      <h1 class="text-4xl font-bold">User Management</h1>
      <p class="text-gray-600 mt-1 mb-8">View and manage registered users.</p>

      <app-loading-spinner *ngIf="loading"></app-loading-spinner>

      <div *ngIf="!loading" class="bg-white rounded-lg shadow overflow-hidden">
        <table class="min-w-full divide-y divide-slate-200" role="table" aria-label="Users list">
          <thead class="bg-slate-50">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Name</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Email</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Role</th>
              <th scope="col" class="px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-slate-200">
            <tr *ngFor="let user of users; trackBy: trackById">
              <td class="px-6 py-4 text-sm font-medium text-slate-900">{{ user.name }}</td>
              <td class="px-6 py-4 text-sm text-slate-600">{{ user.email }}</td>
              <td class="px-6 py-4">
                <span class="px-2 py-1 text-xs rounded-full" [class.bg-blue-100]="user.role === 'admin'" [class.bg-slate-100]="user.role !== 'admin'">{{ user.role || 'user' }}</span>
              </td>
              <td class="px-6 py-4 text-right text-sm">
                <button type="button" (click)="editUser(user)" class="text-blue-600 hover:text-blue-800 font-medium mr-4" [attr.aria-label]="'Edit ' + user.email">Edit</button>
                <button type="button" *ngIf="user.role !== 'admin'" (click)="deleteUser(user)" class="text-red-600 hover:text-red-800 font-medium" [attr.aria-label]="'Delete ' + user.email">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
        <p *ngIf="users.length === 0" class="p-6 text-center text-gray-500">No users found.</p>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserManagementComponent implements OnInit, OnDestroy {
  users: AdminUser[] = [];
  loading = true;
  private destroy$ = new Subject<void>();

  constructor(private apiService: ApiService, private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadUsers(): void {
    this.loading = true;
    this.apiService.get<AdminUser[]>('admin/users').pipe(takeUntil(this.destroy$)).subscribe({
      next: (data) => {
        this.users = Array.isArray(data) ? data : [];
        this.loading = false;
      },
      error: () => {
        this.users = [];
        this.loading = false;
        this.notificationService.error('Failed to load users.');
      },
    });
  }

  editUser(user: AdminUser): void {
    this.notificationService.info(`Edit user ${user.email}: implement modal or edit page.`);
  }

  deleteUser(user: AdminUser): void {
    if (!confirm('Delete user ' + user.email + '?')) return;
    this.apiService.delete('admin/users/' + user.id).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.notificationService.success('User deleted.');
        this.loadUsers();
      },
      error: () => this.notificationService.error('Failed to delete user.'),
    });
  }

  trackById(_index: number, user: AdminUser): string {
    return user.id;
  }
}
