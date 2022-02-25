import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject, zip } from 'rxjs';
import { filter, tap, switchMap, takeUntil, map } from 'rxjs/operators';
import { ethers } from "ethers";
import { BigNumber } from '@ethersproject/bignumber';
import { ProvidersService } from './providers.service';
import { ToastColor, ToasterService } from 'src/app/toaster/toaster.service';
import { NETWORK_MAP } from 'src/app/data/providers';
import { ADDRESS_ZERO, MAX_VALUE } from 'src/app/data/constants';
import { ERC20_ABI } from 'src/app/data/abis';

const LS_KEY = "EBOX_CACHED_PROVIDER";
const SYNC_RATE = 1000;
const CACHE_PROVIDER = true;

@Injectable({
  providedIn: 'root'
})
export class ConnectService {
  
  ethers = ethers;

  provider$ = new BehaviorSubject<ethers.providers.Web3Provider | undefined>(undefined);
  signer$ = new BehaviorSubject<ethers.providers.JsonRpcSigner | undefined>(undefined);

  chainId$ = new BehaviorSubject<string | undefined | null>(undefined);
  selectedAccount$ = new BehaviorSubject<string | undefined | null>(undefined);
  baseTokenBalance$ = new BehaviorSubject<string | undefined | null>(undefined);

  isConnected$ = new BehaviorSubject<boolean>(false);
  networkChangeNotification$ = new Subject();

  unsupportedNetworkFlag = false;
  updateVarsTimer: NodeJS.Timeout;

  constructor(
    private providers: ProvidersService,
    private toasterService: ToasterService
  ) {

    // Tweak the state of connection based on provider, signer, chainId, selectedAccount and baseTokenBalance
    zip(
      this.provider$,
      this.signer$,
      this.chainId$,
      this.selectedAccount$,
      this.baseTokenBalance$
    ).subscribe(values => {

      // When everything has emitted a non-falsy value, it means provider has connected
      let isConnected = values.every(value => value !== null && value !== undefined);

      // Emit a new state only when it changes
      if (this.isConnected$.getValue() !== isConnected) {
        this.isConnected$.next(isConnected);
      }
    });

    // Emit a network change when either chainId or selectedAccount change
    this.chainId$.subscribe(value =>
      this.networkChangeNotification$.next({ topic: "chainId", value })
    );
    this.selectedAccount$.subscribe(value =>
      this.networkChangeNotification$.next({ topic: "selectedAccount", value })
    );

    // Check network on connection
    this.isConnected$.pipe(
      filter(isConnected => isConnected),
      tap(_ => this.checkNetworkSupport())
    )
    .subscribe();

    // If chainId or selectedAccount changed after connection, then reload
    this.isConnected$.pipe(
      filter(isConnected => isConnected),
      switchMap(_ => this.networkChangeNotification$),
      tap(_ => window.location.reload())
    )
    .subscribe();

  }

  private checkNetworkSupport() {
    if (!NETWORK_MAP[(this.chainId$.getValue() || -1)])
      this.unsupportedNetworkFlag = true;
  }

  checksumAddress(address: string): string {
    return this.ethers.utils.getAddress(address);
  }

  // Check if the given address is valid
  isAddressValid(address: string): boolean {
    return this.ethers.utils.isAddress(address);
  }

  async signMessage(message: string) {

    let signer = await this.signer$.getValue();
    if (!signer) {
      this.toasterService.publish(ToastColor.danger, "Message could not be signed, no signer object found.");
      throw new Error();
    }

    let signature;
    try {
      signature = signer.signMessage(message);
    }
    catch (err) {
      this.toasterService.publish(ToastColor.danger, "Message signing aborted by user.");
      throw err;
    }

    this.toasterService.publish(ToastColor.success, "Message signed successfully!");

    // Return the signature to the consumer
    return signature;
  }

  // ethers.utils.formatUnits(wei, decimals)
  weiToDecimal(wei: string, decimals: string|number): string {
    return this.ethers.utils.formatUnits(wei, decimals).toString();
  }

  // ethers.utils.parseUnits(decimalString , decimals)
  decimalToWei(decimalString: string, decimals: string|number): string {
    return this.ethers.utils.parseUnits(decimalString , decimals).toString();
  }

  // Get symbol, name, # of decimals and wei balance (read only query)
  async getTokenInfo(tokenAddress: string) {

    const provider = this.provider$.getValue();
    const contract = new this.ethers.Contract(tokenAddress, ERC20_ABI, provider);

    const [
      symbol,
      name,
      decimals,
      balance
    ] = await Promise.all([
      contract.symbol(),
      contract.name(),
      contract.decimals(),
      this.getTokenBalance(tokenAddress)
    ]);

    return {
      tokenAddress,
      symbol,
      name,
      decimals,
      balance
    }
  }

