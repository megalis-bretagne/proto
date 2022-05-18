import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { MatSnackBar } from "@angular/material/snack-bar";
import { ApiClientService } from '../api-client.service';




@Component({
  selector: 'app-pastell-form',
  templateUrl: './pastell-form.component.html',
  styleUrls: ['./pastell-form.component.css']
})
export class PastellFormComponent implements OnInit {

  isLinear = true;
  firstFormGroup!: FormGroup;
  secondFormGroup!: FormGroup;
  fileSource!: FormControl;
  firstCtrl!: FormControl;
  secondCtrl!: FormControl;
  idDoc = '';

  /******/
  pastelForm! : FormGroup;

  createFormControls() {
    this.firstCtrl = new FormControl('', Validators.required);
    this.secondCtrl = new FormControl('', Validators.required);
    this.fileSource = new FormControl('', Validators.required);
  }

  createForm() {
    this.firstFormGroup = new FormGroup({
      firstCtrl: this.firstCtrl
    });

    this.secondFormGroup =  new FormGroup({
      secondCtrl: this.secondCtrl,
      fileSource: this.fileSource
    })


    this.pastelForm = new FormGroup({
      firstFormGroup: this.firstFormGroup,
      secondFormGroup: this.secondFormGroup
    });
  }


  /************ */

  constructor(
    private _apiClient: ApiClientService,
    public snackBar: MatSnackBar
    ) {}

  ngOnInit() {
    this.createFormControls();
    this.createForm();

  }

  onNewFile(event:Event) {
    let files = (event?.target as HTMLInputElement)?.files as FileList;
    this.secondFormGroup.patchValue({
      fileSource: files[0]
    });
    console.log(this.firstFormGroup.value);
    console.log(this.secondFormGroup.value);
    console.log(files.item(0));
    this._apiClient.uploadFile('1', this.idDoc,'arrete', files.item(0)!)
  }

  part1() {
    const parameters = {
      'type': 'deliberations-studio',
      'objet': this.firstFormGroup.controls['firstCtrl'].value,
      'acte_nature': '1',
      'numero_de_lacte': 'ABC123',
      'date_de_lacte': '2018-04-03'
      /*'publication_open_data' : '1',
      'classification': '1.1 Marchés publics',
      'type_acte': '99_DE'*/

    }
    this._apiClient.createDoc('2', parameters).then( (infos:any) => {
      if (infos.pastel.info) {
        this.idDoc = infos.pastel.info.id_d;
        let snackBarRef = this.snackBar.open(`Document ${this.idDoc} créé avec succès !`, 'Effacer');
        console.log(infos.pastel.info);
        if (infos.pastel.info.id_d) {
          this._apiClient.updateDoc('1', infos.pastel.info.id_d, parameters).then( (infos:any) => {
            console.log(infos);
          })
        }
      }
    })

  }

}
