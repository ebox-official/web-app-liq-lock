import { Component, Input, OnInit } from '@angular/core';
import { LoadingIndicatorService } from './loading-indicator.service';

@Component({
  selector: 'app-loading-indicator',
  template: `
  <div class="ground" [hidden]="!loadingIndicatorService.indicators[uniqueId]">
    <div class="figure"></div>
  </div>
  `,
  styleUrls: ['./loading-indicator.component.scss']
})
export class LoadingIndicatorComponent implements OnInit {

  @Input() uniqueId: string;

  constructor(
    public loadingIndicatorService: LoadingIndicatorService
  ) { }

  ngOnInit(): void {
  }

}
