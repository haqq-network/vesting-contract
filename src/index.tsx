import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import {Web3ReactProvider} from '@web3-react/core'
import {Web3Provider} from "@ethersproject/providers";
import {ExternalProvider, JsonRpcFetchFunc} from "@ethersproject/providers/src.ts/web3-provider";
import {Provider} from "react-redux";
import {store} from "./store/store";

function getLibrary(provider: ExternalProvider | JsonRpcFetchFunc) {
    return new Web3Provider(provider);
}

ReactDOM.render(
    <React.StrictMode>
        <Provider store={store}>
            <Web3ReactProvider getLibrary={getLibrary}>
                <App/>
            </Web3ReactProvider>
        </Provider>
    </React.StrictMode>,
    document.getElementById('root')
);