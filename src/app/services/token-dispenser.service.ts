import { Injectable } from '@angular/core';
import { Contract } from 'ethers';
import { BehaviorSubject } from 'rxjs';
import { filter } from 'rxjs/operators';
import { ConnectService } from '../cards/connect/connect.service';
import { TOKEN_DISPENSER_ABI } from '../data/abis';
import { NETWORK_MAP } from '../data/providers';

@Injectable({
  providedIn: 'root'
})
export class TokenDispenserService {

  tokenDispenserContractAddress: string;
  tokenDispenserContract: Contract;
  testTokens$: BehaviorSubject<string[]>;

  constructor(
    private connectService: ConnectService
  ) {

    this.testTokens$ = new BehaviorSubject<string[]>([]);

    this.connectService.isConnected$
      .pipe(
        filter(isConnected => isConnected)
      )
      .subscribe(_ => {

        const chainId = this.connectService.chainId$.getValue();

        // If the network supports a token dispenser, then load it
        if (NETWORK_MAP[chainId].contracts.tokenDispenser) {
          this.tokenDispenserContractAddress = NETWORK_MAP[chainId].contracts.tokenDispenser;
          console.log("Token dispenser addr", this.tokenDispenserContractAddress);
          this.tokenDispenserContract = new this.connectService.ethers.Contract(
            this.tokenDispenserContractAddress,
            TOKEN_DISPENSER_ABI,
            this.connectService.signer
          );
          this.loadTestTokens();
        }
      });
  }

  async loadTestTokens() {
    const testTokens = [];
    for(var i = 0; i < 4; i++) {
      testTokens.push(await this.tokenDispenserContract.tokens(i));
    }
    this.testTokens$.next(testTokens);
  }

  async giveTestToken(index: number) {
    const tx = await this.tokenDispenserContract.giveToken(
      index,
      this.connectService.decimalToWei("100", 18)
    );
    return await tx.wait();
  }

}
