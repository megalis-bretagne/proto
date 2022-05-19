import { Injectable } from '@angular/core';
import { OktaAuthService } from '@okta/okta-angular';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';


@Injectable({
  providedIn: 'root'
})
export class ApiClientService {
  constructor(private oktaAuth: OktaAuthService, private http: HttpClient) {
  }



  getVersion() {
    return this.perform('get', '/version');
  }

  getUser() {
    return this.perform('get', '/user');
  }

  getClassification(entity:string, id_doc:string) {
    return this.perform('get', `/document/${id_doc}/externalData/classification`)
  }

  getDocuments(entity:string) {
    return this.perform('get', '/document');
  }

  createDoc(entity:string, parameters:{}) {
    return this.perform('post', '/document', parameters);
  }

  updateDoc(entity:string, id_doc:string, parameters:{}) {
    return this.perform('patch', `/document/${id_doc}`, parameters);
  }

  uploadFile(entity:string, id_doc:string, element:string, file:File) {
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
    const accessToken = await this.oktaAuth.getAccessToken();
    const url = `${environment.apiURL}${resource}`;

    let httpOptions = {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${accessToken}`
      })
    };


    switch (method) {
      case 'delete':
        return this.http.delete(url, httpOptions).toPromise();
      case 'get':
        return this.http.get(url,httpOptions).toPromise();
      case 'post':
        return this.http.post(url, data, httpOptions).toPromise();
      case 'patch':
        return this.http.patch(url, data, httpOptions).toPromise();
      default:
        return 'bad';
    }
  }
}