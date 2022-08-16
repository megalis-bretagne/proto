import { Component, Inject } from '@angular/core';
import {MatSnackBarRef, MAT_SNACK_BAR_DATA} from '@angular/material/snack-bar';

@Component({
  selector: 'app-pastell-snack',
  templateUrl: './pastell-snack.component.html',
  styleUrls: ['./pastell-snack.component.css']
})

export class PastellSnackComponent {
  constructor(public snackBarRef: MatSnackBarRef<any>, @Inject(MAT_SNACK_BAR_DATA) public data: any) { }
}
