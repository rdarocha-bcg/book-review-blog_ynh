import { Injectable } from '@angular/core';
import { LoggerService } from './logger.service';

/**
 * Storage Service
 * Handles localStorage operations
 */
@Injectable({
  providedIn: 'root',
})
export class StorageService {
  constructor(private logger: LoggerService) {}

  /**
   * Save data to localStorage
   */
  setItem<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      this.logger.error('Error saving to localStorage:', error, { key });
    }
  }

  /**
   * Gets a value from localStorage (parsed from JSON).
   * @param key - Storage key
   * @returns Parsed value or null if missing/invalid
   */
  getItem<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      this.logger.error('Error reading from localStorage:', error, { key });
      return null;
    }
  }

  /**
   * Remove item from localStorage
   */
  removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      this.logger.error('Error removing from localStorage:', error, { key });
    }
  }

  /**
   * Clear all localStorage
   */
  clear(): void {
    try {
      localStorage.clear();
    } catch (error) {
      this.logger.error('Error clearing localStorage:', error);
    }
  }

  /**
   * Check if key exists in localStorage
   */
  hasItem(key: string): boolean {
    return localStorage.getItem(key) !== null;
  }
}