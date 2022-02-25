import { Component, OnInit } from '@angular/core';
import { ConnectService } from '../../connect/connect.service';

@Component({
  selector: 'app-lock-list-item',
  templateUrl: './lock-list-item.component.html',
  styleUrls: ['./lock-list-item.component.scss']
})
export class LockListItemComponent implements OnInit {

  now = parseInt((Date.now()+'').slice(0, -3));

  lock = {
    expiration_time: 1644460998,
    index: "0",
    owner: "0x168a445273975955417BbD4b026C338E2b312d77",
    token_address: "0x73044F667BEf54a619dc067101a5921Bff32BE89",
    token_symbol: "EBOX",
    value: 1000.1234
  };

  constructor(
    public connectService: ConnectService
  ) { }

  ngOnInit(): void {
  }

}
