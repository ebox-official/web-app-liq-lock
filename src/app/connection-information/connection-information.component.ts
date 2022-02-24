import { Component, OnInit } from '@angular/core';
import { ConnectService } from '../cards/connect/connect.service';

@Component({
  selector: 'app-connection-information',
  templateUrl: './connection-information.component.html',
  styleUrls: ['./connection-information.component.scss']
})
export class ConnectionInformationComponent implements OnInit {

  constructor(
    public connectService: ConnectService
  ) { }

  ngOnInit(): void {
  }

}
