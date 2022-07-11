type explorerLinkType =
    'https://etherscan.io/'
    | 'https://ropsten.etherscan.io/'
    | 'https://rinkeby.etherscan.io/'
    | 'https://goerli.etherscan.io/'
    | 'https://kovan.etherscan.io/'
    | '' //
    | 'https://bscscan.com/'
    | 'https://testnet.bscscan.com/'

interface explorerLinkInterface {
    [key: string]: explorerLinkType
}

const explorerLink: explorerLinkInterface = {
    '1': 'https://etherscan.io/',
    '3': 'https://ropsten.etherscan.io/',
    '4': 'https://rinkeby.etherscan.io/',
    '5': 'https://goerli.etherscan.io/',
    '42': 'https://kovan.etherscan.io/',
    '31337': '', // hardhat
    '56': 'https://bscscan.com/',
    '97': 'https://testnet.bscscan.com/',
};

export const createBlockLink = (chainId: number, blockNumber: number) => {
    return explorerLink[chainId.toString()]
        + 'block/'
        + blockNumber.toString();
}

export const createTxLink = (chainId: number, txHash: string) => {
    return explorerLink[chainId.toString()]
        + 'tx/'
        + txHash;
}

export const createAddressLink = (chainId: number, address: string) => {
    return explorerLink[chainId.toString()]
        + 'address/'
        + address;
}

