import { Injectable } from '@angular/core';
import { ConnectService, Token } from '../cards/connect/connect.service';
import { NETWORK_MAP } from 'src/app/data/providers';
import { LIQUIDITY_LOCKER_ABI, TOKEN_DISPENSER_ABI } from '../data/abis';
import { Contract } from 'ethers';
import { BehaviorSubject } from 'rxjs';
import { MAX_VALUE } from '../data/constants';
import { filter } from 'rxjs/operators';
import { ethers } from "ethers";
import { HttpClient } from '@angular/common/http';

export class LockInitialData {

  constructor(
    public index: number,
    public transfers: any[] | undefined
  ) { }

}

export class Lock {

  isEmpty: boolean;

  constructor(
    public index: number,
    public transfers: any[] | undefined, // 0: oldest, N: newest
    public owner: string,
    public releaseTime: number,
    public token: Token,
    public value: string
  ) {
    this.isEmpty = value === "0";
  }

  getOwner() {
    if (this.transfers)
      return [...this.transfers].pop().newOwner;
    else
      return this.owner;
  }

  isLocked() {
    return this.releaseTime > Date.now();
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

  locksInitialData: LockInitialData[];
  locks: Lock[];
  locks$: BehaviorSubject<Lock[]>;
  locksLoading$: BehaviorSubject<boolean>;
  locksInitialized$: BehaviorSubject<boolean>;
  locksTimestamp: number;

  personalLocksInitialData: LockInitialData[];
  personalLocks: Lock[];
  personalLocks$: BehaviorSubject<Lock[]>;
  personalLocksLoading$: BehaviorSubject<boolean>;
  personalLocksInitialized$: BehaviorSubject<boolean>;
  personalLocksTimestamp: number;

  fee: number;

  constructor(
    private connectService: ConnectService,
	private http: HttpClient
  ) {

    this.locksInitialData = [];
    this.locks = [];
    this.locks$ = new BehaviorSubject<Lock[]>(this.locks);
    this.locksLoading$ = new BehaviorSubject<boolean>(false);
    this.locksInitialized$ = new BehaviorSubject<boolean>(false);

    this.personalLocksInitialData = [];
    this.personalLocks = [];
    this.personalLocks$ = new BehaviorSubject<Lock[]>(this.personalLocks);
    this.personalLocksLoading$ = new BehaviorSubject<boolean>(false);
    this.personalLocksInitialized$ = new BehaviorSubject<boolean>(false);

    this.connectService.isConnected$
      .pipe(
        filter(isConnected => isConnected)
      )
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
    this.generalLocksLoop();
    this.personalLocksLoop();
  }

  async generalLocksLoop() {

    const currentLoadLocksTimestamp = Date.now();
    this.locksTimestamp = currentLoadLocksTimestamp;
    
    this.locksLoading$.next(true);
    this.locks = [];

    const locksInitData = await this.getLocksInitialData();
    locksInitData.sort((a, b) => b.index - a.index);

    // Clean initial data array
    while (this.locksInitialData.length)
      this.locksInitialData.pop();
    
    // Populate initial data array
    for (const lockInitData of locksInitData)
      this.locksInitialData.push(lockInitData);

    // Send groups of requests of BATCH_SIZE
    for (let i = 0; i < locksInitData.length; i += BATCH_SIZE) {

      // Make a batch of promises to get the details of each lock
      const batchOfPromiseOfResults = locksInitData
        .slice(i, i + BATCH_SIZE)
        .map((lockInitData: LockInitialData) =>
          new Promise(async (resolve) =>
            resolve({
              lockInitData,
              lock: await this.liquidityLockerContract.getLock(lockInitData.index)
            })
          )
        );

      // Resolve the entire batch at once
      const batchOfResults: any[] = await Promise.all(batchOfPromiseOfResults);

      // Instantiate application level locks
      const locks: Lock[] = [];
      for (const result of batchOfResults) {
        locks.push(
          new Lock(
            result.lockInitData.index,
            result.lockInitData.transfers,
            result.lock.owner,
            parseInt(result.lock.releaseTime.toString()) * 1000,
            await this.connectService.getTokenInfo(result.lock.token),
            result.lock.value.toString()
          )
        );
      }

      this.locks.push(...locks);

      // If it's the first time loading locks, then emit batch by batch
      if (!this.locksInitialized$.getValue())
        this.locks$.next(this.locks);
    }

    // Mark has initialized
    if (!this.locksInitialized$.getValue())
      this.locksInitialized$.next(true);

    // If it's NOT the first time loading locks, then emit the whole set
    if (this.locksInitialized$.getValue())
      this.locks$.next(this.locks);

    this.locksLoading$.next(false);

    // Schedule the next call to loadLocks only if it's the latest call
    // This prevents parallel fetch cycles when forcing loadLocks
    if (this.locksTimestamp === currentLoadLocksTimestamp)
      setTimeout(() => this.generalLocksLoop(), SYNC_RATE);
  }

  async personalLocksLoop() {

    const selectedAccount = this.connectService.selectedAccount$.getValue();

    const currentLoadLocksTimestamp = Date.now();
    this.personalLocksTimestamp = currentLoadLocksTimestamp;
    
    this.personalLocksLoading$.next(true);
    this.personalLocks = [];

    const pLocksInitData = await this.getLocksInitialData(selectedAccount);
    pLocksInitData.sort((a, b) => b.index - a.index);

    // Clean initial data array
    while (this.personalLocksInitialData.length)
      this.personalLocksInitialData.pop();
    
    // Populate initial data array
    for (const pLockInitData of pLocksInitData)
      this.personalLocksInitialData.push(pLockInitData);

    for (const pLockInitData of pLocksInitData) {

      const lock = await this.liquidityLockerContract.getLock(pLockInitData.index);

      this.personalLocks.push(
        new Lock(
          pLockInitData.index,
          pLockInitData.transfers,
          lock.owner,
          parseInt(lock.releaseTime.toString()) * 1000,
          await this.connectService.getTokenInfo(lock.token),
          lock.value.toString()
        )
      );

      // If it's the first time loading locks, then emit batch by batch
      if (!this.personalLocksInitialized$.getValue())
        this.personalLocks$.next(this.personalLocks);
    }

    // Mark has initialized
    if (!this.personalLocksInitialized$.getValue())
      this.personalLocksInitialized$.next(true);

    // If it's NOT the first time loading locks, then emit the whole set
    if (this.personalLocksInitialized$.getValue())
      this.personalLocks$.next(this.personalLocks);

    this.personalLocksLoading$.next(false);

    // Schedule the next call to loadLocks only if it's the latest call
    // This prevents parallel fetch cycles when forcing loadLocks
    if (this.personalLocksTimestamp === currentLoadLocksTimestamp)
      setTimeout(() => this.personalLocksLoop(), SYNC_RATE);
  }

  async getLock(index: number): Promise<Lock> {

    const locksInitData = await this.getLocksInitialData();

    const lockInitData = locksInitData
      .find((lockInitData: LockInitialData) => lockInitData.index === index);

    if (!lockInitData) throw new Error("Could not find lock initial object.");
    const lock = await this.liquidityLockerContract.getLock(lockInitData.index);

    if (!lock) throw new Error("Could not find lock.");
    const tokenInfo = await this.connectService.getTokenInfo(lock.token, true);

    return new Lock(
      lockInitData.index,
      lockInitData.transfers,
      lock.owner,
      parseInt(lock.releaseTime.toString()) * 1000,
      tokenInfo,
      lock.value.toString()
    );
  }

  private async getLocksInitialData(address?: string) {
	
	var creates;
	var transfers;

	var error = false;
	do {
		try {
			var formData = new FormData();
			formData.append("action", "get_event");
			formData.append("chain_id", this.connectService.chainId$.getValue());
			formData.append("event", "LockCreate");
			creates = (await this.http.post<any>("https://ebox.io/api/liq-lock/liq_lock_events.php", formData).toPromise()).result;

			formData = new FormData();
			formData.append("action", "get_event");
			formData.append("chain_id", this.connectService.chainId$.getValue());
			formData.append("event", "LockTransfer");
			transfers = (await this.http.post<any>("https://ebox.io/api/liq-lock/liq_lock_events.php", formData).toPromise()).result;
		} catch {
			error = true;
		}
	} while (error);

	if(address != undefined)
		creates = creates.filter(function (_x: any) {return _x.returnValues.owner.toLowerCase() == address.toLowerCase()});

    // { [[index]]: [{ oldOwner, newOwner }] }
    const transfersMap: any = {};
    transfers.forEach((t: any) => {
      transfersMap[t.returnValues.index] = transfersMap[t.returnValues.index] || [];
      transfersMap[t.returnValues.index].push({
        oldOwner: t.returnValues.oldOwner,
        newOwner: t.returnValues.newOwner
      });
    });

    // LockCreateFilter when passed the address can't find locks which are transferred, so we'll have to find them via LockTransferFilter
    const indices = new Set();
    for (const index in transfersMap) {
      if (transfersMap.hasOwnProperty(index)) {
        const currentOwner = transfersMap[index][transfersMap[index].length - 1].newOwner;
        if (currentOwner === address) {
          indices.add(index);
        }
      }
    }

    for (const create of creates) {
      const index = (create as any).returnValues.index.toString();
      if (!indices.has(index)) {
        indices.add(index);
      }
    }

    return [...indices].map((index: any) =>
      new LockInitialData(
        Number(index),
        transfersMap[index]
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

  async lockRelease(lock: Lock, _amount: string) {

    const amount = this.connectService.decimalToWei(_amount, lock.token.decimals);

    const tx = await this.liquidityLockerContract
      .lockRelease(lock.index, amount);
    const receipt = await tx.wait();
    return receipt;
  }

}
