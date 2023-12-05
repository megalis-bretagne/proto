import { Component, OnInit, Inject } from '@angular/core';
import { ApiClientService } from '../api-client.service';
import { AuthService } from '../services/auth.service';
import { environment } from 'src/environments/environment';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { SettingsService } from 'src/environments/settings.service';
import { NGXLogger } from 'ngx-logger';

export interface DialogData {
  version: string;
  pastellVersion: string;
  repository: string;
  dialogId: string;
  user: string;
  organisme: string;
  title:string;
}


@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {

  version: string;
  pastellVersion: string;
  user: string;
  organisme: string;
  opendataToolUrl: string;
  marqueBlancheUrl: string;
  repositoryUrl: string;

  constructor(
    private keycloakAuthService : AuthService,
    private apiClient: ApiClientService,
    public dialog: MatDialog,
    private _logger: NGXLogger,
    readonly settings: SettingsService,
  ) {
    this.version = environment.version;
    this.pastellVersion = 'Non synchronisé';
    this.user = '';
    this.organisme = '';
    this.marqueBlancheUrl = this.settings.urlmarqueblanche;
    this.opendataToolUrl = this.settings.opendataToolUrl;
    this.repositoryUrl = environment.repositoryUrl;
  }

  openInfosDialog() {
    this.dialog.open(DialogNavBar, {
      data: {
        title : 'Informations',
        version: this.version,
        pastellVersion: this.pastellVersion,
        repository: this.repositoryUrl,
        dialogId: 'infos'
      }});
  }

  openUserDialog() {
    this.dialog.open(DialogNavBar, {
      data: {
        title: 'Mon compte',
        user: this.user,
        organisme: this.organisme,
        dialogId: 'user'
      }});
  }

  ngOnInit() {
    this.apiClient.getVersion().then( (infos:any) => {
      this.pastellVersion = infos.pastel;
    } )

    this.apiClient.getUser().then( (infos:any) => {
      this.user = infos.user;
      this._logger.debug(infos);
      this.apiClient.setEntity(infos.details['id_e']);
      this.organisme = infos.details.organisme;
      this.marqueBlancheUrl = `${this.marqueBlancheUrl}?siren=${infos.details['siren']}`
    } )

  }


  async logout(event:Event) {
    event.preventDefault();
    await this.keycloakAuthService.logout();
  }

}

@Component({
  selector: 'dialog-infos',
  templateUrl: 'dialog-infos.html',
})

export class DialogNavBar {
  constructor(@Inject(MAT_DIALOG_DATA) public data: DialogData) {}
}


