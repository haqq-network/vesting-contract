import React from "react";
import {useWeb3React} from "@web3-react/core";
import CreateEtherscanLink from "../ethereumUtils/CreateEtherscanLink";
import ClickToCopyIcon from "../components/utils/ClickToCopyIcon";

type ContractAddressProps = {
    address?: string,
}
const ContractAddress = (props: ContractAddressProps) => {

    const {chainId} = useWeb3React();


    return (
        <div>
            <span>Contract address:&nbsp;</span>
            {chainId && props.address ?
                <span>
                    <ClickToCopyIcon textToCopy={props.address}/>
                    &nbsp;
                    <a
                        href={CreateEtherscanLink.createAddressLink(chainId, props.address)}
                        title={'Click to see on blockchain explorer'}
                        target={'_blank'}
                    >
                    <span>
                        {props.address}
                    </span>
                </a>
                </span>
                : 'undefined'}
        </div>
    );
}

export default ContractAddress;