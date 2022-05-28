import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { ethers } from "ethers";
import { ProvidersService } from './providers.service';
import { ToastColor, ToasterService } from 'src/app/toaster/toaster.service';
import { NETWORK_MAP } from 'src/app/data/providers';
import { ADDRESS_ZERO, MAX_VALUE } from 'src/app/data/constants';
import { ERC20_ABI } from 'src/app/data/abis';
import { HttpClient } from '@angular/common/http';

export class Token {

  constructor(
    public address: string,
    public symbol: string,
    public name: string,
    public decimals: string,
    public balance?: string
  ) { }

}

interface NetworkChangeNotification {
  topic: string,
  value: string
}

const LS_KEY = "EBOX_CACHED_PROVIDER";
const SYNC_RATE = 1000;
const CACHE_PROVIDER = true;

@Injectable({
  providedIn: 'root'
})
export class ConnectService {
  
  ethers;
  provider: ethers.providers.Web3Provider;
  signer: ethers.providers.JsonRpcSigner;

  chainId$: BehaviorSubject<string>;
  selectedAccount$: BehaviorSubject<string>;
  baseTokenBalance$: BehaviorSubject<string>;

  isConnected$: BehaviorSubject<boolean>;
  networkChangeNotification$: Subject<NetworkChangeNotification>;
  unsupportedNetworkFlag: boolean;
  
  loadingUserTokens$: BehaviorSubject<boolean>;
  userTokensInitialized$: BehaviorSubject<boolean>;
  userTokens$: BehaviorSubject<Token[]>;

  constructor(
    private providers: ProvidersService,
    private toasterService: ToasterService,
    private http: HttpClient
  ) {
    this.ethers = ethers;

    this.loadingUserTokens$ = new BehaviorSubject<boolean>(false);
    this.userTokensInitialized$ = new BehaviorSubject<boolean>(false);
    this.userTokens$ = new BehaviorSubject<Token[]>([]);

    this.isConnected$ = new BehaviorSubject<boolean>(false);
    this.networkChangeNotification$ = new Subject();
    this.unsupportedNetworkFlag = false;
  }

  // Decide whether to connect via cached provider or not
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

  // Resolve connector and initialize connection variables
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

    // Initialize provider and signer
    this.provider = result.provider;
    this.signer = result.signer;

    // Initialize chainId
    const { chainId: originalChainId } = await result.getNetwork();
    this.chainId$ = new BehaviorSubject(originalChainId);

    // Initialize selectedAccount
    const accounts = await result.getAccounts();
    const originalSelectedAccount = (Array.isArray(accounts)) ? accounts[0] : accounts;
    this.selectedAccount$ = new BehaviorSubject(originalSelectedAccount);

    // Initialize baseTokenBalance
    const balance = await result.signer.getBalance();
    this.baseTokenBalance$ = new BehaviorSubject(ethers.utils.formatEther(balance));

    this.pollConnectionVariables(result.getNetwork, result.getAccounts, result.signer);

    // Connection established
    this.isConnected$.next(true);
    this.checkNetworkSupport();

    // If chainId or selectedAccount change, then reload
    this.chainId$.subscribe(value => {
      if (value !== originalChainId) window.location.reload();
    });
    this.selectedAccount$.subscribe(value => {
      if (value !== originalSelectedAccount) window.location.reload();
    });

    this.pollUserTokens();

    if (CACHE_PROVIDER)
      localStorage.setItem(LS_KEY, providerName);
    
    resolve(true);
  }

  private async pollConnectionVariables(
    getNetwork: Function,
    getAccounts: Function,
    signer: ethers.providers.JsonRpcSigner
  ) {

    // Update chainId
    const { chainId } = await getNetwork();
    this.chainId$.next(chainId);

    // Update selectedAccount
    const accounts = await getAccounts();
    const selectedAccount = (Array.isArray(accounts)) ? accounts[0] : accounts;
    this.selectedAccount$.next(selectedAccount);

    // Update baseTokenBalance
    const balance = await signer.getBalance();
    this.baseTokenBalance$.next(ethers.utils.formatEther(balance));

    setTimeout(() => this.pollConnectionVariables(getNetwork, getAccounts, signer), SYNC_RATE);
  }

  private checkNetworkSupport() {
    if (!NETWORK_MAP[(this.chainId$.getValue() || -1)])
      this.unsupportedNetworkFlag = true;
  }

  private async pollUserTokens() {
    this.loadingUserTokens$.next(true);

    const selectedAccount = this.selectedAccount$.getValue();
    if (!selectedAccount)
      throw new Error("Selected account is falsy, cannot get tokens.");
    
    const formData = new FormData();
    formData.append("action", "get_tokens");
    formData.append("address", selectedAccount);
    formData.append("chain", this.chainId$.getValue());

    const userTokens: any[] = await this.http.post<any>(
      "https://www.ebox.io/liq-lock/moralis.php",
      formData
    )
    .toPromise();

    this.userTokens$.next(
      userTokens.map(t =>
        new Token(
          t.token_address,
          t.symbol,
          t.name,
          t.decimals,
          t.balance
        )
      )
    );

    this.loadingUserTokens$.next(false);
    this.userTokensInitialized$.next(true);

    setTimeout(() => this.pollUserTokens(), 10 * SYNC_RATE);
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

  checksumAddress(address: string): string {
    return this.ethers.utils.getAddress(address);
  }

  // Check if the given address is valid
  isAddressValid(address: string): boolean {
    return this.ethers.utils.isAddress(address);
  }

  async signMessage(message: string) {

    let signer = await this.signer;
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

  // Get symbol, name, # of decimals and (if needed) wei balance (read only query)
  async getTokenInfo(tokenAddress: string, withBalance = false) {

    const contract = this.getTokenContract(tokenAddress);

    const [
      symbol,
      name,
      decimals
    ] = await Promise.all([
      contract.symbol(),
      contract.name(),
      contract.decimals()
    ]);

    let balance;
    if (withBalance)
      balance = await this.getTokenBalance(tokenAddress);

    return new Token(
      tokenAddress,
      symbol,
      name,
      decimals,
      balance
    );
  }

  // Get wei allowance (read only query)
  async getTokenAllowance(tokenAddress: string, contractAddress: string): Promise<string> {

    // If it's the base token, then allowance is unlimited
    if (tokenAddress == ADDRESS_ZERO) return MAX_VALUE;
    const selectedAccount = this.selectedAccount$.getValue();
    const contract = this.getTokenContract(tokenAddress);
    return (await contract.allowance(selectedAccount, contractAddress)).toString();
  }

  // Get wei balance (read only query)
  async getTokenBalance(tokenAddress: string): Promise<string> {

    const selectedAccount = this.selectedAccount$.getValue();

    // If it's the base token, then use getBalance...
    if (selectedAccount && tokenAddress == ADDRESS_ZERO)
      return (await this.provider.getBalance(selectedAccount)).toString();

    // ...otherwise instantiate an ERC20 contract and use balanceOf instead
    const contract = this.getTokenContract(tokenAddress);
    return (await contract.balanceOf(selectedAccount)).toString();
  }

  // Get token contract using generic ERC-20 ABI
  getTokenContract(tokenAddress: string): ethers.Contract {
    return new this.ethers.Contract(tokenAddress, ERC20_ABI, this.signer);
  }
  
}
