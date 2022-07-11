import React, {useState} from "react";
import {useWeb3React} from "@web3-react/core";
import {formatEther} from "ethers/lib/utils";

/*
* see
* https://codesandbox.io/s/github/NoahZinsmeister/web3-react/tree/v6/example?fontsize=14&hidenavigation=1&theme=dark&file=/pages/index.tsx
* */

interface ChainNativeCurrencySymbolInterface {
    [key: string]: string
}

const chainNativeCurrencySymbol: ChainNativeCurrencySymbolInterface = {
    '1': 'ETH',
    '3': 'ETH',
    '4': 'ETH',
    '5': 'ETH',
    '42': 'ETH',
    '31337': 'ETH', // hardhat
    '56': 'BNB',
    '97': 'BNB',
};

const
    UserBalance: React.FC = () => {

        const {account, library, chainId} = useWeb3React();
        const [balance, setBalance] = useState();

        React.useEffect((): any => {

            if (!!account && !!library) {
                let stale = false

                library
                    .getBalance(account)
                    .then((balance: any) => {
                        if (!stale) {
                            setBalance(balance)
                        }
                    })
                    .catch(() => {
                        if (!stale) {
                            setBalance(undefined);
                        }
                    })

                return () => {
                    stale = true;
                    setBalance(undefined);
                }
            }
        }, [account, library, chainId]) // ensures refresh if referential identity of library doesn't change across chainIds

        return (
            <div>
                <span>Your balance:&nbsp;</span>
                {chainId && balance ?
                    <span>
                        {chainNativeCurrencySymbol[chainId.toString()]}
                        &nbsp;
                        {formatEther(balance)}
                    </span>
                    : 'undefined'
                }
            </div>
        )
    }

export default UserBalance;