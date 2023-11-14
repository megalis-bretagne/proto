import { Injectable } from '@angular/core';
import {KeycloakService} from 'keycloak-angular';
import {SettingsService} from '../../environments/settings.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private keycloakService: KeycloakService,
              private settings: SettingsService)
  {}

  checkLogin(): Promise<Keycloak.KeycloakProfile> {
    return this.keycloakService.loadUserProfile();
  }

  getToken(): Promise<string> {
    return this.keycloakService.getToken();
  }


  logout(): void {
    this.keycloakService.logout(this.settings.settings.keycloak.urlLogout);
  }


}