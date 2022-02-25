import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import BigNumber from 'bignumber.js';
import { Subscription } from 'rxjs';
import { filter, tap } from 'rxjs/operators';
import { ValidatorsService } from 'src/app/services/validators.service';
import { ConnectService } from '../connect/connect.service';

@Component({
  selector: 'app-create-lock',
  templateUrl: './create-lock.component.html',
  styleUrls: ['./create-lock.component.scss']
})
export class CreateLockComponent implements OnInit {

  minDate: string;
  maxDate: string;

  tokenAddrField: FormControl;

  amountField: FormControl;
  amountConfirmed: boolean;

  unlockDateField: FormControl;
  unlockDateConfirmed: boolean;

  tokens: any = [
    {
      "tokenAddress": "0x73044F667BEf54a619dc067101a5921Bff32BE89",
      "name": "ebox Token",
      "symbol": "EBOX",
      "logo": null,
      "thumbnail": null,
      "decimals": "18",
      "balance": "90000000000000000000"
    },
    {
      "tokenAddress": "0xb89f9673c46b126d7a0052d972cdb9c448f92d35",
      "name": "ethbox Test Token A",
      "symbol": "AAA",
      "logo": null,
      "thumbnail": null,
      "decimals": "18",
      "balance": "89000000000000000000"
    },
    {
      "tokenAddress": "0x0b91f9d9657e8edc725a519bc9e9fb3c785815a0",
      "name": "ethbox Test Token B",
      "symbol": "BBB",
      "logo": null,
      "thumbnail": null,
      "decimals": "18",
      "balance": "40000000000000000000"
    },
    {
      "tokenAddress": "0x4b73517ae7ac55b46b8b993a41842af399fbfa25",
      "name": "ethbox Test Token C",
      "symbol": "CCC",
      "logo": null,
      "thumbnail": null,
      "decimals": "18",
      "balance": "100000000000000000000"
    },
    {
      "tokenAddress": "0x0200ac1132560363fe203c9463561e4c537e70da",
      "name": "Testing Token A",
      "symbol": "AAA",
      "logo": null,
      "thumbnail": null,
      "decimals": "18",
      "balance": "791307988888888888890"
    },
    {
      "tokenAddress": "0x7820690cde6b23fb3c214c88d6546fcc28a8d34c",
      "name": "Testing Token C",
      "symbol": "CCC",
      "logo": null,
      "thumbnail": null,
      "decimals": "18",
      "balance": "295741210000000000000"
    }
  ];
  selectedToken: any;
  movedOn: any;
  movedOn2: any;

  constructor(
    private connectService: ConnectService,
    private validatorsService: ValidatorsService
  ) { }

  ngOnInit(): void {
    const isoString = new Date(Date.now()).toISOString()
    this.minDate = isoString.substring(0, (isoString.indexOf("T")|0) + 6|0);
    this.maxDate = "2032-01-01T01:01";

    this.tokenAddrField = new FormControl("", [this.validatorsService.addressValidator()]);

    this.amountField = new FormControl("");
    this.amountConfirmed = false;

    this.unlockDateField = new FormControl("", [
      Validators.pattern("[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}"),
      this.validatorsService.unlockDateValidator(this.maxDate)
    ]);
    this.unlockDateConfirmed = false;
  }

  resetSelectedToken() {
    this.selectedToken = undefined;
    this.tokenAddrField.reset();
  }

  selectToken(token: any) {
    this.selectedToken = token;
    this.amountField.reset();
    this.addAmountValidator();
    this.scrollTo("step-2-end");
  }

  loadToken() {
    this.connectService.getTokenInfo(this.tokenAddrField.value)
      .then(token => {
        this.selectedToken = token;
        this.amountField.reset();
        this.addAmountValidator();
        this.scrollTo("step-2-end");
      });
  }

  addAmountValidator() {
    this.amountField.clearValidators();
    this.amountField.addValidators([this.validatorsService.amountValidator(this.selectedToken)]);
  }

  setPercentageAmount(percentage: number) {
    const balanceBn = new BigNumber(this.selectedToken.balance);
    const decimalValue = this.connectService
      .weiToDecimal(
        balanceBn.multipliedBy(percentage).integerValue().toString(),
        this.selectedToken.decimals
      );
    this.amountField.setValue(decimalValue);
    this.amountField.markAsDirty();
  }

  confirmAmount() {
    this.amountConfirmed = true;
    this.scrollTo("step-3-end");
  }

  confirmUnlockDate() {
    this.unlockDateConfirmed = true;
    this.scrollTo("step-4-end");
  }

  date2timestamp(date: string) {
    return new Date(date).getTime();
  }

  scrollTo(elId: string) {
    setTimeout(() =>
      (document.querySelector("#" + elId) as any)
        .scrollIntoView({ behavior: "smooth", block: "end" })
    , 450);
  }

}
