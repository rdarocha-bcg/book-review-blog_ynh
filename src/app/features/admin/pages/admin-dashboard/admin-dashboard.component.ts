import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

/**
 * Admin Dashboard Component
 * Overview and quick links for admin actions
 */
@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container mx-auto px-4 py-8">
      <h1 class="text-4xl font-bold mb-2">Admin Dashboard</h1>
      <p class="text-gray-600 mb-8">Manage reviews, users, and content.</p>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <a
          routerLink="/reviews/new"
          class="block p-6 bg-white rounded-lg shadow hover:shadow-lg transition border border-slate-200"
        >
          <span class="text-3xl mb-3 block">📝</span>
          <h2 class="text-xl font-semibold mb-2">Create Review</h2>
          <p class="text-sm text-gray-600">Add a new book review.</p>
        </a>

        <a
          routerLink="/"
          class="block p-6 bg-white rounded-lg shadow hover:shadow-lg transition border border-slate-200"
        >
          <span class="text-3xl mb-3 block">📚</span>
          <h2 class="text-xl font-semibold mb-2">All Reviews</h2>
          <p class="text-sm text-gray-600">View and manage all reviews.</p>
        </a>

        <a
          routerLink="/admin/users"
          class="block p-6 bg-white rounded-lg shadow hover:shadow-lg transition border border-slate-200"
          aria-label="User Management"
        >
          <span class="text-3xl mb-3 block">👥</span>
          <h2 class="text-xl font-semibold mb-2">User Management</h2>
          <p class="text-sm text-gray-600">View and manage users.</p>
        </a>

        <a
          routerLink="/admin/moderation"
          class="block p-6 bg-white rounded-lg shadow hover:shadow-lg transition border border-slate-200"
          aria-label="Review Moderation"
        >
          <span class="text-3xl mb-3 block">✓</span>
          <h2 class="text-xl font-semibold mb-2">Moderation</h2>
          <p class="text-sm text-gray-600">Approve or reject pending reviews.</p>
        </a>

        <a
          routerLink="/admin/stats"
          class="block p-6 bg-white rounded-lg shadow hover:shadow-lg transition border border-slate-200"
          aria-label="Statistics"
        >
          <span class="text-3xl mb-3 block">📊</span>
          <h2 class="text-xl font-semibold mb-2">Statistics</h2>
          <p class="text-sm text-gray-600">Overview and analytics.</p>
        </a>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminDashboardComponent {}

