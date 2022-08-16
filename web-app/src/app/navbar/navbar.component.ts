import { Component, OnInit } from '@angular/core';
import { ApiClientService } from '../api-client.service';
import { AuthService } from '../services/auth.service';
import {MatDialog} from '@angular/material/dialog';


@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {

  version: String;
  user: String;

  constructor(
    private keycloakAuthService : AuthService,
    private apiClient: ApiClientService,
    public dialog: MatDialog
  ) {
    this.version = 'Non synchronisé';
    this.user = '';
  }

  openInfosDialog() {
    this.dialog.open(DialogInfos);
  }

  ngOnInit() {
    this.apiClient.getVersion().then( (infos:any) => {
      this.version = infos.pastel;
    } )

    this.apiClient.getUser().then( (infos:any) => {
      this.user = infos.user;
      this.apiClient.setEntity(infos.details['id_e']);
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
export class DialogInfos {}
