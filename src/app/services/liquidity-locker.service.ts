import { Injectable } from '@angular/core';
import { ConnectService, Token } from '../cards/connect/connect.service';
import { NETWORK_MAP } from 'src/app/data/providers';
import { filter } from 'rxjs/operators';
import { LIQUIDITY_LOCKER_ABI, TOKEN_DISPENSER_ABI } from '../data/abis';
import { Contract } from 'ethers';

class Lock {

  constructor(
    public index: string,
    public originalOwner: string,
    public transfers?: any[], // 0: oldest, N: newest
    public expirationTime?: string,
    public token?: Token,
    public value?: string
  ) { }

}

const BATCH_SIZE = 4;

@Injectable({
  providedIn: 'root'
})
export class LiquidityLockerService {

  liquidityLockerContractAddress: string;
  liquidityLockerContract: Contract;
  tokenDispenserContractAddress: string;
  tokenDispenserContract: Contract;

  fee: number;

  constructor(
    private connectService: ConnectService
  ) {

    this.connectService.isConnected$
      .pipe(
        filter(isConnected => isConnected)
      )
      .subscribe(_ => {

        const chainId: any = this.connectService.chainId$.getValue();
        const signer = this.connectService.signer$.getValue();

        this.liquidityLockerContractAddress = NETWORK_MAP[chainId].contracts.liquidityLocker;
        console.log("Liquidity lock addr", this.liquidityLockerContractAddress);
        this.liquidityLockerContract = new this.connectService.ethers.Contract(
          this.liquidityLockerContractAddress,
          LIQUIDITY_LOCKER_ABI,
          signer
        );

        // If the network supports a token dispenser, then load it
        if (NETWORK_MAP[chainId].contracts.tokenDispenser) {
          this.tokenDispenserContractAddress = NETWORK_MAP[chainId].contracts.tokenDispenser;
          console.log("Token dispenser addr", this.tokenDispenserContractAddress);
          this.tokenDispenserContract = new this.connectService.ethers.Contract(
            this.tokenDispenserContractAddress,
            TOKEN_DISPENSER_ABI,
            signer
          );
        }

        // TODO: Ask Paul why he decided to store the fee this way
        this.liquidityLockerContract.getFee()
          .then((fee: any[]) => {
            const [fee0, fee1] = fee.map(fee => Number(fee.toString()));
            this.fee = (fee0 / fee1) * 100;
          });

        this.loadLocks();

      });
  }

  loadLocks() {

    const LockCreateFilter = this.liquidityLockerContract.filters.LockCreate();
    const LockTransferFilter = this.liquidityLockerContract.filters.LockTransfer();

    // Work out the entries in parallel with Promise.all()
    const locks = Promise.all([
      this.liquidityLockerContract.queryFilter(LockCreateFilter),
      this.liquidityLockerContract.queryFilter(LockTransferFilter)
    ]);

    // { [[index]]: [{ oldOwner, newOwner }] }
    const transfersMap: any = {};

    locks.then(
      ([
        creates,
        transfers
      ]) =>
      (
        transfers.forEach((t: any) => {
          transfersMap[t.args.index] = transfersMap[t.args.index] || [];
          transfersMap[t.args.index].push({
            oldOwner: t.args.oldOwner,
            newOwner: t.args.newOwner
          });
        }),
        creates.map((c: any) =>
          new Lock(
            c.args.index.toString(),
            c.args.owner,
            transfersMap[c.args.index]
          )
        )
      )
    )
    .then(async (creates) => {

      creates.sort((a: Lock, b: Lock) => parseInt(b.index) - parseInt(a.index));

      // Send groups of requests of BATCH_SIZE, then bundle them back
      for (let i = 0; i < creates.length; i += BATCH_SIZE) {

        // Make a batch of promises to get the details of each lock
        const batchOfPromiseOfLock = creates
          .slice(i, i + BATCH_SIZE)
          .map((info: Lock) =>
            new Promise(async (resolve) =>
              resolve({
                info,
                details: await this.liquidityLockerContract.getLock(info.index)
              })
            )
          );

        // Resolve the entire batch at once
        const batchOfLock: any[] = await Promise.all(batchOfPromiseOfLock);

        // Instantiate application level locks
        let locks: Lock[] = [];
        for (const lock of batchOfLock) {
          locks.push(
            new Lock(
              lock.info.index,
              lock.info.originalOwner,
              lock.info.transfers,
              lock.details.expirationTime.toString(),
              await this.connectService.getTokenInfo(lock.details.token),
              lock.details.value.toString()
            )
          );
        }

        console.log(locks);
      }

    });

  }

}
