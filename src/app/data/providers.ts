const APP_NAME = "ebox-app";
const INFURA_API_KEY = "b5b51030cf3e451bb523a3f2ca10e3ff";
const FORTMATIC_API_KEY = "pk_test_ADCE42E053643A95";

const NETWORK_MAP: any = {
    // "reef-mainnet": {
    //     name: "Reef Chain",
	//     currencyName: "REEF",
    //     thumb: "https://assets.coingecko.com/coins/images/13504/small/Group_10572.png",
    //     accountScannerUrl: (address: string) => `https://reefscan.com/account/${address}`
    // },
    // "reef-testnet": {
    //     name: "Reef Testnet",
	//     currencyName: "REEF",
    //     thumb: "https://assets.coingecko.com/coins/images/13504/small/Group_10572.png",
    //     accountScannerUrl: (address: string) => `https://testnet.reefscan.com/account/${address}`
    // },
    "1": {
        name: "Ethereum",
        currencyName: "ETH",
        thumb: "https://assets.coingecko.com/coins/images/279/thumb/ethereum.png",
        accountScannerUrl: (address: string) => `https://etherscan.io/address/${address}`,
        contracts: {
            liquidityLocker: "0xae0E4FADb6078dc6AB48d3963677F33b5C36a2B0"
        }
    },
    "4": {
        name: "Rinkeby Testnet",
		currencyName: "ETH",
        thumb: "https://assets.coingecko.com/coins/images/279/thumb/ethereum.png",
        accountScannerUrl: (address: string) => `https://rinkeby.etherscan.io/address/${address}`,
        contracts: {
            liquidityLocker: "0x9BF572Aedf72C11068e63b798A85a8Cca65A98Db",
            tokenDispenser: "0x8dd4F3AFA4C2c41057f95DC56801b3D0cAfC3A3E"
        }
    },
    "56": {
        name: "Binance Smart Chain",
		currencyName: "BNB",
        thumb: "https://v1exchange.pancakeswap.finance/images/coins/bnb.png",
        accountScannerUrl: (address: string) => `https://bscscan.com/address/${address}`,
        contracts: {
            liquidityLocker: "0xae0E4FADb6078dc6AB48d3963677F33b5C36a2B0"
        }
//		rpcUrlForLogs: "https://bsc-mainnet.gateway.pokt.network/v1/lb/6136201a7bad1500343e248d"
    },
    // "97": {
    //     name: "BSC Testnet",
    //     currencyName: "BNB",
    //     thumb: "https://v1exchange.pancakeswap.finance/images/coins/bnb.png",
    //     accountScannerUrl: (address: string) => `https://testnet.bscscan.com/address/${address}`
    // },
    "137": {
        name: "Polygon",
		currencyName: "MATIC",
        thumb: "https://assets.coingecko.com/coins/images/4713/thumb/matic___polygon.jpg",
        accountScannerUrl: (address: string) => `https://polygonscan.com/address/${address}`,
        contracts: {
            liquidityLocker: "0x7Ce09E06d7F22c3dce3Bd370CFD8BfFfc521bD05"
        },
		rpcUrlForLogs: "https://polygon-mainnet.g.alchemy.com/v2/A7qv_2SwrZf2Ht507mc22GqWRRN-zOvt"
    },
    // "80001": {
    //     name: "Polygon Testnet",
	//     currencyName: "MATIC",
    //     thumb: "https://assets.coingecko.com/coins/images/4713/thumb/matic___polygon.jpg",
    //     accountScannerUrl: (address: string) => `https://mumbai.polygonscan.com/address/${address}`
    // },
    // "1284": {
    //     name: "Moonbeam",
	//     currencyName: "GLMR",
    //     thumb: "https://assets.coingecko.com/coins/images/22459/small/glmr.png",
    //     accountScannerUrl: (address: string) => `https://moonscan.io/address/${address}`
    // },
    // "1285": {
    //     name: "Moonriver",
	//     currencyName: "MOVR",
    //     thumb: "https://assets.coingecko.com/coins/images/17984/small/9285.png",
    //     accountScannerUrl: (address: string) => `https://moonriver.moonscan.io/address/${address}`
    // }
};

const RPCs = [
    {
        rpcUrl: "https://mainnet.infura.io/v3/" + INFURA_API_KEY,
        chainId: 1,
        networkName: "Ethereum"
    },
    {
        rpcUrl: "https://rinkeby.infura.io/v3/" + INFURA_API_KEY,
        chainId: 4,
        networkName: "Rinkeby Testnet"
    },
    {
        rpcUrl: "https://bsc-dataseed.binance.org/",
        chainId: 56,
        networkName: "Binance Smart Chain"
    },
    // {
    //     rpcUrl: "https://data-seed-prebsc-1-s1.binance.org:8545/",
    //     chainId: 97,
    //     networkName: "BSC Testnet"
    // },
    {
        rpcUrl: "https://rpc-mainnet.maticvigil.com/",
        chainId: 187,
        networkName: "Polygon"
    },
    // {
    //     rpcUrl: "https://rpc-mumbai.matic.today/",
    //     chainId: 80001,
    //     networkName: "Polygon Testnet"
    // },
    // {
    //     rpcUrl: "https://rpc.api.moonbeam.network",
    //     chainId: 1284,
    //     networkName: "Moonbeam"
    // },
    // {
    //     rpcUrl: "https://rpc.api.moonriver.moonbeam.network",
    //     chainId: 1285,
    //     networkName: "Moonriver"
    // }
];

export {
    APP_NAME,
    INFURA_API_KEY,
    FORTMATIC_API_KEY,
    NETWORK_MAP,
    RPCs
}