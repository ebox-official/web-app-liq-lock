import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HeaderService } from 'src/app/header/header.service';
import { ToastColor, ToasterService } from 'src/app/toaster/toaster.service';
import { ConnectService } from './connect.service';

@Component({
  selector: 'app-connect',
  templateUrl: './connect.component.html',
  styleUrls: ['./connect.component.scss']
})
export class ConnectComponent implements OnInit {

  constructor(
    public headerService: HeaderService,
    private connectService: ConnectService,
    private toasterService: ToasterService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
  }

  async connect(providerName?: string) {
    try {
      await this.connectService.connect(providerName);
    }
    catch (err: any) {
      if (err !== "Provider name not found.") this.toasterService.publish(ToastColor.danger, err);
      return;
    }
    this.toasterService.publish(ToastColor.success, "Connected successfully!");
    setTimeout(() => {
      this.router.navigateByUrl(this.route.snapshot.queryParamMap.get("returnUrl") || "/home");
    }, 450);
  }

}
