import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

/**
 * About page — static editorial content, no injected services.
 */
@Component({
  selector: 'app-about-page',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './about-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AboutPageComponent {}
