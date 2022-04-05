import { Component, ElementRef, ViewChild } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'App Scaffold';

  @ViewChild("appBody") appBody: ElementRef;

  constructor() { }

  setBackground(isDarkmode: boolean) {
    this.appBody.nativeElement.style.backgroundImage = isDarkmode ?
      "url(assets/img/bg-dark.svg)" :
      "url(assets/img/bg.svg)";
  }
}
