export type chainNameType =
    'mainnet'
    | 'ropsten'
    | 'rinkeby'
    | 'goerli'
    | 'kovan'
    | 'hardhat'
    | 'binanceMainNet'
    | 'binanceTestNet'
    | 'haqqtestnet';

export type chainIdHexType = '0x1' | '0x3' | '0x4' | '0x5' | '0x2a' | '0x539' | '0x38' | '0x61' | '0x1db71';

export type chainIdDecimalNumberType = 1 | 3 | 4 | 5 | 42 | 31337 | 56 | 97 | 121713;

export type chainIdDecimalStringType = '1' | '3' | '4' | '5' | '42' | '31337' | '56' | '97' | '121713';

export type explorerLinkType =
    'https://etherscan.io/'
    | 'https://ropsten.etherscan.io/'
    | 'https://rinkeby.etherscan.io/'
    | 'https://goerli.etherscan.io/'
    | 'https://kovan.etherscan.io/'
    | '' //
    | 'https://bscscan.com/'
    | 'https://testnet.bscscan.com/'
    | ' ' //

export type chainType = {
    name: chainNameType,
    idHex: chainIdHexType,
    idDecimalNumber: chainIdDecimalNumberType,
};

type ethereumConstantsInterface = {
    chainIdHex: { [key: string]: chainIdHexType },
    chainIdDecimalNumber: { [key: string]: chainIdDecimalNumberType },
    chainNameByIdHex: { [key: string]: chainNameType },
    chainNameByIdNumeric: { [key: string]: chainNameType },
    chainHexIdToNumber: { [key: string]: chainIdDecimalNumberType },
    chainIdDecimalString: { [key: string]: chainIdDecimalStringType },
    explorerLink: { [key: string]: explorerLinkType },
};

const ethereumConstants: ethereumConstantsInterface = {
    chainIdHex: {
        mainnet: '0x1',
        ropsten: '0x3',
        rinkeby: '0x4',
        goerli: '0x5',
        kovan: '0x2a',
        hardhat: '0x539',
        binanceMainNet: '0x38',
        binanceTestNet: '0x61',
        haqqtestnet: '0x1db71',
    },

    chainIdDecimalNumber: {
        mainnet: 1,
        ropsten: 3,
        rinkeby: 4,
        goerli: 5,
        kovan: 42,
        hardhat: 31337,
        binanceMainNet: 56,
        binanceTestNet: 97,
        haqqtestnet: 121713,
    },
    chainIdDecimalString: {
        mainnet: '1',
        ropsten: '3',
        rinkeby: '4',
        goerli: '5',
        kovan: '42',
        hardhat: '31337',
        binanceMainNet: '56',
        binanceTestNet: '97',
        haqqtestnet: '121713',
    },
    chainNameByIdNumeric: { // as provided by ethers signer
        '1': 'mainnet',
        '3': 'ropsten',
        '4': 'rinkeby',
        '5': 'goerli',
        '42': 'kovan',
        '31337': 'hardhat',
        '56': 'binanceMainNet',
        '97': 'binanceTestNet',
        '12173': 'haqqtestnet',
    },
    chainNameByIdHex: { // as provided by MetaMask
        '0x1': 'mainnet',
        '0x3': 'ropsten',
        '0x4': 'rinkeby',
        '0x5': 'goerli',
        '0x2a': 'kovan',
        '0x539': 'hardhat',
        '0x38': 'binanceMainNet',
        '0x61': 'binanceTestNet',
        '0x1db71': "haqqtestnet",
    },
    chainHexIdToNumber: {
        '0x1': 1,
        '0x3': 3,
        '0x4': 4,
        '0x5': 5,
        '0x2a': 42,
        '0x539': 31337,
        '0x38': 56,
        '0x61': 97,
        '0x1db71': 121713,
    },
    explorerLink: {
        '1': 'https://etherscan.io/',
        '3': 'https://ropsten.etherscan.io/',
        '4': 'https://rinkeby.etherscan.io/',
        '5': 'https://goerli.etherscan.io/',
        '42': 'https://kovan.etherscan.io/',
        '31337': '', // hardhat
        '56': 'https://bscscan.com/',
        '97': 'https://testnet.bscscan.com/',
        '12173': '', // haqqtestnet
    },
};

export const createChainObjFromHexId = (idHex: chainIdHexType) => {
    const chain: chainType = {
        name: ethereumConstants.chainNameByIdHex[idHex],
        idHex: idHex,
        idDecimalNumber: ethereumConstants.chainHexIdToNumber[idHex]
    };
    return chain;
};

export const createChainObjFromChainName = (chainName: chainNameType) => {
    const chain: chainType = {
        name: chainName,
        idHex: ethereumConstants.chainIdHex[chainName],
        idDecimalNumber: ethereumConstants.chainIdDecimalNumber[chainName],
    };
    return chain;
};

export default ethereumConstants;