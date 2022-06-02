import { Component, OnInit } from '@angular/core';
import { ApiClientService } from '../api-client.service';
import { AuthService } from '../services/auth.service';
import { DocumentsListComponent} from '../documents-list/documents-list.component'

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  providers: [DocumentsListComponent]
})
export class HomeComponent implements OnInit {

  selectedTab: Number;
  version: String;
  user: String;
  lastMessage: String;


  constructor(
    private apiClient: ApiClientService,
    private keycloakAuthService : AuthService,
    private docList : DocumentsListComponent
  ) {
    this.selectedTab = 0;
    this.version = 'Non synchronisé';
    this.user = '';
    this.lastMessage = '';

  }

  async ngOnInit() {
    this.apiClient.getVersion().then( (infos:any) => {
      this.version = infos.pastel;
    } )

    this.apiClient.getUser().then( (infos:any) => {
      this.user = infos.user;
      this.apiClient.setEntity(infos.details['id_e']);
      //this.docList.loadDocuments();
    } )

  }

  async uploadFile() {
    /*this.apiClient.uploadFile('','','',file).then(( infos:any) => {
      this.lastMessage = infos.result;
    })*/
  }

  async createDoc(parameters:{}) {
    this.apiClient.createDoc(parameters).then(( infos:any) => {
      this.lastMessage = infos.result;
    })
  }

  async logout(event:Event) {
    event.preventDefault();
    await this.keycloakAuthService.logout();
  }






}