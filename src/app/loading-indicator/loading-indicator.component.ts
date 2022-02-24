import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { LoadingIndicatorService } from './loading-indicator.service';

@Component({
  selector: 'app-loading-indicator',
  template: `
  <div #loadingIndicator class="ground" [hidden]="!loadingIndicatorService.indicators[uniqueId]">
    <div class="figure"></div>
  </div>
  `,
  styleUrls: ['./loading-indicator.component.scss']
})
export class LoadingIndicatorComponent implements OnInit {

  @Input() uniqueId: string;
  @ViewChild("loadingIndicator") loadingIndicatorRef: ElementRef;

  constructor(
    public loadingIndicatorService: LoadingIndicatorService
  ) { }

  ngOnInit(): void {
  }

  ngAfterViewInit() {
    this.loadingIndicatorRef.nativeElement
      .parentElement
      .parentElement
      .style
      .overflow = "hidden";
  }

}
