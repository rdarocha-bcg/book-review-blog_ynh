import { Injectable } from '@angular/core';
import { environment } from '@environments/environment';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogContext {
  [key: string]: unknown;
}

/**
 * Centralised logging service.
 *
 * - In production (`environment.production === true`) only `warn` and `error`
 *   messages are emitted; debug/info are silenced.
 * - In development all levels are forwarded to the browser console.
 * - Components should inject this service instead of calling `console.*` directly.
 */
@Injectable({
  providedIn: 'root',
})
export class LoggerService {
  private readonly isProd = environment.production;

  /**
   * Debug-level message — silenced in production.
   */
  debug(message: string, context?: LogContext): void {
    if (!this.isProd) {
      // eslint-disable-next-line no-console
      console.debug(`[DEBUG] ${message}`, ...(context ? [context] : []));
    }
  }

  /**
   * Informational message — silenced in production.
   */
  log(message: string, context?: LogContext): void {
    if (!this.isProd) {
      // eslint-disable-next-line no-console
      console.log(`[INFO] ${message}`, ...(context ? [context] : []));
    }
  }

  /**
   * Warning — emitted in all environments.
   */
  warn(message: string, context?: LogContext): void {
    // eslint-disable-next-line no-console
    console.warn(`[WARN] ${message}`, ...(context ? [context] : []));
  }

  /**
   * Error — emitted in all environments.
   */
  error(message: string, err?: unknown, context?: LogContext): void {
    const extras: unknown[] = [];
    if (err !== undefined) extras.push(err);
    if (context) extras.push(context);
    // eslint-disable-next-line no-console
    console.error(`[ERROR] ${message}`, ...extras);
  }
}
