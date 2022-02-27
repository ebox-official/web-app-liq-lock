import { Component, Input, OnInit } from '@angular/core';
import { ConnectService } from '../cards/connect/connect.service';
import { NETWORK_MAP } from '../data/providers';

@Component({
  selector: 'app-scanner-link',
  templateUrl: './scanner-link.component.html',
  styleUrls: ['./scanner-link.component.scss']
})
export class ScannerLinkComponent implements OnInit {

  @Input() address: string;

  link: string;

  constructor(
    private connectService: ConnectService
  ) { }

  ngOnInit(): void {
    this.link = NETWORK_MAP[this.connectService.chainId$.getValue()]
      .accountScannerUrl(this.address);
  }

}
