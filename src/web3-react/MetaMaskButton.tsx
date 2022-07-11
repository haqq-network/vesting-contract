import React, {useEffect, useState} from "react";
import {useWeb3React} from "@web3-react/core";
import {injected} from "./connectors";
import {setAppError} from "../store/appSlice";
import {useAppDispatch} from "../store/store";

type MetaMaskButtonPropsType = {};

const MetaMaskButton: React.FC<MetaMaskButtonPropsType> = (props) => {

    const dispatch = useAppDispatch();
    const web3React = useWeb3React();

    // if (web3React.error) {
    //     console.error(web3React.error);
    //     dispatch(setAppError(web3React.error));
    // }
    // - not needed, use errorWeb3React

    const [buttonText, setButtonText] = useState<string>();
    const [buttonTitle, setButtonTitle] = useState<string>();
    // const [loading, setLoading] = useState<boolean>(true);
    // const [color, setColor] = useState<SemanticCOLORS>();
    const [disabled, setDisabled] = useState<boolean>(false);
    // see:
    // https://stackoverflow.com/questions/55621212/is-it-possible-to-react-usestate-in-react
    const [metamaskBtnClickHandler, setMetamaskBtnClickHandler] = useState<Function>(
        () => () => {
        }
    );

    useEffect(() => {
        const {ethereum} = window as any;
        if (web3React.active) {
            setButtonText('MetaMask connected');
            setButtonTitle('Click to disconnect');
            setMetamaskBtnClickHandler(() => () => web3React.deactivate());
        } else if (ethereum) { // user logged in to metamask
            setButtonText('Connect MetaMask');
            setButtonTitle('Click to connect');
            setMetamaskBtnClickHandler(() =>
                () => {
                    web3React.activate(
                        injected,
                        undefined, // If onError (the second argument to activate) is passed, that function is called with the error. No updates to the web3-react context will occur.
                        false // If throwErrors (the third argument to activate) is passed, errors will be thrown and should be handled in a .catch. No updates to the web3-react context will occur.
                    )
                        .then(() => {
                            // see:
                            // https://github.com/NoahZinsmeister/web3-react/blob/v6/docs/README.md#understanding-error-bubbling
                            if (web3React.error) {
                                console.log('web3react connection error:');
                                console.log(web3React.error);
                                // setAppError(web3React.error); //
                            }
                        })
                    // .catch(error => { // if throwErrors is false, not needed (see above)
                    //     console.error(error)
                    // })
                }
            );
        } else {
            setButtonText('Install MetaMask');
            setButtonTitle('Click to open MetaMask download page');
            setMetamaskBtnClickHandler(() => () => window.open('https://metamask.io/download.html'));
        }
    }, [web3React]);

    return (
        <button
            className={'ui primary button'}
            style={{marginTop: '1rem'}}
            title={buttonTitle}
            onClick={() => metamaskBtnClickHandler()}
            disabled={disabled}
        >
            {buttonText}
        </button>
    );
};

export default MetaMaskButton;