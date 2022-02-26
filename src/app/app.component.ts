import { Component, ElementRef, ViewChild } from '@angular/core';
import { LiquidityLockerService } from './services/liquidity-locker.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'App Scaffold';

  @ViewChild("appBody") appBody: ElementRef;

  constructor(private ll: LiquidityLockerService) { }

  setBackground(isDarkmode: boolean) {
    this.appBody.nativeElement.style.backgroundImage = isDarkmode ?
      "url(/assets/img/bg-dark.svg)" :
      "url(/assets/img/bg.svg)";
  }
}
