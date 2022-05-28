import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ConnectService } from '../connect/connect.service';

@Component({
  selector: 'app-bind',
  templateUrl: './bind.component.html',
  styleUrls: ['./bind.component.scss']
})
export class BindComponent implements OnInit {

  url = "https://ebox.io/liq-lock/liq_lock_promo.php";
  isLoading = false;
  giverId: any;
  giverAddress: string;

  constructor(
    private http: HttpClient,
    private connectService: ConnectService,
    private route: ActivatedRoute
  ) {

    this.giverId = this.route.snapshot.paramMap.get('id');
  }

  async ngOnInit() {

    this.isLoading = true;

    var bindTakerToIdPayload = new FormData();
    bindTakerToIdPayload.append('action', 'bind_taker_to_id');
    bindTakerToIdPayload.append('address', this.connectService.selectedAccount$.getValue());
    bindTakerToIdPayload.append('id', this.giverId);

    const { error, result } = (await this.http.post(this.url, bindTakerToIdPayload).toPromise() as any);

    var getGiverForAddressPayload = new FormData();
    getGiverForAddressPayload.append('action', 'get_giver_for_address');
    getGiverForAddressPayload.append('address', this.connectService.selectedAccount$.getValue());

    const { error: giverAddrErr, result: giverAddr } = (await this.http.post(this.url, getGiverForAddressPayload).toPromise() as any);

    this.isLoading = false;

    this.giverAddress = giverAddr || giverAddrErr;
  }

}
