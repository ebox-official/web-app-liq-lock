import { Injectable } from '@angular/core';
import { ModalsService } from 'src/app/modals/modals.service';
import { ethers } from "ethers";
import detectEthereumProvider from "@metamask/detect-provider";
import WalletLink from "walletlink";
import Fortmatic from "fortmatic";
import WalletConnectProvider from "@walletconnect/web3-provider";
import * as PolkadotExtensionDapp from "@polkadot/extension-dapp";
import * as ReefDefiEvmProvider from "@reef-defi/evm-provider";
import * as PolkadotApi from "@polkadot/api";
import { APP_NAME, FORTMATIC_API_KEY, RPCs } from 'src/app/data/providers';

@Injectable({
  providedIn: 'root'
})
export class ProvidersService {

  PROVIDER_MAP: any = {
    "INJECTED": this.InjectedProviderConnector,
    "METAMASK": this.MetaMaskConnector,
    "BINANCE_CHAIN": this.BinanceConnector,
    "FORTMATIC": this.FortmaticConnector,
    "COINBASE": this.CoinbaseConnector,
    "WALLETCONNECT": this.WalletConnectConnector,
    "POLKADOT": this.PolkadotConnector
  };

  constructor(
    private modalsService: ModalsService
  ) { }

  async InjectedProviderConnector() {
    let provider = null;
    if (typeof (window as any).ethereum !== 'undefined') {
      provider = (window as any).ethereum;
      try {
        await provider.request({ method: 'eth_requestAccounts' })
      } catch (error) {
        throw new Error("User Rejected");
      }
    } else if ((window as any)["web3"]) {
      provider = (window as any)["web3"].currentProvider;
    } else {
      throw new Error("No Provider found");
    }

    // Get ethers provider and signer
    let ethersProvider = new ethers.providers.Web3Provider(provider, "any");
    let signer = ethersProvider.getSigner();

    return {
      provider: ethersProvider,
      signer,
      getNetwork: ethersProvider.getNetwork.bind(ethersProvider),
      getAccounts: ethersProvider.listAccounts.bind(ethersProvider)
    };
  }

  async MetaMaskConnector() {
    let provider: any = await detectEthereumProvider();
    if (!provider) {
      throw new Error("MetaMask was not found.");
    }
    try {
      await provider["request"]({ method: 'eth_requestAccounts' });
    } catch (error) {
      throw new Error("User rejected.");
    }

    // Get ethers provider and signer
    let ethersProvider = new ethers.providers.Web3Provider(provider, "any");
    let signer = ethersProvider.getSigner();

    return {
      provider: ethersProvider,
      signer,
      getNetwork: ethersProvider.getNetwork.bind(ethersProvider),
      getAccounts: ethersProvider.listAccounts.bind(ethersProvider)
    };
  }

  async BinanceConnector() {
    let provider = null;
    if ((window as any)["BinanceChain"]) {
      provider = (window as any)["BinanceChain"];
      try {
        await provider.request({ method: 'eth_requestAccounts' });
      } catch (error) {
        throw new Error("User rejected.");
      }
    } else {
      throw new Error("Binance Wallet was not found.");
    }

    // Get ethers provider and signer
    let ethersProvider = new ethers.providers.Web3Provider(provider, "any");
    let signer = ethersProvider.getSigner();

    return {
      provider: ethersProvider,
      signer,
      getNetwork: ethersProvider.getNetwork.bind(ethersProvider),
      getAccounts: ethersProvider.listAccounts.bind(ethersProvider)
    };
  }

  // Setup of Fortmatic configurations
  async FortmaticConnector() {

    let { rpcUrl, chainId } = await this.modalsService.open("choose-network", {});

    let fm: any = new Fortmatic(FORTMATIC_API_KEY, { rpcUrl, chainId });

    // Get ethers provider and signer
    let ethersProvider = new ethers.providers.Web3Provider(fm.getProvider(), "any");
    let signer = ethersProvider.getSigner();

    return {
      provider: ethersProvider,
      signer,
      getNetwork: () => ({ chainId }),
      getAccounts: ethersProvider.listAccounts.bind(ethersProvider)
    };
  }

  // Setup of Coinbase configurations
  async CoinbaseConnector() {

    let { rpcUrl, chainId } = await this.modalsService.open("choose-network", {});

    let walletLink = new WalletLink({ appName: APP_NAME });
    let provider: any = walletLink.makeWeb3Provider(rpcUrl, chainId);
    await provider.enable();

    // Get ethers provider and signer
    let ethersProvider = new ethers.providers.Web3Provider(provider, "any");
    let signer = ethersProvider.getSigner();

    return {
      provider: ethersProvider,
      signer,
      getNetwork: () => ({ chainId }),
      getAccounts: ethersProvider.listAccounts.bind(ethersProvider)
    };
  }

  // Setup of WalletConnect configurations
  async WalletConnectConnector() {

    let { chainId } = await this.modalsService.open("choose-network", {});

    let RPCMapping = RPCs.
      reduce((obj, rpc) => ((obj as any)[rpc.chainId] = rpc.rpcUrl, obj), {});

    // Create WalletConnect Provider
    let provider = new WalletConnectProvider({
      rpc: { ...RPCMapping },
      chainId
    });

    //  Enable session (triggers QR Code modal)
    await provider.enable();

    // Get ethers provider and signer
    let ethersProvider = new ethers.providers.Web3Provider(provider, "any");
    let signer = ethersProvider.getSigner();

    return {
      provider: ethersProvider,
      signer,
      getNetwork: ethersProvider.getNetwork.bind(ethersProvider),
      getAccounts: ethersProvider.listAccounts.bind(ethersProvider)
    };
  }

  // Setup of Polkadot configurations
  async PolkadotConnector() {

    // Return an array of all the injected sources
    // (this needs to be called first)
    let allInjected = await PolkadotExtensionDapp.web3Enable(APP_NAME);
    let injected: any;
    if (allInjected && allInjected[0] && allInjected[0].signer) {
      injected = allInjected[0].signer;
    }

    // Return an array of { address, meta: { name, source } }
    // (meta.source contains the name of the extension)
    let accounts = await PolkadotExtensionDapp.web3Accounts();

    let { account, rpcUrl, chainId } = await this.modalsService.open("polkadot-provider", { accounts });

    let provider = new ReefDefiEvmProvider.Provider({
      provider: new PolkadotApi.WsProvider(rpcUrl)
    });

    await provider.api.isReady;

    let signer = new ReefDefiEvmProvider.Signer(
      provider,
      account,
      injected
    );

    if (!(await signer.isClaimed())) {
      console.log(
        "No claimed EVM account found -> claimed default EVM account: ",
        await signer.getAddress()
      );
      await signer.claimDefaultAccount();
    }

    let evmAddress = await signer.queryEvmAddress();

    return {
      provider,
      signer,
      getNetwork: () => ({ chainId }),
      getAccounts: () => evmAddress
    };
  }

}
