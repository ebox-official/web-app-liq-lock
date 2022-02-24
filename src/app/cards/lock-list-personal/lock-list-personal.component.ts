import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ConnectService } from '../connect/connect.service';

@Component({
  selector: 'app-lock-list-personal',
  templateUrl: './lock-list-personal.component.html',
  styleUrls: ['./lock-list-personal.component.scss']
})
export class LockListPersonalComponent implements OnInit {

  constructor(
    public connectService: ConnectService,
    public router: Router
  ) { }

  ngOnInit(): void {
  }

}
