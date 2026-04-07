import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

export interface SelectOption {
  label: string;
  value: string | number;
}

/**
 * Reusable Form Select Component
 */
@Component({
  selector: 'app-form-select',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="mb-4">
      <label
        [for]="id"
        class="block text-sm font-semibold mb-2 text-[var(--text-dark)]"
        [attr.aria-label]="label"
      >
        {{ label }}
        <span *ngIf="required" class="text-red-600">*</span>
      </label>
      <select
        [id]="id"
        [value]="value"
        (change)="onChange($event)"
        [attr.aria-invalid]="isInvalid"
        [attr.aria-describedby]="errorId"
        class="w-full border border-[var(--border-light)] rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[var(--secondary)]"
        [class.border-red-600]="isInvalid"
      >
        <option value="">{{ placeholder }}</option>
        <option *ngFor="let option of options" [value]="option.value">
          {{ option.label }}
        </option>
      </select>
      <p *ngIf="isInvalid && errorMessage" [id]="errorId" class="text-red-600 text-sm mt-1">
        {{ errorMessage }}
      </p>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormSelectComponent {
  @Input() id: string = '';
  @Input() label: string = '';
  @Input() placeholder: string = 'Select an option';
  @Input() value: string | number = '';
  @Input() options: SelectOption[] = [];
  @Input() required: boolean = false;
  @Input() errorMessage: string = '';
  @Input() isInvalid: boolean = false;

  @Output() valueChange = new EventEmitter<string | number>();

  get errorId(): string {
    return `${this.id}-error`;
  }

  onChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const value = isNaN(+target.value) ? target.value : +target.value;
    this.valueChange.emit(value);
  }
}
