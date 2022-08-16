import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators, FormControl} from '@angular/forms';
import { MatSnackBar } from "@angular/material/snack-bar";
import { PastellSnackComponent } from '../components/pastell-snack.component';
import { ApiClientService } from '../api-client.service';
import {MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS} from '@angular/material-moment-adapter';
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE} from '@angular/material/core';

// Depending on whether rollup is used, moment needs to be imported differently.
// Since Moment.js doesn't have a default export, we normally need to import using the `* as`
// syntax. However, rollup creates a synthetic default module and we thus need to import it using
// the `default as` syntax.
import * as _moment from 'moment';
// tslint:disable-next-line:no-duplicate-imports
import {default as _rollupMoment} from 'moment';

const moment = _rollupMoment || _moment;

// See the Moment.js docs for the meaning of these formats:
// https://momentjs.com/docs/#/displaying/format/
export const MY_FORMATS = {
  parse: {
    dateInput: 'LL',
  },
  display: {
    dateInput: 'YYYY-MM-DD',
    monthYearLabel: 'YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'YYYY',
  },
};




@Component({
  selector: 'app-pastell-form',
  templateUrl: './pastell-form.component.html',
  styleUrls: ['./pastell-form.component.css'],
  providers: [
    // `MomentDateAdapter` can be automatically provided by importing `MomentDateModule` in your
    // application's root module. We provide it at the component level here, due to limitations of
    // our example generation script.
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
    },

    {provide: MAT_DATE_FORMATS, useValue: MY_FORMATS},
  ]
})
export class PastellFormComponent implements OnInit {

  isLinear = true;
  firstFormGroup!: FormGroup;
  secondFormGroup!: FormGroup;
  details!: FormGroup;
  fileSource!: FormControl;
  firstCtrl!: FormControl;
  secondCtrl!: FormControl;
  date!: FormControl;
  idDoc = '';
  classification!: FormControl;
  opendata!: FormControl;
  numero_acte!: FormControl;
  classifications : string[] = [];

  /******/
  pastelForm! : FormGroup;


  createFormControls() {
    this.firstCtrl = new FormControl('', Validators.required);
    this.numero_acte = new FormControl('', [Validators.required]);
    this.secondCtrl = new FormControl('', Validators.required);
    this.fileSource = new FormControl('', Validators.required);
    this.classification = new FormControl('', Validators.required);
    this.date = new FormControl(moment(), Validators.required);
    this.opendata = new FormControl('', Validators.required);
  }

  createForm() {
    this.firstFormGroup = new FormGroup({
      firstCtrl: this.firstCtrl,
      numero_acte: this.numero_acte
    });

    this.details = new FormGroup({
      classification: this.classification,
      date: this.date,
      opendata: this.opendata
    });

    this.secondFormGroup =  new FormGroup({
      secondCtrl: this.secondCtrl,
      fileSource: this.fileSource,

    })


    this.pastelForm = new FormGroup({
      firstFormGroup: this.firstFormGroup,
      secondFormGroup: this.secondFormGroup,
      details: this.details
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
    this._apiClient.uploadFile(this.idDoc,'arrete', files.item(0)!)
  }

  getClassification() {
    if (this.idDoc && this.classifications.length == 0) {
      this._apiClient.getClassification('1', this.idDoc).then( (infos: any) => {
        if (infos.externalData.classification) {
          let tmp = []
          for (let [k, v] of Object.entries(infos.externalData.classification)) {
            if (v) {
              tmp.push(k)
            }
          }
          this.classifications = tmp;
        }
      });
    }

  }

  part1() {
    const parameters = {
      'type': 'deliberations-studio',
      'objet': this.firstFormGroup.controls['firstCtrl'].value,
      'acte_nature': '1',
      'numero_de_lacte': this.numero_acte.value

    }
    this._apiClient.createDoc(parameters).then( (infos:any) => {
      if (infos.pastel.info) {
        this.idDoc = infos.pastel.id_d;
        const link = infos.link;
        this.getClassification();
        let snackBarRef = this.snackBar.openFromComponent(PastellSnackComponent, { data : { 'message': this.idDoc, 'link': link}});
        console.log(infos.pastel.info);
        if (infos.pastel.info.id_d) {
          this._apiClient.updateDoc(infos.pastel.info.id_d, parameters).then( (infos:any) => {
            console.log(infos);
          })
        }
      }
    })

  }

  part2() {
    const parameters = {
      'date_de_lacte': moment(this.date.value).format("YYYY-MM-DD"),
      'classification': this.classification.value,
      'type_acte': '99_DE',
      'publication_open_data' : (this.opendata.value==true?'':'1')

    }

    this._apiClient.updateDoc(this.idDoc, parameters).then( (infos:any) => {
      console.log(infos);
      //send tdt
      this._apiClient.sendDoc(this.idDoc,'orientation').then( (infos:any) => {
        console.log(infos);
      })

    })
  }

}
