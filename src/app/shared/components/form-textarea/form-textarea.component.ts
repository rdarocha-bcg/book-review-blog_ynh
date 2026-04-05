import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

/**
 * Reusable Form Textarea Component
 */
@Component({
  selector: 'app-form-textarea',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="mb-4">
      <label
        [for]="id"
        class="block text-sm font-semibold mb-2"
        [attr.aria-label]="label"
      >
        {{ label }}
        <span *ngIf="required" class="text-red-600">*</span>
      </label>
      <textarea
        [id]="id"
        [placeholder]="placeholder"
        [value]="value"
        [rows]="rows"
        (input)="onInput($event)"
        [attr.aria-invalid]="isInvalid"
        [attr.aria-describedby]="errorId"
        class="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
        [class.border-red-600]="isInvalid"
      ></textarea>
      <p *ngIf="isInvalid && errorMessage" [id]="errorId" class="text-red-600 text-sm mt-1">
        {{ errorMessage }}
      </p>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormTextareaComponent {
  @Input() id: string = '';
  @Input() label: string = '';
  @Input() placeholder: string = '';
  @Input() value: string = '';
  @Input() rows: number = 3;
  @Input() required: boolean = false;
  @Input() errorMessage: string = '';
  @Input() isInvalid: boolean = false;

  @Output() valueChange = new EventEmitter<string>();

  get errorId(): string {
    return `${this.id}-error`;
  }

  onInput(event: Event): void {
    const target = event.target as HTMLTextAreaElement;
    this.valueChange.emit(target.value);
  }
}
