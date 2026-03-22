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
    let classes = 'bg-white rounded-lg shadow p-4';
    if (this.hoverable) {
      classes += ' hover:shadow-lg transition-shadow duration-200 cursor-pointer';
    }
    return classes;
  }
}

