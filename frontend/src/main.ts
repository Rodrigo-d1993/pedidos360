import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';
import { configureAmplify } from './app/core/auth/amplify-config';

configureAmplify();

bootstrapApplication(AppComponent, appConfig).catch((err) => console.error(err));
