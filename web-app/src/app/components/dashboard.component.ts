import { Component, OnInit, Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

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
      description: 'Publier une <strong>délibération</strong> en <strong>opendata</strong> avec envoi au contrôle de légalité',
      img: 'assets/images/TDT.png',
      button: "Publier une délibération",
      "link": "/deliberations"
    },
    {
      title: 'Actes non soumis au contrôle de légalité ',
      description: 'Publier un <strong>acte</strong> en <strong>opendata</strong>, sans envoi au contrôle de légalité, de type Procès verbal, arrêté temporaire, liste des délibérations... ',
      img: 'assets/images/Parapheur.png',
      button: "Publier un acte",
      "link": "/autres-actes"
    }

  ];

  ngOnInit(): void {
  }

}

@Pipe({ name: "safeHtml" })
export class SafeHtmlPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(value:string) {
    return this.sanitizer.bypassSecurityTrustHtml(value);
  }
}
