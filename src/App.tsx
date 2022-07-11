import React from 'react';
import {BrowserRouter, Route, Routes} from 'react-router-dom';
import urlPrefixForRouter from './router/urlPrefixForRouter';
import Footer from './components/footer/Footer';
import Header from './components/header/Header';
import HomePage from './components/pages/HomePage';
import TestsPage from './components/pages/TestsPage';
import UAParser from 'ua-parser-js';
import {useEagerConnect, useInactiveListener} from './web3-react/web3-react-hooks';
import HaqqVestingDocs from "./docs/HaqqVestingDocs";
import ContractUI from "./components/pages/ContractUI";
import './css/semantic/dist/semantic.min.css';

const App: React.FC = () => {

    // const uaParser = new UAParser();
    // console.log(uaParser.getResult());

    const urlPrefix = urlPrefixForRouter();
    // const urlPrefix = '';

    // handle logic to eagerly connect to the injected ethereum provider, if it exists and has granted access already
    useEagerConnect();
    // const triedEager = useEagerConnect();
    // console.log('triedEager:', triedEager);  // true of false
    // handle logic to connect in reaction to certain events on the injected ethereum provider, if it exists
    useInactiveListener();

    return (
        <BrowserRouter>
            <div className={"ui container"}>
                <Header/>
                <Routes>
                    <Route path={urlPrefix + '/'} element={<HomePage/>}/>
                    <Route path={urlPrefix + '/proxyContract'}
                           element={<ContractUI contractName={'HaqqVestingUpgradeable'}/>}/>
                    <Route path={urlPrefix + '/directContract'} element={<ContractUI contractName={'HaqqVesting'}/>}/>
                    <Route path={urlPrefix + '/directContractDocs'} element={<HaqqVestingDocs/>}/>
                    <Route path={urlPrefix + '/tests'} element={<TestsPage/>}/>

                </Routes>
                <Footer/>
            </div>
        </BrowserRouter>
    );
}

export default App;

