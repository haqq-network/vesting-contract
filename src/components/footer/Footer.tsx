import React from 'react';
import BlockNumber from "../../web3-react/BlockNumber";
import ChainName from "../../web3-react/ChainName";
import UserAddress from "../../web3-react/UserAddress";
import UserBalance from "../../web3-react/UserBalance";

const Footer: React.FC = (props) => {
    return (
        <footer>
            <hr/>
            <ChainName/>
            <BlockNumber/>
            <UserAddress/>
            <UserBalance/>
            <hr/>
        </footer>
    );
};
export default Footer;

