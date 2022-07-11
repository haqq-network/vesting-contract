import React from 'react';
import NavigationMenu from "./NavigationMenu";
import MetaMaskButton from "../../web3-react/MetaMaskButton";

const Header: React.FC = (props) => {
    return (
        <header>
            <MetaMaskButton/>
            <NavigationMenu/>
        </header>
    );
};
export default Header;

