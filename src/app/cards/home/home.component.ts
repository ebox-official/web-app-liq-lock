/*
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
*/

import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ConnectService } from '../connect/connect.service';

@Component({
	selector: 'app-home',
	templateUrl: './home.component.html',
	styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  url = "https://ebox.io/liq-lock/liq_lock_promo.php";
  isLoading = false;
  giverId: any;

  constructor(
    private http: HttpClient,
    private connectService: ConnectService,
    private route: ActivatedRoute,
	private router: Router
  ) {

    this.giverId = this.route.snapshot.paramMap.get('id');
  }

  async ngOnInit() {

    if(this.giverId != null) {
		var bindTakerToIdPayload = new FormData();
		bindTakerToIdPayload.append('action', 'bind_taker_to_id');
		bindTakerToIdPayload.append('address', this.connectService.selectedAccount$.getValue());
		bindTakerToIdPayload.append('id', this.giverId);

		const { error, result } = (await this.http.post(this.url, bindTakerToIdPayload).toPromise() as any);

		this.router.navigate(["/home"]);
	}
  }

}
