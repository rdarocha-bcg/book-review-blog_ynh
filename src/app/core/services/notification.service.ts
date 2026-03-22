import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

/**
 * Notification Service
 * Handles user notifications and toasts
 */
@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private notifications$ = new BehaviorSubject<Notification[]>([]);
  private notificationId = 0;

  /**
   * Get notifications as Observable
   */
  getNotifications(): Observable<Notification[]> {
    return this.notifications$.asObservable();
  }

  /**
   * Show success notification
   */
  success(message: string, duration: number = 3000): void {
    this.add(message, 'success', duration);
  }

  /**
   * Show error notification
   */
  error(message: string, duration: number = 5000): void {
    this.add(message, 'error', duration);
  }

  /**
   * Show warning notification
   */
  warning(message: string, duration: number = 4000): void {
    this.add(message, 'warning', duration);
  }

  /**
   * Show info notification
   */
  info(message: string, duration: number = 3000): void {
    this.add(message, 'info', duration);
  }

  /**
   * Add notification
   */
  private add(
    message: string,
    type: 'success' | 'error' | 'warning' | 'info',
    duration: number
  ): void {
    const id = String(this.notificationId++);
    const notification: Notification = { id, type, message, duration };

    const current = this.notifications$.value;
    this.notifications$.next([...current, notification]);

    if (duration > 0) {
      setTimeout(() => {
        this.remove(id);
      }, duration);
    }
  }

  /**
   * Removes a notification by id (e.g. when user dismisses).
   * @param id - Notification id from Notification interface
   */
  remove(id: string): void {
    const current = this.notifications$.value;
    this.notifications$.next(current.filter((n) => n.id !== id));
  }

  /**
   * Clear all notifications
   */
  clear(): void {
    this.notifications$.next([]);
  }
}

