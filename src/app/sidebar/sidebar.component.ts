import { Component, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { TokenDispenserService } from '../services/token-dispenser.service';
import { ToastColor, ToasterService } from '../toaster/toaster.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {

  testTokens$: BehaviorSubject<string[]>;
  interactingWithSmartContract: boolean;

  constructor(
    private tokenDispenserService: TokenDispenserService,
    private toasterService: ToasterService
  ) {
    this.testTokens$ = this.tokenDispenserService.testTokens$;
  }

  ngOnInit(): void {
  }

  async giveTestToken(tokenName: string, index: number) {
    this.interactingWithSmartContract = true;
    try {
      this.toasterService.publish(
        ToastColor.warning,
        `Sending the request for getting 100 ${tokenName}...`
      );
      await this.tokenDispenserService.giveTestToken(index);
    }
    catch (err) {
      this.toasterService.publish(ToastColor.danger, "Something went wrong.");
      this.interactingWithSmartContract = false;
      return console.log(err);
    }

    this.toasterService.publish(
      ToastColor.success,
      `You've got 100 ${tokenName}!`
    );
    this.interactingWithSmartContract = false;
  }

}
