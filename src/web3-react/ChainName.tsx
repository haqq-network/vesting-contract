import React from "react";
import {useWeb3React} from "@web3-react/core";
import CreateEtherscanLink from "../ethereumUtils/CreateEtherscanLink";

interface chainNameByIdNumericInterface {
    [key: string]: string
}

const chainNameByIdNumeric: chainNameByIdNumericInterface = { // as provided by ethers signer
    '1': 'Ethereum MainNet',
    '3': 'Ropsten',
    '4': 'Rinkeby',
    '5': 'Goerli',
    '42': 'Kovan',
    '31337': 'Hardhat',
    '56': 'Binance MainNet',
    '97': 'Binance TestNet',
};

const ChainName: React.FC = () => {
    const {chainId} = useWeb3React();
    return (
        <div>
            <span>Chain:</span>&nbsp;
            {chainId ?
                <a
                    href={CreateEtherscanLink.createExplorerLink(chainId)}
                    title={'Click to see blockchain explorer'}
                    target={'_blank'}
                >
                    <span>{chainNameByIdNumeric[chainId.toString()]}</span>
                </a>
                : 'undefined'
            }
        </div>
    );
}

export default ChainName;

