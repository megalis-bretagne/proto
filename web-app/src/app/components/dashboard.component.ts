import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  constructor() {}

  items = [
    {
      title: 'Délibérations',
      description: 'Some quick example text to build on the card title and make up the bulk of the card content',
      img: 'https://mdbootstrap.com/img/Photos/Horizontal/Nature/4-col/img%20(34).jpg',
      button: "Publier une délibération",
      "link": "/deliberations"
    },
    {
      title: 'Actes non soumis au contrôle de légalité ',
      description: 'Some quick example text to build on the card title and make up the bulk of the card content',
      img: 'https://mdbootstrap.com/img/Photos/Horizontal/Nature/4-col/img%20(34).jpg',
      button: "Publier un acte",
      "link": "/autres-actes"
    }

  ];

  ngOnInit(): void {
  }

}
