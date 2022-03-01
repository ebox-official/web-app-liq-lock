import { Injectable } from '@angular/core';
import { ConnectService, Token } from '../cards/connect/connect.service';
import { NETWORK_MAP } from 'src/app/data/providers';
import { LIQUIDITY_LOCKER_ABI, TOKEN_DISPENSER_ABI } from '../data/abis';
import { Contract } from 'ethers';
import { BehaviorSubject } from 'rxjs';
import { MAX_VALUE } from '../data/constants';

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

  async loadLocks() {
    const currentLoadLocksTimestamp = Date.now();
    
    this.loadingLocks$.next(true);
    this.locks = [];

    const createEventObjects = await this.getCreateEventObjectsWithTransfers();;

    createEventObjects.reverse();

    // Send groups of requests of BATCH_SIZE
    for (let i = 0; i < createEventObjects.length; i += BATCH_SIZE) {

      // Make a batch of promises to get the details of each lock
      const batchOfPromiseOfResults = createEventObjects
        .slice(i, i + BATCH_SIZE)
        .map((createEventObject: LockCreateEventObject) =>
          new Promise(async (resolve) =>
            resolve({
              createEventObject,
              lock: await this.liquidityLockerContract.getLock(createEventObject.index)
            })
          )
        );

      // Resolve the entire batch at once
      const batchOfResults: any[] = await Promise.all(batchOfPromiseOfResults);

      // Instantiate application level locks
      let locks: Lock[] = [];
      for (const result of batchOfResults) {
        locks.push(
          new Lock(
            result.createEventObject.index,
            result.createEventObject.originalOwner,
            result.createEventObject.transfers,
            parseInt(result.lock.expirationTime.toString()) * 1000, // Asjust timestamp to JS standard
            await this.connectService.getTokenInfo(result.lock.token),
            result.lock.value.toString()
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
  }

  async getLock(index: number): Promise<Lock> {
    const createEventObjects = await this.getCreateEventObjectsWithTransfers();

    const createEventObject = createEventObjects
      .find((create: LockCreateEventObject) => create.index === index);

    if (!createEventObject) throw new Error("Could not find create event object.");
    const lock = await this.liquidityLockerContract.getLock(createEventObject.index);

    if (!lock) throw new Error("Could not find lock.");
    const tokenInfo = await this.connectService.getTokenInfo(lock.token, true);

    return new Lock(
      createEventObject.index,
      createEventObject.originalOwner,
      createEventObject.transfers,
      parseInt(lock.expirationTime.toString()) * 1000, // Adjust timestamp to JS standard
      tokenInfo,
      lock.value.toString()
    );
  }

  private async getCreateEventObjectsWithTransfers() {
    const LockCreateFilter = this.liquidityLockerContract.filters.LockCreate();
    const LockTransferFilter = this.liquidityLockerContract.filters.LockTransfer();

    // Work out the entries in parallel with Promise.all()
    const locks = Promise.all([
      this.liquidityLockerContract.queryFilter(LockCreateFilter),
      this.liquidityLockerContract.queryFilter(LockTransferFilter)
    ]);

    // { [[index]]: [{ oldOwner, newOwner }] }
    const transfersMap: any = {};

    const [ creates, transfers ] = await locks;

    transfers.forEach((t: any) => {
      transfersMap[t.args.index] = transfersMap[t.args.index] || [];
      transfersMap[t.args.index].push({
        oldOwner: t.args.oldOwner,
        newOwner: t.args.newOwner
      });
    });

    return creates.map((c: any) =>
      new LockCreateEventObject(
        Number(c.args.index.toString()),
        c.args.owner,
        transfersMap[c.args.index]
      )
    );
  }

  async lockCreate(token: Token, _amount: string, _unlockTimestamp: number) {

    const tokenAddress = token.address;
    const amount = this.connectService.decimalToWei(_amount, token.decimals);
    const unlockTimestamp = Math.floor(new Date(_unlockTimestamp).getTime() / 1000);

    const tx = await this.liquidityLockerContract
      .lockCreate(tokenAddress, amount, unlockTimestamp);
    const receipt = await tx.wait();
    return receipt;
  }

  async approveUnlimitedSpending(tokenAddress: string): Promise<void> {

    const contract = this.connectService.getTokenContract(tokenAddress);

    const tx = await contract.approve(
      this.liquidityLockerContractAddress,
      MAX_VALUE
    );
    const receipt = await tx.wait();
    return receipt;
  }

  async lockAdd(lock: Lock, _amount: string) {

    const amount = this.connectService.decimalToWei(_amount, lock.token.decimals);

    const tx = await this.liquidityLockerContract
      .lockAdd(lock.index, amount);
    const receipt = await tx.wait();
    return receipt;
  }

  async lockExtend(lock: Lock, _newUnlockTimestamp: string) {

    const unlockTimestamp = Math.floor(new Date(_newUnlockTimestamp).getTime() / 1000);

    const tx = await this.liquidityLockerContract
      .lockExtend(lock.index, unlockTimestamp);
    const receipt = await tx.wait();
    return receipt;
  }

  async lockTransfer(lock: Lock, newOwnerAddress: string) {
    const tx = await this.liquidityLockerContract
      .lockTransfer(lock.index, newOwnerAddress);
    const receipt = await tx.wait();
    return receipt;
  }

  async lockWithdraw(lock: Lock, _amount: string) {

    const amount = this.connectService.decimalToWei(_amount, lock.token.decimals);

    const tx = await this.liquidityLockerContract
      .lockWithdraw(lock.index, amount);
    const receipt = await tx.wait();
    return receipt;
  }

}
