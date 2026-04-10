import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '@core/services/api.service';
import { LoadingSpinnerComponent } from '@shared/components/loading-spinner/loading-spinner.component';
import { Subject, takeUntil } from 'rxjs';

export interface AdminStats {
  totalReviews?: number;
  totalUsers?: number;
  pendingReviews?: number;
  publishedReviews?: number;
  reviewsByGenre?: Record<string, number>;
}

/**
 * Statistics / Analytics Component
 * Dashboard stats (reviews, users, etc.).
 */
@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [CommonModule, RouterLink, LoadingSpinnerComponent],
  template: `
    <div class="page-container page-container--tight-y">
      <div class="mb-8">
        <a routerLink="/admin" class="text-blue-600 hover:underline mb-2 inline-block">← Back to Dashboard</a>
        <h1 class="text-4xl font-bold">Statistics</h1>
        <p class="text-gray-600 mt-1">Overview of content and usage.</p>
      </div>

      <app-loading-spinner *ngIf="loading"></app-loading-spinner>

      <div *ngIf="!loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div class="bg-white rounded-lg shadow p-6 border border-slate-200">
          <p class="text-sm font-semibold text-gray-500 uppercase tracking-wider">Total Reviews</p>
          <p class="text-3xl font-bold mt-1" aria-live="polite">{{ stats.totalReviews ?? 0 }}</p>
        </div>
        <div class="bg-white rounded-lg shadow p-6 border border-slate-200">
          <p class="text-sm font-semibold text-gray-500 uppercase tracking-wider">Published</p>
          <p class="text-3xl font-bold mt-1" aria-live="polite">{{ stats.publishedReviews ?? 0 }}</p>
        </div>
        <div class="bg-white rounded-lg shadow p-6 border border-slate-200">
          <p class="text-sm font-semibold text-gray-500 uppercase tracking-wider">Pending</p>
          <p class="text-3xl font-bold mt-1" aria-live="polite">{{ stats.pendingReviews ?? 0 }}</p>
        </div>
        <div class="bg-white rounded-lg shadow p-6 border border-slate-200">
          <p class="text-sm font-semibold text-gray-500 uppercase tracking-wider">Total Users</p>
          <p class="text-3xl font-bold mt-1" aria-live="polite">{{ stats.totalUsers ?? 0 }}</p>
        </div>
      </div>

      <div *ngIf="!loading && genreCounts.length > 0" class="mt-8 bg-white rounded-lg shadow p-6 border border-slate-200">
        <h2 class="text-xl font-semibold mb-4">Reviews by Genre</h2>
        <ul class="space-y-2" role="list">
          <li *ngFor="let g of genreCounts" class="flex justify-between items-center py-2 border-b border-slate-100 last:border-0">
            <span class="font-medium capitalize">{{ g.genre }}</span>
            <span class="text-gray-600">{{ g.count }}</span>
          </li>
        </ul>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatisticsComponent implements OnInit, OnDestroy {
  stats: AdminStats = {};
  loading = true;
  genreCounts: { genre: string; count: number }[] = [];
  private destroy$ = new Subject<void>();

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadStats();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadStats(): void {
    this.loading = true;
    this.apiService
      .get<AdminStats>('admin/stats')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.stats = data || {};
          this.genreCounts = this.stats.reviewsByGenre
            ? Object.entries(this.stats.reviewsByGenre).map(([genre, count]) => ({ genre, count }))
            : [];
          this.loading = false;
        },
        error: () => {
          this.stats = {};
          this.loading = false;
        },
      });
  }
}
