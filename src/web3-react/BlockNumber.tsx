import React from "react";
import {useWeb3React} from "@web3-react/core";
import EtherscanLink from '@metamask/etherscan-link';
import CreateEtherscanLink from "../ethereumUtils/CreateEtherscanLink";

/*
* see example on:
* https://codesandbox.io/s/github/NoahZinsmeister/web3-react/tree/v6/example?fontsize=14&hidenavigation=1&theme=dark&file=/pages/index.tsx
* function BlockNumber()
* */
function BlockNumber() {

    const {chainId, library} = useWeb3React();
    const [blockNumber, setBlockNumber] = React.useState<number>();

    React.useEffect((): any => {
        if (!!library) {

            let stale = false

            library
                .getBlockNumber()
                .then((blockNumber: number) => {
                    if (!stale) {
                        setBlockNumber(blockNumber)
                    }
                })
                .catch(() => {
                    if (!stale) {
                        // TypeScript error:
                        // Argument of type 'null' is not assignable to parameter of type 'SetStateAction<number | undefined>'.
                        // setBlockNumber(null)
                        setBlockNumber(undefined);
                    }
                })

            const updateBlockNumber = (blockNumber: number) => {
                setBlockNumber(blockNumber)
            }

            library.on('block', updateBlockNumber)

            return () => {
                stale = true
                library.removeListener('block', updateBlockNumber)
                setBlockNumber(undefined)
            }
        }
    }, [library, chainId]) // ensures refresh if referential identity of library doesn't change across chainIds

    return (
        <div>
            <span>Current block number:&nbsp;</span>
            {chainId && blockNumber ?
                // <a
                //     href={CreateEtherscanLink.createBlockLink(chainId, blockNumber)}
                //     title={'Click to see on blockchain explorer'}
                //     target={'_blank'}
                // >
                <span>{blockNumber}</span>
                // </a>
                : 'undefined'
            }
        </div>
    )
}

export default BlockNumber;