import { Component, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { Subject } from 'rxjs';

/**
 * Header Component
 * Navigation and user menu
 */
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <header class="bg-slate-900 text-white shadow-lg" role="banner">
      <a href="#main-content" class="skip-link">Skip to main content</a>
      <nav class="container mx-auto px-4 py-4 flex items-center justify-between" aria-label="Main navigation">
        <div class="flex items-center gap-8">
          <a routerLink="/" class="text-2xl font-bold" aria-label="BookReview home">📚 BookReview</a>
          <ul class="hidden md:flex gap-6" role="menubar">
            <li role="none"><a routerLink="/" class="hover:text-yellow-400 transition" role="menuitem">Home</a></li>
            <li role="none"><a routerLink="/blog" class="hover:text-yellow-400 transition" role="menuitem">Blog</a></li>
            <li *ngIf="isAuthenticated$ | async" role="none">
              <a routerLink="/admin" class="hover:text-yellow-400 transition" role="menuitem">Admin</a>
            </li>
          </ul>
        </div>
        <div class="flex items-center gap-4">
          <div *ngIf="currentUser$ | async as user" class="text-sm">
            Welcome, {{ user.name || user.email }}
          </div>
          <button
            *ngIf="isAuthenticated$ | async"
            routerLink="/reviews/new"
            class="bg-green-600 text-white px-4 py-2 rounded font-semibold hover:bg-green-700 transition"
            aria-label="Create new review"
          >
            + New Review
          </button>
          <button
            *ngIf="(isAuthenticated$ | async) === false"
            routerLink="/login"
            class="bg-yellow-400 text-slate-900 px-4 py-2 rounded font-semibold hover:bg-yellow-300 transition"
            aria-label="Login"
          >
            Login
          </button>
          <button
            *ngIf="isAuthenticated$ | async"
            (click)="logout()"
            class="bg-red-600 px-4 py-2 rounded font-semibold hover:bg-red-700 transition"
            aria-label="Logout"
          >
            Logout
          </button>
        </div>
      </nav>
    </header>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent implements OnDestroy {
  isAuthenticated$ = this.authService.isAuthenticated();
  currentUser$ = this.authService.getCurrentUser$();
  private destroy$ = new Subject<void>();

  constructor(private authService: AuthService) {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  logout(): void {
    this.authService.logout();
  }
}

