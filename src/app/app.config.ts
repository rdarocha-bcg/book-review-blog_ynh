import { APP_INITIALIZER, ApplicationConfig } from '@angular/core';
import { APP_BASE_HREF } from '@angular/common';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { firstValueFrom } from 'rxjs';
import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { AuthService } from './core/services/auth.service';
import { SiteConfigService } from './core/services/site-config.service';

function appBaseHrefFactory(): string {
  const href = document.querySelector('base')?.getAttribute('href');
  return href ?? '/';
}

export const appConfig: ApplicationConfig = {
  providers: [
    { provide: APP_BASE_HREF, useFactory: appBaseHrefFactory },
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor, errorInterceptor])),
    provideAnimations(),
    {
      provide: APP_INITIALIZER,
      useFactory: (site: SiteConfigService, auth: AuthService) => () =>
        firstValueFrom(site.load()).then(() => firstValueFrom(auth.loadSession())),
      deps: [SiteConfigService, AuthService],
      multi: true,
    },
  ],
};

