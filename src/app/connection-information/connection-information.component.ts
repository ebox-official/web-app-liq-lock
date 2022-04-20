import { Component, OnInit } from '@angular/core';
import { ConnectService } from '../cards/connect/connect.service';
import { NETWORK_MAP } from '../data/providers';

@Component({
  selector: 'app-connection-information',
  templateUrl: './connection-information.component.html',
  styleUrls: ['./connection-information.component.scss']
})
export class ConnectionInformationComponent implements OnInit {

  NETWORK_MAP = NETWORK_MAP;

  constructor(
    public connectService: ConnectService
  ) { }

  ngOnInit(): void {
  }

}
