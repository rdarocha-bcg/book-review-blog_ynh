import {
  Component,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  forwardRef,
  Input,
  ElementRef,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

const STARS = [1, 2, 3, 4, 5] as const;

/**
 * Accessible 1–5 star rating bound to a reactive form control (numeric value).
 */
@Component({
  selector: 'app-star-rating-input',
  standalone: true,
  imports: [CommonModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => StarRatingInputComponent),
      multi: true,
    },
  ],
  template: `
    <div
      class="flex flex-wrap items-center gap-1"
      role="radiogroup"
      [attr.aria-labelledby]="labelledBy || null"
      [attr.aria-label]="labelledBy ? null : 'Rating from 1 to 5 stars'"
    >
      <button
        *ngFor="let star of stars; let i = index"
        #starBtn
        type="button"
        role="radio"
        class="inline-flex h-11 w-11 items-center justify-center rounded-full border-2 border-transparent text-2xl leading-none transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-strong)] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-45"
        [class.bg-[var(--surface-alt)]]="value === star"
        [class.border-[var(--border-light)]]="value === star"
        [attr.aria-checked]="value === star"
        [attr.tabindex]="value === star ? 0 : -1"
        [disabled]="isDisabled"
        [attr.aria-label]="'Rate ' + star + ' out of 5 stars'"
        (click)="select(star, i)"
        (keydown)="onStarKeydown($event, star, i)"
      >
        <span [class.text-[var(--accent-strong)]]="star <= value" [class.text-[var(--text-muted)]]="star > value" aria-hidden="true"
          >★</span
        >
      </button>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StarRatingInputComponent implements ControlValueAccessor {
  @Input() labelledBy = '';

  readonly stars = STARS;

  value: number = 3;
  isDisabled = false;

  @ViewChildren('starBtn') private starButtons!: QueryList<ElementRef<HTMLButtonElement>>;

  private onChange: (v: number) => void = () => {};
  private onTouched: () => void = () => {};

  constructor(private cdr: ChangeDetectorRef) {}

  writeValue(v: number | null): void {
    const n = typeof v === 'number' && !Number.isNaN(v) ? Math.min(5, Math.max(1, Math.round(v))) : 3;
    this.value = n;
    this.cdr.markForCheck();
  }

  registerOnChange(fn: (v: number) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
    this.cdr.markForCheck();
  }

  select(star: number, index: number): void {
    if (this.isDisabled) {
      return;
    }
    this.value = star;
    this.onChange(star);
    this.onTouched();
    this.cdr.markForCheck();
    this.focusIndex(index);
  }

  onStarKeydown(event: KeyboardEvent, star: number, index: number): void {
    if (this.isDisabled) {
      return;
    }
    const keys = ['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp', 'Home', 'End', ' ', 'Enter'];
    if (!keys.includes(event.key)) {
      return;
    }
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      this.select(star, index);
      return;
    }
    event.preventDefault();
    const current = this.value;
    let next = current;
    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        next = Math.min(5, current + 1);
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        next = Math.max(1, current - 1);
        break;
      case 'Home':
        next = 1;
        break;
      case 'End':
        next = 5;
        break;
      default:
        return;
    }
    if (next !== current) {
      this.value = next;
      this.onChange(next);
      this.onTouched();
      this.cdr.markForCheck();
    }
    this.focusIndex(next - 1);
  }

  private focusIndex(index: number): void {
    queueMicrotask(() => {
      const buttons = this.starButtons?.toArray() ?? [];
      const el = buttons[index]?.nativeElement;
      el?.focus();
    });
  }
}
