import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface ConfirmRequest {
  message: string;
  resolve: (result: boolean) => void;
}

@Injectable({ providedIn: 'root' })
export class ConfirmService {
  private subject = new Subject<ConfirmRequest>();
  readonly confirmation$ = this.subject.asObservable();
  private _resolve: ((v: boolean) => void) | null = null;

  confirm(message: string): Promise<boolean> {
    if (this._resolve) { this._resolve(false); }
    return new Promise<boolean>(resolve => {
      this._resolve = resolve;
      this.subject.next({
        message,
        resolve: (result: boolean) => {
          this._resolve = null;
          resolve(result);
        },
      });
    });
  }
}
