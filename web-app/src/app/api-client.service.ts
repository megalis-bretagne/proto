import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { AuthService } from './services/auth.service';


@Injectable({
  providedIn: 'root'
})
export class ApiClientService {
  user: string;
  siren: string;
  role :string;
  id_e: string;
  organisme: string;
  constructor(
    private http: HttpClient,
    private keycloakAuthService : AuthService) {
      this.keycloakAuthService.checkLogin().then((login:any) => {
        this.siren = login.attributes['siren'][0];
        this.role = login.attributes['role'];
      })

    }

  setEntity(id_e:string) {
    this.id_e = id_e;
    console.log('----------' + this.id_e + '----------------');
  }

  getVersion() {
    return this.perform('get', '/version');
  }

  async getUser() {
    await this.keycloakAuthService;
    return this.perform('post', '/user', {'siren': this.siren});
  }



  getClassification(id_doc:string) {
    return this.perform('get', `/document/${id_doc}/externalData/classification`)
  }

  getDocuments() {
    return this.perform('get', '/document');
  }

  createDoc(parameters:{}) {
    return this.perform('post', '/document', parameters);
  }

  updateDoc(id_doc:string, parameters:{}) {
    return this.perform('patch', `/document/${id_doc}`, parameters);
  }

  sendDoc(id_doc:string, action:string) {
    return this.perform('post', `/document/${id_doc}/action/${action}`);
  }

  uploadFile(id_doc:string, element:string, file:File) {
    const formData = new FormData();
    formData.append("file_name", file.name);
    formData.append("file_content", file);
    const parameters = {
      "file_name": file.name,
      "file_content": file
    }
    return this.perform('post', `/document/${id_doc}/file/${element}`, formData);
  }


  async perform(method:string, resource:string, data = {}) {
       const url = `${environment.apiURL}${resource}`;


    switch (method) {
      case 'delete':
        return this.http.delete(url).toPromise();
      case 'get':
        return this.http.get(url).toPromise();
      case 'post':
        return this.http.post(url, data).toPromise();
      case 'patch':
        return this.http.patch(url, data).toPromise();
      default:
        return 'bad';
    }
  }
}