import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {MaterialExampleModule} from '../material.module';
import { PastellFormComponent } from './components/pastell-form.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { DocumentsListComponent } from './documents-list/documents-list.component';
import { KeycloakAngularModule, KeycloakService } from 'keycloak-angular';
import { SettingsHttpService } from 'src/environments/settings.http.service';
import { HttpClientModule } from '@angular/common/http';
import { DashboardComponent } from './components/dashboard.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { DeliberationsComponent } from './components/deliberations.component';
import { NavbarComponent, DialogInfos } from './components/navbar.component';
import { ActesAutresComponent } from './components/actes-autres.component';
import { PastellSnackComponent } from './components/pastell-snack.component';

@NgModule({
  declarations: [
    AppComponent,
    PastellFormComponent,
    DocumentsListComponent,
    DashboardComponent,
    DeliberationsComponent,
    NavbarComponent,
    DialogInfos,
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
    FlexLayoutModule,
  ],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: app_Init,
      deps: [SettingsHttpService, KeycloakService],
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

export function app_Init(settingsHttpService: SettingsHttpService): () => Promise<any>{
  return () => settingsHttpService.initializeApp();
}
