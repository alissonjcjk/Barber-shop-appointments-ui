import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withViewTransitions } from '@angular/router';

import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideNgxMask } from 'ngx-mask';

import { SERVICES_TOKEN } from './services/service.token';
import { ClientsService } from './services/api-client/clients/clients.service';
import { SchedulesService } from './services/api-client/schedules/schedules.service';
import { SnackbarManagerService } from './services/snackbar-manager.service';
import { DialogManagerService } from './services/dialog-manager.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withViewTransitions()),
    provideAnimationsAsync(),
    provideHttpClient(withInterceptorsFromDi()),
    provideNgxMask({}),

    // Injection Tokens
    { provide: SERVICES_TOKEN.HTTP.CLIENT,   useClass: ClientsService },
    { provide: SERVICES_TOKEN.HTTP.SCHEDULE, useClass: SchedulesService },
    { provide: SERVICES_TOKEN.SNACKBAR,      useClass: SnackbarManagerService },
    { provide: SERVICES_TOKEN.DIALOG,        useClass: DialogManagerService },
  ]
};
