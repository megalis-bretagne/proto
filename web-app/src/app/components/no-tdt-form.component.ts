import { Component, OnInit } from '@angular/core';
import {NgForm, FormGroup, Validators, FormControl, FormGroupDirective} from '@angular/forms';
import { MatSnackBar } from "@angular/material/snack-bar";
import { PastellSnackComponent } from '../components/pastell-snack.component';
import { ApiClientService } from '../api-client.service';
import {MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS} from '@angular/material-moment-adapter';
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE, ErrorStateMatcher} from '@angular/material/core';
import { HttpClient } from '@angular/common/http';
import {DocCreated, DocUploaded} from '../interfaces/pastell';
import { LocalService } from '../services/local.service';


/** Error when invalid control is dirty, touched, or submitted. */
export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

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

interface FileItem {
  name: string;
  source: string;
  index : number;
}

interface NatureItem  {
  id: string;
  value: string
};

@Component({
  selector: 'app-no-tdt-form',
  templateUrl: './no-tdt-form.component.html',
  styleUrls: ['./no-tdt-form.component.css'],
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



export class NoTdtFormComponent implements OnInit {
  annexesEnabled: boolean;
  pastellLink:string;
  lastSendedParameters = {};
  firstFormGroup!: FormGroup;
  secondFormGroup!: FormGroup;
  objet!: FormControl;
  nature_autres!:FormControl;
  idDoc:string;
  arrete!: FormControl;
  autre_document_attache!: FormControl;
  date!: FormControl;
  acte_nature!: FormControl;
  classification!: FormControl;
  opendata!: FormControl;
  numero_acte!: FormControl;
  classifications : string[] = [];
  natures_autres :NatureItem[] = [];
  filesAnnexe : FileItem[] = [];
  fileActe : FileItem[] = [];
  formEnabled: boolean;
  waiting: boolean;
  waiting_file: boolean;
  defaultOpendata: string;
  step:number;
  totalSteps: number;
  progress:number;
  pastelForm! : FormGroup;

  matcher = new MyErrorStateMatcher();

  createFormControls() {
    this.acte_nature = new FormControl('', Validators.required);
    this.nature_autres = new FormControl('', Validators.required);
    this.objet = new FormControl('', Validators.required);
    this.numero_acte = new FormControl('', [Validators.required]);
    this.arrete = new FormControl('', Validators.required);
    this.autre_document_attache = new FormControl('');
    this.classification = new FormControl('', Validators.required);
    this.date = new FormControl(moment(), Validators.required);
    this.opendata = new FormControl('', Validators.required);
  }

  createForm() {
    this.firstFormGroup = new FormGroup({
      objet: this.objet,
      numero_de_lacte: this.numero_acte,
      acte_nature: this.acte_nature,
      nature_autre_detail: this.nature_autres,
      date_de_lacte: this.date,
      classification: this.classification,
      publication_open_data: this.opendata
    });



    this.secondFormGroup =  new FormGroup({
      arrete: this.arrete,
      autre_document_attache: this.autre_document_attache

    })


    this.pastelForm = new FormGroup({
      firstFormGroup: this.firstFormGroup,
      secondFormGroup: this.secondFormGroup
    });
  }


  /************ */

  constructor(
    private _apiClient: ApiClientService,
    public snackBar: MatSnackBar,
    private http: HttpClient,
    private localStore: LocalService
    ) {}

  ngOnInit() {
    this.createFormControls();
    this.createForm();
    this.onChanges();
    this.idDoc = '';
    this.filesAnnexe = [];
    this.fileActe = [];
    this.formEnabled = false;
    //This option hide annexes form
    this.annexesEnabled = false;
    this.defaultOpendata = '3';
    this.step = 0;
    this.totalSteps = 9;
    this.progress = 0;
    this.waiting = false;
    this.waiting_file = false;
    this.getReferentiels();
    this.natures_autres = [];
    this.localStore.saveData('pastell', 'preprod');

  }

  findValidControls():number {
    const valid = [];
    const controls = {...this.firstFormGroup.controls, ...this.secondFormGroup.controls};
    for (const name in controls) {
        if (controls[name].valid) {
            valid.push(name);
        }
    }
    return valid.length;
  }

  refreshProgress(step: number) {
    this.progress = (this.step += step) / this.totalSteps * 100;
  }

  onChanges() {
    const that = this;
    this.firstFormGroup.valueChanges.subscribe(val => {
      that.step = this.findValidControls();
      that.refreshProgress(0);
      if (that.firstFormGroup.valid) {
        //format date
        val.date_de_lacte = moment(val.date_de_lacte).format("YYYY-MM-DD");
        this._apiClient.updateDoc(this.idDoc, val).then( (infos:any) => {
          console.log(infos);
        })
      }
    });

  }

  onFormSubmit() {
    //Show spinner
    this.toggleBtn()
    // Vrrsement GED/OPENDATA
    this._apiClient.sendDoc(this.idDoc,'orientation').then( (response:any) => {
      if (response.action.result) {
        let snackBarRef = this.snackBar.openFromComponent(PastellSnackComponent, { data : { 'message': 'a été publié avec succès', 'document': this.idDoc, 'link': this.pastellLink}});
        this.toggleBtn();
        this.formEnabled = false;
      }
    })
  }

  toggleBtn () {
    const btn = document.getElementById('apply-btn');
    if (btn.hasAttribute('busy')) {
        btn.removeAttribute('busy');
    } else {
        btn.setAttribute('busy','');
    }
}

  deleteActe(idDoc) {
    this._apiClient.deleteDoc(idDoc).then( (infos:any) => {
      console.log(infos);
      if (infos.pastel.result) {
        this.snackBar.openFromComponent(PastellSnackComponent, { data : { 'message': 'a été supprimé', 'document': this.idDoc, 'link': this.pastellLink}});

      } else if (infos.pastel.status){
        this.snackBar.openFromComponent(PastellSnackComponent, { data : { 'message': 'n\'existe plus', 'document': this.idDoc, 'link': this.pastellLink}});
      }
      this.pastelForm.reset();
      this.formEnabled = false;

    })
  }

  async newActe() {
    this.waiting = true;
    this.pastelForm.reset();
    this.acte_nature.setValue('6');
    this.opendata.setValue(this.defaultOpendata);
    const parameters = {
      type: 'autres-studio-sans-tdt'
    }
    this._apiClient.createDoc(parameters).then( (response: DocCreated) => {
      if (response.pastel) {
        this.idDoc = response.pastel.id_d;
        this.pastellLink =  response.link;
        this.filesAnnexe = [];
        this.fileActe = [];
        this.formEnabled = true;
        this.waiting = false;
      }
    })
  }

  async onNewFile(event:Event) {
    const element = (event?.target as HTMLInputElement);
    let files = element?.files as FileList;
    const name = element?.name;
    const multiple = element?.multiple;
    const docsUploaded = this.filesAnnexe.length;
    for (let i = 0; i < files.length; i++) {
       const file = files.item(i);
       this.waiting_file = true;
       const res:DocUploaded = await this._apiClient.uploadFile(this.idDoc, name, file, i + docsUploaded);
       console.log(res);
       this.waiting_file = false;
       if (element.required) { this.step +=1; }
       this.refreshProgress(0);
       if (multiple && name == "autre_document_attache") {
         this.filesAnnexe.push({ name : file.name, source: "autre_document_attache", index: i + docsUploaded });
       } else {
         this.fileActe.push({ name: file.name, source: name, index: i });
       }
    }

  }

  async removeFile(file:FileItem) {
    let res:any = await this._apiClient.deleteFile(this.idDoc, file.source, file.index);
    if (file.source === "autre_document_attache") {
      if (res.pastel.data.autre_document_attache) {
        //check is file is deleted
        const files:string[] = res.pastel.data.autre_document_attache;
        if (files.indexOf(file.name) == -1 ) {
          if (this.filesAnnexe[file.index].name == file.name) {
            this.filesAnnexe.splice(file.index, 1);
            this.filesAnnexe.forEach((element, index) => {
              element.index = index;
            });
          }
        }
      } else {
        this.filesAnnexe = [];
      }
    } else {
      this.fileActe = [];
      this.arrete.reset();
      this.refreshProgress(-1)
    }
  }

  getReferentiels() {
    const options = {observe: 'body', responseType: 'json'};
    this.http.get('assets/referentiels.json').subscribe( (data: any) =>
      {
        this.classifications = data.classification;
        this.natures_autres = data.natures_autres;
      }
    );
  }

}
