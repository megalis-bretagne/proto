import {Injectable} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SettingsService } from './settings.service';
import { Settings } from './settings';
import {KeycloakService} from 'keycloak-angular';
@Injectable({ providedIn: 'root' })
export class SettingsHttpService {

  constructor(private http: HttpClient, private settingsService: SettingsService, private keycloak: KeycloakService) {
  }

  initializeApp(): Promise<any> {
    return new Promise(
      (resolve, reject) => {
        this.http.get('assets/settings.json')
          .toPromise()
          .then(response => {
              this.settingsService.settings = (response as Settings);
              resolve(true);
            }
          ).catch(error => {
          reject(error);
        });
      }
    ).then(async () => {
      try {
        await this.keycloak.init({
          config: {
            url: this.settingsService.settings.keycloak.issuer,
            realm: this.settingsService.settings.keycloak.realm,
            clientId: this.settingsService.settings.keycloak.clientId
          },
          // loadUserProfileAtStartUp: false,
          initOptions: {
            onLoad: 'login-required',
            checkLoginIframe: false,
          },
          bearerPrefix: 'Bearer',
          bearerExcludedUrls: []
        });
      } catch (error) {
        console.log(error);
      }
    });


  }
}
