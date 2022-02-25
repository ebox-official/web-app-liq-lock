import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { ConnectService } from '../connect/connect.service';

@Component({
  selector: 'app-please-connect',
  template: `
  <app-card-archetype>
    <ng-container class="card-header-content">Please connect to proceed</ng-container>
    <ng-container class="card-body-content">
        <div class="p-3">
            <h5>You don't seem to be connected.</h5>
            <p>Please connect your wallet to access this page <button (click)="goToConnect()" class="btn btn-sm btn-primary"><i class="bi bi-box-arrow-in-right me-2"></i>Connect</button></p>
        </div>
    </ng-container>
    <ng-container class="card-footer-content">
        <app-connection-information></app-connection-information>
    </ng-container>
  </app-card-archetype>
  `
})
export class PleaseConnectComponent implements OnInit {

  subscription: any;

  constructor(
    private connectService: ConnectService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {

    // If the user has already connected, then navigate straight to returnUrl (or home if missing)
    this.subscription = this.connectService.isConnected$
      .subscribe(isConnected => {
        if (isConnected) {
          setTimeout(() =>
            this.router.navigateByUrl(this.route.snapshot.queryParamMap.get("returnUrl") || "/home")
          , 450);
        }
      });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  goToConnect() {
    const returnUrl = this.route.snapshot.queryParamMap.get("returnUrl");
    setTimeout(() => {
      this.router.navigate(["/connect"], { queryParams: { returnUrl } });
    }, 450);
  }

}
