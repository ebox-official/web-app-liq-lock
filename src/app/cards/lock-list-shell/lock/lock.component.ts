import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import BigNumber from 'bignumber.js';
import { NETWORK_MAP } from 'src/app/data/providers';
import { LiquidityLockerService, Lock } from 'src/app/services/liquidity-locker.service';
import { ValidatorsService } from 'src/app/services/validators.service';
import { ToastColor, ToasterService } from 'src/app/toaster/toaster.service';
import { ConnectService, Token } from '../../connect/connect.service';

@Component({
  selector: 'app-lock',
  templateUrl: './lock.component.html',
  styleUrls: ['./lock.component.scss']
})
export class LockComponent implements OnInit {

  lockIndex: number;
  lock: Lock;
  ownedBySelectedAccount: boolean;
  hasToApprove: boolean;

  lockAddField: FormControl;
  lockExtendField: FormControl;
  minDate: string;
  maxDate: string;
  lockTransferField: FormControl;
  lockWithdrawField: FormControl;

  interactingWithSmartContract: boolean;

  constructor(
    private route: ActivatedRoute,
    private liquidityLockerService: LiquidityLockerService,
    private connectService: ConnectService,
    private validatorsService: ValidatorsService,
    private toasterService: ToasterService
  ) {

    // Get the index from the URL, load the resource statelessly in ngOnInit
    const lockIndexParam = this.route.snapshot.paramMap.get("index");
    if (!lockIndexParam) throw new Error("Could not get lock index.");
    this.lockIndex = parseInt(lockIndexParam);
  }

  ngOnInit() {
    this.setComponentState();
  }

  async setComponentState() {

    // Load lock
    this.lock = await this.liquidityLockerService.getLock(this.lockIndex);

    // Check ownership
    const owner = this.lock.getOwner();
    const selectedAccount = this.connectService.selectedAccount$.getValue();
    this.ownedBySelectedAccount = owner === selectedAccount;

    // If user owns the lock, then check allowance & initialize form controls
    if (this.ownedBySelectedAccount) {
      this.checkTokenAllowance();
      this.initializeFormControls();
    }
  }

  initializeFormControls() {
    this.lockAddField = new FormControl("", [
      this.validatorsService.amountValidator(this.lock.token)
    ]);

    const isoString = new Date(this.lock.expirationTime).toISOString()
    this.minDate = isoString.substring(0, (isoString.indexOf("T")|0) + 6|0);
    this.maxDate = "2025-01-01T01:01";
    this.lockExtendField = new FormControl("", [
      Validators.pattern("[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}"),
      this.validatorsService.unlockDateValidator(this.minDate, this.maxDate)
    ]);

    this.lockTransferField = new FormControl("", [this.validatorsService.addressValidator()]);

    this.lockWithdrawField = new FormControl("", [
      this.validatorsService.withdrawValidator(this.lock)
    ]);
  }

  async checkTokenAllowance() {

    const chainId = this.connectService.chainId$.getValue();

    const allowance = await this.connectService
      .getTokenAllowance(
        this.lock.token.address,
        NETWORK_MAP[chainId].contracts.liquidityLocker
      );
    
    if (this.lock.token.balance)
      this.hasToApprove = new BigNumber(this.lock.token.balance)
        .isGreaterThan(allowance);
  }

  setWithdrawPercentage(percentage: number) {

    if (!this.lock.value) return;

    const value = new BigNumber(this.lock.value);
    const decimalValue = this.connectService
      .weiToDecimal(
        value.multipliedBy(percentage).integerValue().toString(),
        this.lock.token.decimals
      );
    this.lockWithdrawField.setValue(decimalValue);
    this.lockWithdrawField.markAsDirty();
  }

  async lockAdd() {
    this.interactingWithSmartContract = true;
    try {
      this.toasterService.publish(
        ToastColor.warning,
        "Sending the request for adding value to the lock..."
      );
      await this.liquidityLockerService.lockAdd(this.lock, this.lockAddField.value);
    }
    catch (err) {
      this.toasterService.publish(ToastColor.danger, "Something went wrong.");
      this.interactingWithSmartContract = false;
      return console.log(err);
    }

    this.toasterService.publish(
      ToastColor.success,
      "Adding the value to the lock was successful! Reloading locks and lock details..."
    );
    this.interactingWithSmartContract = false;

    // Re-load locks and re-set component state
    this.liquidityLockerService.loadLocks();
    this.setComponentState();
  }

  async lockExtend() {
    this.interactingWithSmartContract = true;
    try {
      this.toasterService.publish(
        ToastColor.warning,
        "Sending the request for extending unlock date..."
      );
      await this.liquidityLockerService.lockExtend(this.lock, this.lockExtendField.value);
    }
    catch (err) {
      this.toasterService.publish(ToastColor.danger, "Something went wrong.");
      this.interactingWithSmartContract = false;
      return console.log(err);
    }

    this.toasterService.publish(
      ToastColor.success,
      "Extending unlock date was successful! Reloading locks and lock details..."
    );
    this.interactingWithSmartContract = false;

    // Re-load locks and re-set component state
    this.liquidityLockerService.loadLocks();
    this.setComponentState();
  }

  async lockWithdraw() {
    this.interactingWithSmartContract = true;
    try {
      this.toasterService.publish(
        ToastColor.warning,
        "Sending the request for the withdrawal..."
      );
      await this.liquidityLockerService.lockWithdraw(this.lock, this.lockWithdrawField.value);
    }
    catch (err) {
      this.toasterService.publish(ToastColor.danger, "Something went wrong.");
      this.interactingWithSmartContract = false;
      return console.log(err);
    }

    this.toasterService.publish(
      ToastColor.success,
      "Withdrawal was successful! Reloading locks and lock details..."
    );
    this.interactingWithSmartContract = false;

    // Re-load locks and re-set component state
    this.liquidityLockerService.loadLocks();
    this.setComponentState();
  }

  async lockTransfer() {
    this.interactingWithSmartContract = true;
    try {
      this.toasterService.publish(
        ToastColor.warning,
        "Sending the request for the ownership transfer..."
      );
      await this.liquidityLockerService.lockTransfer(this.lock, this.lockTransferField.value);
    }
    catch (err) {
      this.toasterService.publish(ToastColor.danger, "Something went wrong.");
      this.interactingWithSmartContract = false;
      return console.log(err);
    }

    this.toasterService.publish(
      ToastColor.success,
      "Ownership transfer was successful! Reloading locks and lock details..."
    );
    this.interactingWithSmartContract = false;

    // Re-load locks and re-set component state
    this.liquidityLockerService.loadLocks();
    this.setComponentState();
  }

}
