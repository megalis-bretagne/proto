import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { AuthService } from './services/auth.service';
import { DocUploaded } from './interfaces/pastell';
import { SettingsService } from 'src/environments/settings.service';
import { NGXLogger } from 'ngx-logger';


@Injectable({
  providedIn: 'root'
})
export class ApiClientService {
  user: string;
  siren: string;
  role: string;
  id_e: string;
  organisme: string;
  constructor(
    private _logger: NGXLogger,
    private http: HttpClient,
    readonly settings: SettingsService,
    private keycloakAuthService: AuthService) {
    this.keycloakAuthService.checkLogin().then((login: any) => {
      this.siren = login.attributes['siren'][0];
      this.role = login.attributes['role'];
    })

  }

  setEntity(id_e: string) {
    this.id_e = id_e;
    this._logger.debug('----------' + this.id_e + '----------------');
  }

  getVersion() {
    return this.perform('get', '/version');
  }

  async getUser() {
    await this.keycloakAuthService;
    return this.perform('post', '/user', { 'siren': this.siren });
  }



  getClassification(id_doc: string) {
    return this.perform('get', `/document/${id_doc}/externalData/classification`)
  }

  getDocuments() {
    return this.perform('get', '/document');
  }

  createDoc(parameters: {}) {
    return this.perform('post', '/document', parameters);
  }

  updateDoc(id_doc: string, parameters: {}) {
    return this.perform('patch', `/document/${id_doc}`, parameters);
  }

  deleteDoc(id_doc: string) {
    return this.perform('delete', `/document/${id_doc}`);
  }


  sendDoc(id_doc: string, action: string) {
    return this.perform('post', `/document/${id_doc}/action/${action}`);
  }

  uploadFile(id_doc: string, element: string, file: File, numero: number) {
    const formData = new FormData();
    formData.append("file_name", file.name);
    formData.append("file_content", file);
    const parameters = {
      "file_name": file.name,
      "file_content": file
    }
    return lastValueFrom(this.http.post<DocUploaded>(`${this.settings.apiUrl}/document/${id_doc}/file/${element}/${numero}`, formData));
  }

  deleteFile(id_doc: string, element: string, numero: number) {
    return this.perform('delete', `/document/${id_doc}/file/${element}/${numero}`);
  }


  async perform(method: string, resource: string, data = {}) {
    const url = `${this.settings.apiUrl}${resource}`;

    switch (method) {
      case 'delete':
        return lastValueFrom(this.http.delete(url));
      case 'get':
        return lastValueFrom(this.http.get(url));
      case 'post':
        return lastValueFrom(this.http.post(url, data));
      case 'patch':
        return lastValueFrom(this.http.patch(url, data));
      default:
        return 'bad';
    }
  }
}