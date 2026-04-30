import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  signal,
  HostListener,
  ElementRef,
} from '@angular/core';
import { ConfirmService, ConfirmRequest } from '@shared/services/confirm.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [],
  template: `
    @if (pending()) {
      <div
        class="fixed inset-0 z-[9999] flex items-center justify-center"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
      >
        <!-- Backdrop -->
        <div
          class="absolute inset-0 bg-black/50 backdrop-blur-sm"
          (click)="cancel()"
          aria-hidden="true"
        ></div>

        <!-- Dialog panel -->
        <div
          class="relative z-10 bg-[var(--surface,#fff)] border border-[var(--border-light,#e2d9e9)] rounded-2xl shadow-xl p-8 max-w-sm w-full mx-4"
        >
          <h2
            id="confirm-dialog-title"
            class="text-xl font-bold text-[var(--primary)] mb-4"
          >Confirmation</h2>

          <p class="text-[var(--text-dark)] mb-6">{{ pending()!.message }}</p>

          <div class="flex gap-3 justify-end">
            <button
              type="button"
              (click)="cancel()"
              class="px-5 py-2 rounded-lg border border-[var(--border-light)] bg-[var(--surface-alt,#f9f5fb)] text-[var(--text-dark)] font-semibold hover:brightness-95 transition focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2"
            >Annuler</button>
            <button
              type="button"
              (click)="confirm()"
              class="px-5 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2"
            >Confirmer</button>
          </div>
        </div>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmDialogComponent implements OnInit, OnDestroy {
  protected readonly pending = signal<ConfirmRequest | null>(null);
  private subscription?: Subscription;

  constructor(
    private confirmService: ConfirmService,
    private el: ElementRef<HTMLElement>,
  ) {}

  ngOnInit(): void {
    this.subscription = this.confirmService.confirmation$.subscribe((request) => {
      this.pending.set(request);
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  @HostListener('keydown', ['$event'])
  onKeydown(e: KeyboardEvent): void {
    if (e.key === 'Escape') { this.cancel(); return; }
    if (e.key !== 'Tab') return;
    const focusable = this.el.nativeElement.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey ? document.activeElement === first : document.activeElement === last) {
      e.preventDefault();
      (e.shiftKey ? last : first).focus();
    }
  }

  protected confirm(): void {
    const current = this.pending();
    if (current) {
      this.pending.set(null);
      current.resolve(true);
    }
  }

  protected cancel(): void {
    const current = this.pending();
    if (current) {
      this.pending.set(null);
      current.resolve(false);
    }
  }
}
