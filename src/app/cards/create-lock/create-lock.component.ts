import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import BigNumber from 'bignumber.js';
import { BehaviorSubject } from 'rxjs';
import { MAX_VALUE } from 'src/app/data/constants';
import { NETWORK_MAP } from 'src/app/data/providers';
import { ValidatorsService } from 'src/app/services/validators.service';
import { ConnectService, Token } from '../connect/connect.service';

@Component({
  selector: 'app-create-lock',
  templateUrl: './create-lock.component.html',
  styleUrls: ['./create-lock.component.scss']
})
export class CreateLockComponent implements OnInit {

  MAX_VALUE = MAX_VALUE;

  userTokens$: BehaviorSubject<Token[] | undefined | null>;
  selectedToken: any;
  hasToApprove: boolean;
  tokenAddrField: FormControl;

  amountField: FormControl;
  amountConfirmed: boolean;

  minDate: string;
  maxDate: string;
  unlockDateField: FormControl;
  unlockDateConfirmed: boolean;

  constructor(
    private connectService: ConnectService,
    private validatorsService: ValidatorsService
  ) { }

  ngOnInit(): void {
    this.userTokens$ = this.connectService.userTokens$;
    this.tokenAddrField = new FormControl("", [this.validatorsService.addressValidator()]);

    this.amountField = new FormControl("");
    this.amountConfirmed = false;

    const isoString = new Date(Date.now()).toISOString()
    this.minDate = isoString.substring(0, (isoString.indexOf("T")|0) + 6|0);
    this.maxDate = "2032-01-01T01:01";

    this.unlockDateField = new FormControl("", [
      Validators.pattern("[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}"),
      this.validatorsService.unlockDateValidator(this.maxDate)
    ]);
    this.unlockDateConfirmed = false;
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
    this.connectService.getTokenInfo(this.tokenAddrField.value)
      .then(token => {
        this.selectedToken = token;
        this.amountField.reset();
        this.addAmountValidator();
        this.scrollTo("step-2-end");
        this.checkTokenAllowance(token);
      });
  }

  checkTokenAllowance(token: Token) {
    const chainId = this.connectService.chainId$.getValue();
    if (!chainId) return;
    this.connectService.getTokenAllowance(
      token.address,
      NETWORK_MAP[chainId].contracts.liquidityLocker
    )
    .then(allowance =>

      // It would be better to check if the amount the user is trying to lock is greater than the allowance, but it's OK nonetheless as we are always asking for MAX_VALUE allowance
      this.hasToApprove = new BigNumber(token.balance).isGreaterThan(allowance)
    );
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
