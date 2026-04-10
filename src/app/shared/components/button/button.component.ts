import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

/**
 * Button Component
 * Reusable button component with variants
 */
@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      [class]="getClasses()"
      [disabled]="isLoading || disabled"
      (click)="onClick.emit()"
      [attr.aria-label]="ariaLabel"
    >
      <span *ngIf="!isLoading">{{ label }}</span>
      <span *ngIf="isLoading" class="flex items-center gap-2">
        <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
        Loading...
      </span>
    </button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonComponent {
  @Input() label: string = 'Button';
  @Input() variant: ButtonVariant = 'primary';
  @Input() size: ButtonSize = 'md';
  @Input() isLoading: boolean = false;
  @Input() disabled: boolean = false;
  @Input() ariaLabel: string = '';
  // eslint-disable-next-line @angular-eslint/no-output-on-prefix
  @Output() onClick = new EventEmitter<void>();

  getClasses(): string {
    const baseClasses =
      'rounded-full font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md disabled:hover:shadow-none';

    const variantClasses: Record<ButtonVariant, string> = {
      primary: 'bg-[var(--primary)] text-[var(--text-light)] hover:brightness-110',
      secondary: 'bg-[var(--secondary)] text-white hover:brightness-105',
      danger: 'bg-rose-600 text-white hover:bg-rose-700',
      ghost: 'bg-white/80 border border-[var(--border-light)] text-[var(--text-dark)] hover:bg-[var(--surface-alt)]',
    };

    const sizeClasses: Record<ButtonSize, string> = {
      sm: 'px-2 py-1 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg',
    };

    return `${baseClasses} ${variantClasses[this.variant]} ${sizeClasses[this.size]}`;
  }
}

