import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

export interface BreadcrumbItem {
  label: string;
  /** RouterLink commands; omit for the last (current) segment only. */
  routerLink?: unknown[];
}

/**
 * Accessible breadcrumb trail (nav + ordered list, aria-current on last item).
 */
@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [RouterLink],
  template: `
    <nav aria-label="Breadcrumb" class="mb-3">
      <ol class="flex flex-wrap items-center gap-x-1 gap-y-1 text-sm text-[var(--text-muted)] list-none p-0 m-0">
        @for (item of items(); track $index; let isLast = $last) {
          <li class="inline-flex min-w-0 max-w-full items-center gap-x-1">
            @if (isLast) {
              <span
                class="truncate font-semibold text-[var(--primary)]"
                [attr.aria-current]="'page'"
                >{{ item.label }}</span
              >
            } @else {
              @if (item.routerLink) {
                <a
                  [routerLink]="item.routerLink"
                  class="truncate font-medium text-[var(--accent-strong)] underline-offset-2 hover:text-[var(--primary)] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-strong)]"
                  >{{ item.label }}</a
                >
              } @else {
                <span class="truncate font-medium text-[var(--primary)]">{{ item.label }}</span>
              }
              <span class="mx-0.5 shrink-0 select-none text-[var(--border-light)]" aria-hidden="true">/</span>
            }
          </li>
        }
      </ol>
    </nav>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BreadcrumbComponent {
  readonly items = input.required<BreadcrumbItem[]>();
}
