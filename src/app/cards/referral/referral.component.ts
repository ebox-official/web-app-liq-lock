import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ConnectService } from '../connect/connect.service';
import { LocationStrategy, PathLocationStrategy } from '@angular/common';

@Component({
  selector: 'app-referral',
  templateUrl: './referral.component.html',
  styleUrls: ['./referral.component.scss']
})
export class ReferralComponent implements OnInit {

  url = "https://ebox.io/liq-lock/liq_lock_promo.php";
  isLoading = false;
  shareLink: string;

  constructor(
	private locationStrategy: LocationStrategy,
    private http: HttpClient,
    private connectService: ConnectService
  ) {}

  async ngOnInit() {

    this.isLoading = true;
    
    var payload = new FormData();
    payload.append('action', 'get_id_for_giver');
    payload.append('address', this.connectService.selectedAccount$.getValue());

    const { result: giverId } = (await this.http.post(this.url, payload).toPromise() as any);
    
	var baseHref = this.locationStrategy.getBaseHref();
    this.shareLink = `${document.location.origin}${baseHref}ref/${giverId}`;
    
    this.isLoading = false;
  }

}
