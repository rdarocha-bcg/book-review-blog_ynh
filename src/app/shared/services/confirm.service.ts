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

  confirm(message: string): Promise<boolean> {
    return new Promise((resolve) => {
      this.subject.next({ message, resolve });
    });
  }
}
