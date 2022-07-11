import React from "react";
import etherGUI, {ContractInteractor, ContractMethod} from 'ether-gui';
import {HaqqVesting__factory} from "../../artifacts/typechain";
import {useWeb3React} from "@web3-react/core";
import {ethers} from "ethers";
import ContractsConstants from '../../constants/contractsConstants.json';
import ContractsConstantsInterface from "../../constants/contractConstantsInerface";
import ethereumConstantsAndTypes from "../../constants/ethereumConstantsAndTypes";
import ContractAddress from "../../web3-react/ContractAddress";
import SemanticUIStyledMethod from "./SemanticUIStyledMethod";

type ContractUiType = {
    contractName: string
}
const ContractUI = (props: ContractUiType) => {

    const contractsConstants: ContractsConstantsInterface = ContractsConstants;
    const web3React = useWeb3React();
    let contractAddress;
    let contract;

    if (web3React && web3React.library && web3React.library.provider) {
        const provider = new ethers.providers.Web3Provider(web3React.library.provider);
        const typechainContractFactory = HaqqVesting__factory;

        if (web3React.chainId) {
            // contractAddress = ProxyContractConstants.contractAddress[web3React.chainId.toString()];
            const chainName = ethereumConstantsAndTypes.chainNameByIdNumeric[web3React.chainId];

            contractAddress = contractsConstants.contracts[props.contractName].address[chainName];
            console.log('contract name:', props.contractName, ', contract address:', contractAddress);

            if (contractAddress) {
                contract = typechainContractFactory.connect(contractAddress, provider);
                if (provider.getSigner()) {
                    contract = typechainContractFactory.connect(contractAddress, provider.getSigner());
                }
            }
        }
    }

    etherGUI.config.setPreferences(
        {
            wording: {}, styles: {
                label: {color: 'black'},
                header: {color: 'black',},
                // https://github.com/webmass/ether-gui/blob/main/src/components/common/StyledButton.tsx
                button: {
                    color: 'black',
                    background: 'silver',
                },
                subcontainer: {border: 'none', marginBottom: 0, paddingBottom: 0, paddingTop: 0}
            }
        }
    );

    return (
        <div className={'ui segment'}>
            <br/>
            {props.contractName ? <div>Contract:&nbsp;<b>{props.contractName}</b><br/><br/></div> : null}
            {contractAddress ?
                <div>
                    <ContractAddress address={contractAddress}/>

                    {contract ?
                        <div>

                            <ContractMethod contract={contract}
                                            methodSignature={'deposit(address)'}
                                            title={'Make Deposit'}

                                            beforeFields={""}

                                            fieldsOptions={
                                                {
                                                    '_beneficiaryAddress': {
                                                        label: 'Beneficiary address for this deposit:'
                                                    },
                                                    'value': {
                                                        label: 'Sum in ETH / ISL:',
                                                        placeholder: '0.001',
                                                    }
                                                }
                                            }
                            />

                            <ContractMethod contract={contract}
                                            methodSignature={'withdraw(address)'}
                                            title={'Withdraw Deposit'}
                                            fieldsOptions={
                                                {
                                                    '_beneficiaryAddress': {
                                                        label: 'Beneficiary address:'
                                                    }
                                                }
                                            }
                            />

                            <br/>
                            <h1>All functions: </h1>
                            <hr/>

                            <ContractInteractor

                                // ContractInteractor will display all contract's methods by default
                                contract={contract}

                                // -- Customized Component to use for contract methods
                                ContractMethodComponent={SemanticUIStyledMethod}

                                // -- specify a list of methods to show, order matters (by defaults all are shown)
                                // methods={[
                                //     // 'deposit(uint256,address)',
                                //     // 'withdraw(uint256)',
                                //     'amountForOneWithdrawal(uint256)',
                                //     'beneficiary(uint256)',
                                //     'amountToWithdrawNow(uint256)',
                                //     'portionsAvailableToWithdraw(uint256)',
                                //     'portionsPaidAlready(uint256)',
                                //     'sumInWeiDeposited(uint256)',
                                //     'timestamp(uint256)',
                                // ]}


                                // you should rebuild to make changes
                                methodsOptions={
                                    {
                                        'deposit(uint256,address)': {
                                            title: 'Make Deposit',
                                            fieldsOptions: {
                                                '_beneficiaryAddress': {label: 'Beneficiary address for this deposit:'},
                                                'value': {
                                                    label: 'Sum in ETH / ISL:',
                                                    placeholder: '0.001',
                                                }
                                            }
                                        },
                                        'withdraw(address)': {
                                            title: 'Withdraw deposit for address:'
                                        },
                                    }
                                }
                            />
                        </div>
                        : null}
                </div>
                : <div>Metamask is not connected or contract is not deployed on this chain</div>
            }


        </div>
    );
}

export default ContractUI;