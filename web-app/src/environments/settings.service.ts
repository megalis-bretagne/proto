import {Settings, Keycloak} from './settings';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SettingsService {
  public settings: Settings;

  constructor() {
    this.settings = new Settings();
    this.settings.keycloak = new Keycloak();
  }

  setSettings(settings: Settings): void {
    this.settings = settings;
  }

  getSetting(): Settings {
    return this.settings;
  }

  public get apiUrl(): string {
    return this.settings.apiUrl;
  }

  public get opendataToolUrl(): string {
    return this.settings.opendataToolUrl;
  }

  public get urlmarqueblanche(): string {
    return this.settings.urlmarqueblanche;
  }
}
