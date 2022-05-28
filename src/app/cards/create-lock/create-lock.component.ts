import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import BigNumber from 'bignumber.js';
import { BehaviorSubject } from 'rxjs';
import { NETWORK_MAP } from 'src/app/data/providers';
import { LiquidityLockerService } from 'src/app/services/liquidity-locker.service';
import { ValidatorsService } from 'src/app/services/validators.service';
import { ToastColor, ToasterService } from 'src/app/toaster/toaster.service';
import { ConnectService, Token } from '../connect/connect.service';

@Component({
  selector: 'app-create-lock',
  templateUrl: './create-lock.component.html',
  styleUrls: ['./create-lock.component.scss']
})
export class CreateLockComponent implements OnInit {

  userTokensInitialized$: BehaviorSubject<boolean>;
  userTokens$: BehaviorSubject<Token[]>;
  selectedToken: any;
  hasToApprove: boolean;
  tokenAddrField: FormControl;

  amountField: FormControl;
  amountConfirmed: boolean;

  minDate: string;
  maxDate: string;
  unlockDateField: FormControl;
  unlockDateConfirmed: boolean;

  interactingWithSmartContract: boolean;

  constructor(
    private connectService: ConnectService,
    private validatorsService: ValidatorsService,
    private liquidityLockerService: LiquidityLockerService,
    private toasterService: ToasterService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.userTokensInitialized$ = this.connectService.userTokensInitialized$;
    this.userTokens$ = this.connectService.userTokens$;
    this.tokenAddrField = new FormControl("", [this.validatorsService.addressValidator()]);

    this.amountField = new FormControl("");

    const isoString = new Date(Date.now()).toISOString()
    this.minDate = isoString.substring(0, (isoString.indexOf("T")|0) + 6|0);
    this.maxDate = "2025-01-01T01:01";
    this.unlockDateField = new FormControl("", [
      Validators.pattern("[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}"),
      this.validatorsService.unlockDateValidator(this.minDate, this.maxDate)
    ]);
  }

  trackTokenByAddress(index: number, token: Token) {
    return token.address;
  }

  resetSelectedToken() {
    this.selectedToken = undefined;
    this.tokenAddrField.reset();

    this.amountConfirmed = false;
    this.amountField.reset();

    this.unlockDateConfirmed = false;
    this.unlockDateField.reset();
  }

  selectToken(token: any) {
    this.hasToApprove = false;
    this.selectedToken = token;
    this.amountField.reset();
    this.addAmountValidator();
    this.scrollTo("step-2-end");
    this.checkTokenAllowance(token);
  }

  loadToken() {
    this.hasToApprove = false;
    this.connectService.getTokenInfo(this.tokenAddrField.value, true)
      .then(token => {
        this.selectedToken = token;
        this.amountField.reset();
        this.addAmountValidator();
        this.scrollTo("step-2-end");
        this.checkTokenAllowance(token);
      });
  }

  async checkTokenAllowance(token: Token) {

    const chainId = this.connectService.chainId$.getValue();

    const allowance = await this.connectService
      .getTokenAllowance(
        token.address,
        NETWORK_MAP[chainId].contracts.liquidityLocker
      );
    
    if (token.balance)
      this.hasToApprove = new BigNumber(token.balance)
        .isGreaterThanOrEqualTo(allowance);
  }

  addAmountValidator() {
    this.amountField.clearValidators();
    this.amountField.addValidators([this.validatorsService.amountValidator(this.selectedToken)]);
  }

  setPercentageAmount(percentage: number) {
    const balance = new BigNumber(this.selectedToken.balance);
    const decimalValue = this.connectService
      .weiToDecimal(
        balance.multipliedBy(percentage).integerValue().toString(),
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

  async lockCreate() {
    this.interactingWithSmartContract = true;
    let receipt;
    try {
      this.toasterService.publish(
        ToastColor.warning,
        "Creating lock..."
      );
      receipt = await this.liquidityLockerService.lockCreate(
        this.selectedToken,
        this.amountField.value,
        this.unlockDateField.value
      );
    }
    catch (err) {
      this.toasterService.publish(ToastColor.danger, "Something went wrong!");
      this.interactingWithSmartContract = false;
      return console.log(err);
    }

    this.toasterService.publish(
      ToastColor.success,
      "Successfully created lock!"
    );
    this.interactingWithSmartContract = false;

    // Re-load locks
    this.liquidityLockerService.loadLocks();

    // Extract lockIndex from receipt
    const lockIndex = receipt.events[1].args.index.toString();
    
    // Navigate to lock detail after 1 second
    setTimeout(() =>
      this.router.navigate(["/lock-list/personal/" + lockIndex])
    , 1000);
  }

  async approveUnlimitedSpending() {
    this.interactingWithSmartContract = true;
    try {
      this.toasterService.publish(
        ToastColor.warning,
        "Approving token spending..."
      );
      await this.liquidityLockerService
        .approveUnlimitedSpending(this.selectedToken.address);
    }
    catch (err) {
      this.toasterService.publish(ToastColor.danger, "Something went wrong!");
      this.interactingWithSmartContract = false;
      return console.error(err);
    }

    this.toasterService.publish(ToastColor.success, "Successfully approved token spending!");
    this.interactingWithSmartContract = false;

    // Re-check token allowance
    this.checkTokenAllowance(this.selectedToken);
  }

  date2timestamp(date: string) {
    return new Date(date).getTime();
  }

  scrollTo(id: string) {
    setTimeout(() =>
      (document.querySelector("#" + id) as any)
        .scrollIntoView({ behavior: "smooth", block: "end" })
    , 450);
  }

}
