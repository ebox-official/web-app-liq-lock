import { Component, OnInit } from '@angular/core';
import { ConnectService } from '../cards/connect/connect.service';
import { NETWORK_MAP } from '../data/providers';

@Component({
  selector: 'app-unsupported-network-overlay',
  template: `
  <div *ngIf="connectService.unsupportedNetworkFlag"
    class="position-fixed top-0 start-0 w-100 h-100"
    style="z-index: 99999; background-color: #000d;">
    <div class="position-absolute bottom-0 w-100 px-3 py-5 bg-danger text-white text-center text-lg-start">
      <div class="display-6">Unsupported network!</div>
      <div class="fs-4">We are currently live on {{ supportedNetworks }}.</div>
    </div>
  </div>
  `
})
export class UnsupportedNetworkOverlayComponent implements OnInit {

  supportedNetworks: string;

  constructor(
    public connectService: ConnectService
  ) { }

  ngOnInit(): void {
    this.supportedNetworks = Object.values(NETWORK_MAP).map((net: any) => net.name).join(', ');
  }

}
