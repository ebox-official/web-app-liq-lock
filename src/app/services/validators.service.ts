import { Injectable } from '@angular/core';
import { AbstractControl, ValidationErrors } from '@angular/forms';
import BigNumber from 'bignumber.js';
import { ConnectService } from '../cards/connect/connect.service';
import { Lock } from './liquidity-locker.service';

@Injectable({
  providedIn: 'root'
})
export class ValidatorsService {

  constructor(
    private connectService: ConnectService
  ) { }

  addressValidator() {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!this.connectService.isAddressValid(control.value))
        return { invalidAddress: true };
      return null;
    }
  }

  amountValidator(token: any) {
    return (control: AbstractControl): ValidationErrors | null => {
      const amount = control.value;
      if (!amount || isNaN(amount)) return { invalidAmount: true };
      const minBn = new BigNumber("0.000001");
      const amountBn = new BigNumber(this.connectService.decimalToWei(amount, token.decimals));
      const balanceBn = new BigNumber(token.balance);
      if (amountBn.isGreaterThan(balanceBn)) return { amountTooHigh: true };
      if (amountBn.isLessThanOrEqualTo(minBn)) return { amountTooLow: true };
      return null;
    }
  }

  unlockDateValidator(minDate: string, maxDate: string) {
    return (control: AbstractControl): ValidationErrors | null => {
      const unlockDate = control.value;
      if (!unlockDate) return { required: true };
      const unlockTimestamp = new Date(unlockDate).getTime();
      if (unlockTimestamp < new Date(minDate).getTime()) return { tooFarBack: true };
      if (unlockTimestamp > new Date(maxDate).getTime()) return { tooFarAhead: true };
      return null;
    }
  }

  withdrawValidator(lock: Lock) {
    return (control: AbstractControl): ValidationErrors | null => {
      const requestedAmount = control.value;
      if (!requestedAmount || isNaN(requestedAmount)) return { invalidAmount: true };
      const minBn = new BigNumber("0.000001");
      const requestedAmountBn = new BigNumber(
        this.connectService.decimalToWei(requestedAmount, lock.token.decimals)
      );
      if (requestedAmountBn.isGreaterThan(lock.value)) return { amountTooHigh: true };
      if (requestedAmountBn.isLessThanOrEqualTo(minBn)) return { amountTooLow: true };
      return null;
    }
  }

}
