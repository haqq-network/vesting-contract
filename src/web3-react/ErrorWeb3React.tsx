import React from "react";
import {useWeb3React} from "@web3-react/core";

const ErrorWeb3React: React.FC = () => {

    const {error} = useWeb3React();

    // if (error?.stack){
    //     console.log(error.stack);
    // }

    const styleObj = {
        padding: '0.6rem',
        borderStyle: 'solid',
        borderColor: 'darkRed',
    }

    return (
        <div>
            {error ?
                <div style={styleObj}>
                    {error.name ? <div>{error.name}</div> : null}
                    {error.message ? <div>{error.message}</div> : null}
                    {/*{error.stack ? <div>{error.stack}</div> : null}*/}
                </div>
                : null
            }
        </div>
    )

}

export default ErrorWeb3React;