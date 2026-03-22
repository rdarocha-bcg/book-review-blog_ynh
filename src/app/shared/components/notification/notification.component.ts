import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';
import { NotificationService, Notification } from '@core/services/notification.service';

/**
 * Notification Toast Component
 * Displays notifications/toasts from NotificationService
 */
@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  animations: [
    trigger('slideIn', [
      transition(':enter', [
        style({ transform: 'translateX(100%)', opacity: 0 }),
        animate('200ms ease-out', style({ transform: 'translateX(0)', opacity: 1 })),
      ]),
    ]),
  ],
  template: `
    <div class="fixed top-4 right-4 z-50 space-y-2 max-w-md">
      <div
        *ngFor="let notification of notifications$ | async; trackBy: trackByNotificationId"
        [@slideIn]
        [class]="getNotificationClasses(notification.type)"
        role="alert"
        [attr.aria-live]="'polite'"
        [attr.aria-atomic]="'true'"
      >
        <div class="flex items-start gap-3">
          <!-- Icon -->
          <div class="text-xl mt-1">
            <span *ngIf="notification.type === 'success'">✓</span>
            <span *ngIf="notification.type === 'error'">✕</span>
            <span *ngIf="notification.type === 'warning'">⚠</span>
            <span *ngIf="notification.type === 'info'">ℹ</span>
          </div>

          <!-- Content -->
          <div class="flex-1">
            <p class="font-semibold">{{ getNotificationTitle(notification.type) }}</p>
            <p class="text-sm mt-1">{{ notification.message }}</p>
          </div>

          <!-- Close Button -->
          <button
            (click)="removeNotification(notification.id)"
            class="text-lg font-bold opacity-70 hover:opacity-100 transition"
            [attr.aria-label]="'Close notification'"
          >
            ✕
          </button>
        </div>

        <!-- Progress Bar -->
        <div
          *ngIf="notification.duration && notification.duration > 0"
          class="mt-2 h-1 bg-current opacity-30 rounded-full overflow-hidden"
        >
          <div
            class="h-full bg-current rounded-full"
            [style.animation]="'shrink ' + notification.duration + 'ms linear'"
          ></div>
        </div>
      </div>
    </div>

    <style>
      @keyframes slideIn {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }

      @keyframes shrink {
        from {
          width: 100%;
        }
        to {
          width: 0%;
        }
      }
    </style>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationComponent {
  notifications$ = this.notificationService.getNotifications();

  constructor(private notificationService: NotificationService) {}

  /**
   * Get notification classes based on type
   */
  getNotificationClasses(type: string): string {
    const baseClasses = 'p-4 rounded-lg shadow-lg animate-slideIn text-white flex gap-3';

    const typeClasses: Record<string, string> = {
      success: 'bg-green-600',
      error: 'bg-red-600',
      warning: 'bg-yellow-600',
      info: 'bg-blue-600',
    };

    return `${baseClasses} ${typeClasses[type] || typeClasses['info']}`;
  }

  /**
   * Get notification title based on type
   */
  getNotificationTitle(type: string): string {
    const titles: Record<string, string> = {
      success: 'Success',
      error: 'Error',
      warning: 'Warning',
      info: 'Information',
    };

    return titles[type] || titles['info'];
  }

  /**
   * Remove notification
   */
  removeNotification(id: string): void {
    this.notificationService.remove(id);
  }

  /**
   * Track by notification ID for ngFor
   */
  trackByNotificationId(index: number, notification: Notification): string {
    return notification.id;
  }
}
