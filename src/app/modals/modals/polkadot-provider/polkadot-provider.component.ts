import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-polkadot-provider',
  templateUrl: './polkadot-provider.component.html'
})
export class PolkadotProviderComponent implements OnInit {

  @Input() data: any;
  @Input() resolve: Function;
  @Input() reject: Function;

  constructor() { }

  ngOnInit(): void {
  }

  onResolve(accountSelector: HTMLSelectElement, networkSelector: HTMLSelectElement) {
    let account = accountSelector.value;
    let [ rpcUrl, chainId ] = networkSelector.value.split(";");
    this.resolve({ account, rpcUrl, chainId });
  }

  onDismiss() {
    this.resolve(false);
  }

}
