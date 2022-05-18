import { Component, OnInit } from '@angular/core';
import { OktaAuthService } from '@okta/okta-angular';
import { ApiClientService } from '../api-client.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  selectedTab: Number;
  version: String;
  user: String;
  lastMessage: String;


  constructor(
    private oktaAuth: OktaAuthService,
    private apiClient: ApiClientService
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
    } )
  }

  async uploadFile() {
    /*this.apiClient.uploadFile('','','',file).then(( infos:any) => {
      this.lastMessage = infos.result;
    })*/
  }

  async createDoc(entity:string, parameters:{}) {
    this.apiClient.createDoc(entity, parameters).then(( infos:any) => {
      this.lastMessage = infos.result;
    })
  }

  async logout(event:Event) {
    event.preventDefault();
    await this.oktaAuth.logout('/');
  }






}