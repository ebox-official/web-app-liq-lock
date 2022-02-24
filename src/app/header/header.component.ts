import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ConnectService } from '../cards/connect/connect.service';
import { HeaderService } from './header.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  @Output("isDarkmodeChanged") isDarkmodeChanged = new EventEmitter<boolean>();

  isDarkmode = false;

  constructor(
    public connectService: ConnectService,
    private headerService: HeaderService
  ) { }

  ngOnInit(): void {

    // Set preferred color scheme
    let prefersColorScheme = localStorage.getItem("bs.prefers-color-scheme");
    this.isDarkmode = prefersColorScheme === "dark";

    // Try to auto-connect wallet via cached provider
    this.connectService.connect();
  }

  ngAfterViewInit() {
    this.emitDarkmodeState();
  }

  toggleDarkmode() {
    this.isDarkmode = !this.isDarkmode;
    (window as any).darkmode.toggleDarkMode();
    this.emitDarkmodeState();
  }

  emitDarkmodeState() {
    this.isDarkmodeChanged.emit(this.isDarkmode);
    this.headerService.isDarkmode$.next(this.isDarkmode);
  }

}
