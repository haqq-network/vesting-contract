import {SignerWithAddress} from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import {BigNumberish} from "ethers";
import {LockedDeposit} from "../src/artifacts/typechain";


export async function getApprovePermit(signer: SignerWithAddress,
                                       contract: LockedDeposit,
                                       permitFields: {
                                           amount?: BigNumberish,
                                           createdAt?: BigNumberish,
                                           deadline?: BigNumberish,
                                           investor?: string,
                                           team?: string,
                                           currency?: string,
                                           vestingContractAddress?: string,
                                           chainId?: BigNumberish,
                                       }
) {
    const signedData = {
        EIP712Version: '4',
        domain: {
            name: 'LockedDeposit',
            version: '1',
            // TODO: remove this when we have a proper chainId
            chainId: permitFields.chainId,
            // chainId: ethers.BigNumber.from(await signer.getChainId()),
            verifyingContract: contract.address
        },
        types: {
            ApproveDepositPermit: [
                {name: 'amount', type: 'uint256'},
                {name: 'createdAt', type: 'uint256'},
                {name: 'deadline', type: 'uint256'},
                {name: 'investor', type: 'address'},
                {name: 'team', type: 'address'},
                {name: 'currency', type: 'address'},
                {name: 'vestingContractAddress', type: 'address'},
                {name: 'chainId', type: 'uint256'},
            ],
        },
        primaryType: 'ApproveDepositPermit',
        message: {
            amount: permitFields?.amount ?? 1,
            createdAt: permitFields?.createdAt ?? Math.floor(Date.now() / 1000),
            deadline: permitFields?.deadline ?? Math.floor((Date.now() + 2592000000) / 1000), // 30 days
            investor: permitFields?.investor ?? "0x0000000000000000000000000000000000000000",
            team: permitFields?.team ?? "0x0000000000000000000000000000000000000000",
            currency: permitFields?.currency ?? "0x0000000000000000000000000000000000000000", // using the zero address means anyone can claim
            vestingContractAddress: permitFields?.vestingContractAddress ?? "0x0000000000000000000000000000000000000000",
            chainId: permitFields?.chainId ?? 1,
        }
    };

    const signature = await signer._signTypedData(signedData.domain, signedData.types as any, signedData.message)

    return {signedData, signature};
}