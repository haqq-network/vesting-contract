import React from "react";
import {useWeb3React} from "@web3-react/core";
import CreateEtherscanLink from "../ethereumUtils/CreateEtherscanLink";
import ClickToCopyIcon from "../components/utils/ClickToCopyIcon";

const UserAddress: React.FC = () => {

    const {chainId, account} = useWeb3React()

    return (
        <div>
            <span>Your address:&nbsp;</span>
            {chainId && account ?
                <span>
                    <ClickToCopyIcon textToCopy={account}/>
                    &nbsp;
                    <a
                        href={CreateEtherscanLink.createAddressLink(chainId, account)}
                        title={'Click to see on blockchain explorer'}
                        target={'_blank'}
                    >
                    <span>
                        {account}
                    </span>
                </a>
                </span>
                : 'undefined'}
        </div>
    );
}

export default UserAddress;