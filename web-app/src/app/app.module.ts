import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {MaterialExampleModule} from '../material.module';
import { DeliberationsFormComponent } from './components/deliberations-form.component';
import { NoTdtFormComponent } from './components/no-tdt-form.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { DocumentsListComponent } from './documents-list/documents-list.component';
import { KeycloakAngularModule, KeycloakService } from 'keycloak-angular';
import { SettingsHttpService } from 'src/environments/settings.http.service';
import { HttpClientModule } from '@angular/common/http';
import { DashboardComponent, SafeHtmlPipe } from './components/dashboard.component';
import { DeliberationsComponent } from './components/deliberations.component';
import { NavbarComponent, DialogNavBar } from './components/navbar.component';
import { ActesAutresComponent } from './components/actes-autres.component';
import { PastellSnackComponent } from './components/pastell-snack.component';
import { SettingsService } from 'src/environments/settings.service';
import { LoggerModule, NgxLoggerLevel } from 'ngx-logger';

@NgModule({
  declarations: [
    AppComponent,
    DeliberationsComponent,
    DeliberationsFormComponent,
    NoTdtFormComponent,
    DocumentsListComponent,
    DashboardComponent,
    SafeHtmlPipe,
    NavbarComponent,
    DialogNavBar,
    PastellSnackComponent,
    ActesAutresComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MaterialExampleModule,
    FormsModule,
    ReactiveFormsModule,
    KeycloakAngularModule,
    HttpClientModule,
    LoggerModule.forRoot({ level: NgxLoggerLevel.WARN }),    
  ],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: app_Init,
      deps: [SettingsHttpService, KeycloakService, SettingsService],
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

export function app_Init(settingsHttpService: SettingsHttpService): () => Promise<any>{
  return () => settingsHttpService.initializeApp();
}
