import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SettingsService } from './settings.service';
import { Settings } from './settings';
import { KeycloakService } from 'keycloak-angular';
import { firstValueFrom } from 'rxjs';
import { NGXLogger, NgxLoggerLevel } from 'ngx-logger';

@Injectable({ providedIn: 'root' })
export class SettingsHttpService {
  
  constructor(private http: HttpClient, private _settingsService: SettingsService, private _keycloak: KeycloakService, private _logger: NGXLogger) {
  }

  initializeApp(): Promise<any> {
    return new Promise((resolve, reject) => {
      firstValueFrom(this.http.get('assets/settings.json'))
        .then((response) => {
          this._settingsService.setSettings(response as Settings);
          resolve(true);
        })
        .catch((error) => {
          reject(error);
        });
    }).then(async () => {
      const is_in_production = this._settingsService.getSetting().production;
      if (is_in_production) {
        this._logger.partialUpdateConfig({ level: NgxLoggerLevel.WARN, disableFileDetails: true });
      }
      else {
        this._logger.partialUpdateConfig({ level: NgxLoggerLevel.TRACE, enableSourceMaps: true });
        this._logger.info("Application en mode développement. Les logs sont en mode trace");
      }
    }).then(async () => {
      try {
        return await this._keycloak.init({
          config: {
            url: this._settingsService.settings.keycloak.issuer,
            realm: this._settingsService.settings.keycloak.realm,
            clientId: this._settingsService.settings.keycloak.clientId
          },
          initOptions: {
            onLoad: 'login-required',
            checkLoginIframe: false,
          },
          bearerPrefix: 'Bearer',
          enableBearerInterceptor: true,
          bearerExcludedUrls: ['/assets'], // C'est une API publique,
          // Il est nécessaire de les whitelister pour ne pas
          // être redirigé vers la page de login de keycloak
        });
      } catch (error) {
        throw new Error("Une erreur s'est déroulée durant l'initialisation de keycloak");
      }
    });


  }
}