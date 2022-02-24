import { Component, Input, OnInit } from '@angular/core';
import { RPCs } from 'src/app/data/providers';

@Component({
  selector: 'app-choose-network',
  templateUrl: './choose-network.component.html'
})
export class ChooseNetworkComponent implements OnInit {

  @Input() data: any;
  @Input() resolve: Function;
  @Input() reject: Function;

  rpcs: any[];

  constructor() {
    this.rpcs = RPCs;
  }

  ngOnInit(): void {
  }

  onResolve(index: string) {
    this.resolve(this.rpcs[parseInt(index)]);
  }

  onDismiss() {
    this.resolve(false);
  }

}