  // Get wei allowance (read only query)
  async getTokenAllowance(tokenAddress: string, contractAddress: string): Promise<string> {

    // If it's the base token, then allowance is unlimited
    if (tokenAddress == ADDRESS_ZERO) return MAX_VALUE;
    const provider = this.provider$.getValue();
    const selectedAccount = this.selectedAccount$.getValue();
    const contract = new this.ethers.Contract(tokenAddress, ERC20_ABI, provider);
    return (await contract.allowance(selectedAccount, contractAddress)).toString();
  }

  // Get wei balance (read only query)
  async getTokenBalance(tokenAddress: string): Promise<string> {

    const provider = this.provider$.getValue();
    const selectedAccount = this.selectedAccount$.getValue();

    // If it's the base token, then use getBalance...
    if (provider && selectedAccount && tokenAddress == ADDRESS_ZERO)
      return (await provider.getBalance(selectedAccount)).toString();

    // ...otherwise instantiate an ERC20 contract and use balanceOf instead
    const contract = new this.ethers.Contract(tokenAddress, ERC20_ABI, provider);
    return (await contract.balanceOf(selectedAccount)).toString();
  }

  private async _connect(resolve: Function, reject: Function, providerName: string) {

    // Get the provider selected by the user
    let providerConnector = this.providers.PROVIDER_MAP[providerName];
    if (!this.providers.PROVIDER_MAP[providerName]) {
      reject("Provider name not found.");
    }

    let result;
    try {

      // Await the evaluation of the connector
      result = await providerConnector.call(this.providers);
    }
    catch (err) {

      // Clear the cache because it can be that the user dismissed the modal on resumed connection
      this.clearCachedProvider();
      reject(err);
      return;
    }

    this.provider$.next(result.provider);
    this.signer$.next(result.signer);

    // Sync variables
    await this.syncingIntervals(result.getNetwork, result.getAccounts);

    // When the connection is established, cache the provider and resolve
    this.isConnected$.
      subscribe(isConnected => {

        if (isConnected) {
          
          // Cache the current provider
          if (CACHE_PROVIDER) {
            localStorage.setItem(LS_KEY, providerName);
          }
  
          resolve(true);
        }
      });
  }

  connect(providerName?: string) {

    // Return a promise so that it can be awaited by the consumer
    return new Promise(async (resolve, reject) => {

      if (providerName) {
        this._connect(resolve, reject, providerName);
        return;
      }

      // Load the cached provider straight away
      let key = localStorage.getItem(LS_KEY);
      if (CACHE_PROVIDER && key) {
        this._connect(resolve, reject, key);
      }
    });
  }

  clearCachedProvider() {
    localStorage.removeItem(LS_KEY);

    // Manually removing leftovers from wallet providers
    Object.keys(localStorage).forEach(key => {
      if (/(walletlink|walletconnect)/i.test(key)) {
        localStorage.removeItem(key);
      }
    });
  }

  disconnect() {
    this.clearCachedProvider();
    window.location.reload();
  }

  syncingIntervals(getNetwork: Function, getAccounts: Function) {

    let updateVars = async () => {

      // Chain id
      let chainId;
      try {
        let network = await getNetwork();
        chainId = network.chainId;
      }
      catch (err) {
        console.error("Chain id doesn't seem available...", err);

        // If it was impossible to get, then emit it as null and return
        if (this.chainId$.getValue() !== null) {
          this.chainId$.next(null);
        }
        return;
      }
      if (this.chainId$.getValue() !== chainId) {
        this.chainId$.next(chainId);
      }

      // Selected account
      let selectedAccount;
      let response;
      try {
        response = await getAccounts();
      }
      catch (err: any) {
        console.error("Selected account doesn't seem available...", err);

        // If user denied the request (e.g. Fortmatic), then disconnect
        if (err.code == "-32603") {
          this.disconnect();
          throw err;
        }

        // If it was impossible to get, then emit it as null and return
        if (this.selectedAccount$.getValue() !== null) {
          this.selectedAccount$.next(null);
        }
        return;
      }
      if (Array.isArray(response)) {
        selectedAccount = response[0];
      }
      else {
        selectedAccount = response;
      }
      if (this.selectedAccount$.getValue() !== selectedAccount) {
        this.selectedAccount$.next(selectedAccount);
      }

      // Base token balance
      let signer = this.signer$.getValue();
      if (signer !== null && signer !== undefined) {
        let balance;
        try {
          balance = await signer.getBalance();
        }
        catch (err) {
          console.error("Base token amount doesn't seem available...", err);

          // If it was impossible to get, then emit it as null and return
          if (this.baseTokenBalance$.getValue() !== null) {
            this.baseTokenBalance$.next(null);
          }
          return;
        }
        let ether = ethers.utils.formatEther(balance);
        if (this.baseTokenBalance$.getValue() !== ether) {
          this.baseTokenBalance$.next(ether);
        }
      }
    };

    let loop = async () => {
      await updateVars();
      this.updateVarsTimer = setTimeout(() => loop(), SYNC_RATE);
    }

    // Call the above immediately
    if (!this.updateVarsTimer) loop();
  }
  
}
