import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Card Component
 * Reusable card container
 */
@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [class]="getClasses()">
      <h3 *ngIf="title" class="text-lg font-semibold mb-2">{{ title }}</h3>
      <ng-content></ng-content>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardComponent {
  @Input() title: string = '';
  @Input() hoverable: boolean = false;

  getClasses(): string {
    let classes =
      'bg-[color:var(--card-bg)] border border-[var(--border-light)] rounded-2xl shadow-[0_12px_24px_-24px_rgba(122,54,95,0.55)] p-5';
    if (this.hoverable) {
      classes += ' hover:shadow-[0_15px_28px_-24px_rgba(122,54,95,0.62)] transition-shadow duration-200 cursor-pointer';
    }
    return classes;
  }
}

