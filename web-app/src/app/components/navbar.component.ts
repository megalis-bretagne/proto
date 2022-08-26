import { Component, OnInit, Inject } from '@angular/core';
import { ApiClientService } from '../api-client.service';
import { AuthService } from '../services/auth.service';
import {MatDialog, MAT_DIALOG_DATA} from '@angular/material/dialog';

export interface DialogData {
  version: string;
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
  user: string;
  organisme: string;

  constructor(
    private keycloakAuthService : AuthService,
    private apiClient: ApiClientService,
    public dialog: MatDialog
  ) {
    this.version = 'Non synchronisé';
    this.user = '';
    this.organisme = '';
  }

  openInfosDialog() {
    this.dialog.open(DialogNavBar, {
      data: {
        title : 'Informations',
        version: this.version,
        repository: 'https://github.com/spelhate/proto',
        dialogId: 'infos'
      }});
  }

  openUserDialog() {
    this.dialog.open(DialogNavBar, {
      data: {
        title: 'Utilisateur',
        user: this.user,
        organisme: this.organisme,
        dialogId: 'user'
      }});
  }

  ngOnInit() {
    this.apiClient.getVersion().then( (infos:any) => {
      this.version = infos.pastel;
    } )

    this.apiClient.getUser().then( (infos:any) => {
      this.user = infos.user;
      console.log(infos);
      this.apiClient.setEntity(infos.details['id_e']);
      this.organisme = infos.details.organisme;
      //this.docList.loadDocuments();
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


