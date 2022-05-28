import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import BigNumber from 'bignumber.js';
import { ConnectService } from '../cards/connect/connect.service';
import { NETWORK_MAP } from '../data/providers';
import { LiquidityLockerService, Lock } from '../services/liquidity-locker.service';
import { ValidatorsService } from '../services/validators.service';
import { ToastColor, ToasterService } from '../toaster/toaster.service';

@Component({
  selector: 'app-edit-lock',
  templateUrl: './edit-lock.component.html',
  styleUrls: ['./edit-lock.component.scss']
})
export class EditLockComponent implements OnInit {

  @Input("lock") lock: Lock;
  @Output("lockEdited") lockEdited = new EventEmitter<boolean>();

  hasToApprove: boolean;

  lockAddField: FormControl;
  lockExtendField: FormControl;
  minDate: string;
  maxDate: string;
  lockTransferField: FormControl;
  lockWithdrawField: FormControl;

  interactingWithSmartContract: boolean;

  constructor(
    private liquidityLockerService: LiquidityLockerService,
    private connectService: ConnectService,
    private validatorsService: ValidatorsService,
    private toasterService: ToasterService
  ) { }

  ngOnInit(): void {
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

    this.lockTransferField = new FormControl("", [
      this.validatorsService.addressValidator()
    ]);

    this.lockWithdrawField = new FormControl("", [
      this.validatorsService.withdrawValidator(this.lock)
    ]);

    this.checkTokenAllowance();
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
        .isGreaterThanOrEqualTo(allowance);
  }

  async approveUnlimitedSpending() {
    this.interactingWithSmartContract = true;
    try {
      this.toasterService.publish(
        ToastColor.warning,
        "Approving token spending..."
      );
      await this.liquidityLockerService
        .approveUnlimitedSpending(this.lock.token.address);
    }
    catch (err) {
      this.toasterService.publish(ToastColor.danger, "Something went wrong!");
      this.interactingWithSmartContract = false;
      return console.error(err);
    }

    this.toasterService.publish(ToastColor.success, "Successfully approved token spending!");
    this.interactingWithSmartContract = false;

    // Re-check token allowance
    this.checkTokenAllowance();
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
        "Adding tokens to lock..."
      );
      await this.liquidityLockerService.lockAdd(this.lock, this.lockAddField.value);
    }
    catch (err) {
      this.toasterService.publish(ToastColor.danger, "Something went wrong!");
      this.interactingWithSmartContract = false;
      return console.log(err);
    }

    this.toasterService.publish(
      ToastColor.success,
      "Successfully added tokens to lock!"
    );
    this.interactingWithSmartContract = false;

    // Re-load locks and re-set component state
    this.liquidityLockerService.loadLocks();
    this.lockEdited.emit(true);
  }

  async lockExtend() {
    this.interactingWithSmartContract = true;
    try {
      this.toasterService.publish(
        ToastColor.warning,
        "Extending unlocking time..."
      );
      await this.liquidityLockerService.lockExtend(this.lock, this.lockExtendField.value);
    }
    catch (err) {
      this.toasterService.publish(ToastColor.danger, "Something went wrong!");
      this.interactingWithSmartContract = false;
      return console.log(err);
    }

    this.toasterService.publish(
      ToastColor.success,
      "Successfully extended unlocking time!"
    );
    this.interactingWithSmartContract = false;

    // Re-load locks and re-set component state
    this.liquidityLockerService.loadLocks();
    this.lockEdited.emit(true);
  }

  async lockWithdraw() {
    this.interactingWithSmartContract = true;
    try {
      this.toasterService.publish(
        ToastColor.warning,
        "Withdrawing from lock..."
      );
      await this.liquidityLockerService.lockWithdraw(this.lock, this.lockWithdrawField.value);
    }
    catch (err) {
      this.toasterService.publish(ToastColor.danger, "Something went wrong!");
      this.interactingWithSmartContract = false;
      return console.log(err);
    }

    this.toasterService.publish(
      ToastColor.success,
      "Successfully withdrawn from lock!"
    );
    this.interactingWithSmartContract = false;

    // Re-load locks and re-set component state
    this.liquidityLockerService.loadLocks();
    this.lockEdited.emit(true);
  }

  async lockTransfer() {
    this.interactingWithSmartContract = true;
    try {
      this.toasterService.publish(
        ToastColor.warning,
        "Transferring lock ownership..."
      );
      await this.liquidityLockerService.lockTransfer(this.lock, this.lockTransferField.value);
    }
    catch (err) {
      this.toasterService.publish(ToastColor.danger, "Something went wrong!");
      this.interactingWithSmartContract = false;
      return console.log(err);
    }

    this.toasterService.publish(
      ToastColor.success,
      "Sucessfully transferred lock ownership!"
    );
    this.interactingWithSmartContract = false;

    // Re-load locks and re-set component state
    this.liquidityLockerService.loadLocks();
    this.lockEdited.emit(true);
  }

}
