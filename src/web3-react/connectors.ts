import {InjectedConnector} from '@web3-react/injected-connector';

/*
* see:
* https://codesandbox.io/s/github/NoahZinsmeister/web3-react/tree/v6/example?fontsize=14&hidenavigation=1&theme=dark&file=/connectors.ts
* */

export const injected = new InjectedConnector( // browser addons like MetaMask
    {
        supportedChainIds:
            [
                1, // MainNet
                3, // Ropsten
                4, // Rinkeby
                5, // Goerli
                42, // Kovan
                56, // Binance MainNet
                97, // Binance TestNet
                11235, // Haqq MainNet
            ]
    }
);




