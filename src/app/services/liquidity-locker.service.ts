import { Injectable } from '@angular/core';
import { ConnectService, Token } from '../cards/connect/connect.service';
import { NETWORK_MAP } from 'src/app/data/providers';
import { LIQUIDITY_LOCKER_ABI, TOKEN_DISPENSER_ABI } from '../data/abis';
import { Contract } from 'ethers';
import { BehaviorSubject } from 'rxjs';

class LockCreateEventObject {

  constructor(
    public index: number,
    public originalOwner: string,
    public transfers: any[] | undefined
  ) { }

}

export class Lock {

  constructor(
    public index: number,
    public originalOwner: string,
    public transfers: any[] | undefined, // 0: oldest, N: newest
    public expirationTime: number,
    public token: Token,
    public value: string
  ) { }

  getOwner() {
    if (this.transfers)
      return [...this.transfers].pop().newOwner;
    else
      return this.originalOwner;
  }

  isLocked() {
    return this.expirationTime > Date.now();
  }

}

const BATCH_SIZE = 4;
const SYNC_RATE = 10000;

@Injectable({
  providedIn: 'root'
})
export class LiquidityLockerService {

  liquidityLockerContractAddress: string;
  liquidityLockerContract: Contract;
  tokenDispenserContractAddress: string;
  tokenDispenserContract: Contract;

  loadingLocks$: BehaviorSubject<boolean>;
  locksInitialized$: BehaviorSubject<boolean>;
  locks: Lock[];
  locks$: BehaviorSubject<Lock[]>;
  latestLocksTimestamp: number;

  fee: number;

  constructor(
    private connectService: ConnectService
  ) {
    this.loadingLocks$ = new BehaviorSubject<boolean>(false);
    this.locksInitialized$ = new BehaviorSubject<boolean>(false);
    this.locks = [];
    this.locks$ = new BehaviorSubject<Lock[]>(this.locks);

    this.connectService.isConnected$
      .subscribe(_ => {

        const chainId = this.connectService.chainId$.getValue();

        this.liquidityLockerContractAddress = NETWORK_MAP[chainId].contracts.liquidityLocker;
        console.log("Liquidity lock addr", this.liquidityLockerContractAddress);
        this.liquidityLockerContract = new this.connectService.ethers.Contract(
          this.liquidityLockerContractAddress,
          LIQUIDITY_LOCKER_ABI,
          this.connectService.signer
        );

        // If the network supports a token dispenser, then load it
        if (NETWORK_MAP[chainId].contracts.tokenDispenser) {
          this.tokenDispenserContractAddress = NETWORK_MAP[chainId].contracts.tokenDispenser;
          console.log("Token dispenser addr", this.tokenDispenserContractAddress);
          this.tokenDispenserContract = new this.connectService.ethers.Contract(
            this.tokenDispenserContractAddress,
            TOKEN_DISPENSER_ABI,
            this.connectService.signer
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
    const currentLoadLocksTimestamp = Date.now();
    
    this.loadingLocks$.next(true);
    this.locks = [];

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
          new LockCreateEventObject(
            Number(c.args.index.toString()),
            c.args.owner,
            transfersMap[c.args.index]
          )
        )
      )
    )
    .then(async (creates) => {

      creates.sort((a: LockCreateEventObject, b: LockCreateEventObject) => b.index - a.index);

      // Send groups of requests of BATCH_SIZE
      for (let i = 0; i < creates.length; i += BATCH_SIZE) {

        // Make a batch of promises to get the details of each lock
        const batchOfPromiseOfLock = creates
          .slice(i, i + BATCH_SIZE)
          .map((createEventObject: LockCreateEventObject) =>
            new Promise(async (resolve) =>
              resolve({
                createEventObject,
                getLockResult: await this.liquidityLockerContract.getLock(createEventObject.index)
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
              lock.createEventObject.index,
              lock.createEventObject.originalOwner,
              lock.createEventObject.transfers,
              parseInt(lock.getLockResult.expirationTime.toString()) * 1000, // Asjust timestamp to JS standard
              await this.connectService.getTokenInfo(lock.getLockResult.token),
              lock.getLockResult.value.toString()
            )
          );
        }

        this.locks.push(...locks);

        // If it's the first time loading locks, then emit batch by batch
        if (!this.locksInitialized$.getValue()) {
          this.locks$.next(this.locks);
          this.locksInitialized$.next(true);
        }
      }

      // If it's NOT the first time loading locks, then emit the whole set
      if (this.locksInitialized$.getValue())
        this.locks$.next(this.locks);

        this.loadingLocks$.next(false);

      // Schedule the next call to loadLocks only if it's the latest call
      // This prevents parallel fetch cycles when forcing loadLocks
      if (this.latestLocksTimestamp === currentLoadLocksTimestamp)
        setTimeout(() => this.loadLocks(), SYNC_RATE)
    });

  }

}
