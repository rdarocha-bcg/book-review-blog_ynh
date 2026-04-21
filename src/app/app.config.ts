import { APP_INITIALIZER, ApplicationConfig } from '@angular/core';
import { APP_BASE_HREF, registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import { provideRouter } from '@angular/router';

registerLocaleData(localeFr);
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { firstValueFrom } from 'rxjs';
import { routes } from './app.routes';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { SiteConfigService } from './core/services/site-config.service';
import { provideMarkdown } from 'ngx-markdown';

function appBaseHrefFactory(): string {
  const href = document.querySelector('base')?.getAttribute('href');
  return href ?? '/';
}

export const appConfig: ApplicationConfig = {
  providers: [
    { provide: APP_BASE_HREF, useFactory: appBaseHrefFactory },
    provideRouter(routes),
    provideHttpClient(withInterceptors([errorInterceptor])),
    provideAnimations(),
    provideMarkdown(),
    {
      provide: APP_INITIALIZER,
      useFactory: (site: SiteConfigService) => () => firstValueFrom(site.load()),
      deps: [SiteConfigService],
      multi: true,
    },
  ],
};
