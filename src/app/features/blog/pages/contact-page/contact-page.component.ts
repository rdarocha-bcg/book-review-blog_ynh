import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

/**
 * Contact page — static content, no injected services.
 */
@Component({
  selector: 'app-contact-page',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './contact-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactPageComponent {}
