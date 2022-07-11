import React from "react";
import {NavLink} from "react-router-dom";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import urlPrefixForRouter from "../../router/urlPrefixForRouter";
import {faHome, faFlask, faFileSignature} from "@fortawesome/free-solid-svg-icons";
// import {Menu} from "semantic-ui-react";

const NavigationMenu: React.FC = () => {

    const urlPrefix = urlPrefixForRouter();

    return (

        <div className={'ui four item menu'}>

            <NavLink to={urlPrefix + '/'} className={'ui item'}>
                <FontAwesomeIcon icon={faHome}/>
                Home
            </NavLink>
            &nbsp;&nbsp;
            <NavLink to={urlPrefix + '/proxyContract'} className={'ui item'}>
                <FontAwesomeIcon icon={faFileSignature}/>
                Contract Upgradeable (Proxy)
            </NavLink>
            &nbsp;&nbsp;
            <NavLink to={urlPrefix + '/directContract'} className={'ui item'}>
                <FontAwesomeIcon icon={faFileSignature}/>
                Direct Contract
            </NavLink>
            &nbsp;&nbsp;
            <NavLink to={urlPrefix + '/directContractDocs'} className={'ui item'}>
                <FontAwesomeIcon icon={faFileSignature}/>
                Contract Docs
            </NavLink>

            {/*&nbsp;&nbsp;*/}
            {/*<NavLink to={urlPrefix + '/tests'}>*/}
            {/*    [*/}
            {/*    <FontAwesomeIcon icon={faFlask}/>*/}
            {/*    Tests]*/}
            {/*</NavLink>*/}

        </div>

    );
}

export default NavigationMenu;