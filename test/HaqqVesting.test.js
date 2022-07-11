import {expect} from 'chai';
import {hardhat, ethers} from "hardhat";

// https://ethereum.stackexchange.com/a/121702
import {solidity} from "ethereum-waffle";

// npx hardhat test

// Import utilities from OpenZeppelin Test Helpers
// https://docs.openzeppelin.com/test-helpers/
import {
    BN,           // Big Number support
    constants,    // Common constants, like the zero address and largest integers
    expectEvent,  // Assertions for emitted events
    expectRevert, // Assertions for transactions that should fail
} from '@openzeppelin/test-helpers';

// https://ethereum.stackexchange.com/a/121702
import chai from "chai";
import {BigNumber} from "ethers";

chai.use(solidity);

const contractName = 'HaqqVesting';
describe(contractName, function () {

    const NUMBER_OF_PAYMENTS = 24;
    const MAX_DEPOSITS = 5;
    let depositValue = ethers.utils.parseEther("15");
    let adminAddress, beneficiaryOne, beneficiaryTwo, tokenProxy;

    beforeEach(async function () {
        [adminAddress, beneficiaryOne, beneficiaryTwo] = await ethers.getSigners()
        const Token = await ethers.getContractFactory(contractName);
        tokenProxy = await upgrades.deployProxy(Token);
    });

    it('Should read number of withdrawals allowed for each deposit', async function () {
        const numberOfPayments = (await tokenProxy.NUMBER_OF_PAYMENTS()).toNumber();
        expect(numberOfPayments).to.equal(NUMBER_OF_PAYMENTS);
    });

    it('Should make deposit', async function () {
        const initialBeneficiaryBalance = await ethers.provider.getBalance(beneficiaryOne.address);
        let initialContractBalance = await ethers.provider.getBalance(tokenProxy.address);
        console.log('balances before deposit: contract', initialContractBalance.toString(), 'beneficiary', initialBeneficiaryBalance.toString());
        console.log('deposit amount:', depositValue.toString());

        const tx = await tokenProxy.deposit(
            beneficiaryOne.address,
            {
                value: depositValue
            }
        );
        await tx.wait();

        const contractBalance = await ethers.provider.getBalance(tokenProxy.address);
        const beneficiaryBalance = await ethers.provider.getBalance(beneficiaryOne.address);
        console.log('balances after deposit: contract', contractBalance.toString(), 'beneficiary', beneficiaryBalance.toString());
        const restBalance = depositValue - (depositValue / NUMBER_OF_PAYMENTS)
        expect(contractBalance.toString()).to.equal(restBalance.toString());
    });


    it('Should be able make 5 deposits', async function () {
        for (let i = 1; i <= MAX_DEPOSITS; i++) {
            const tx = await tokenProxy.connect(beneficiaryOne).deposit(
                beneficiaryOne.address,
                {
                    value: depositValue
                }
            );
            await tx.wait();
        }
        expect(await tokenProxy.connect(beneficiaryOne).depositsCounter(beneficiaryOne.address)).to.equal(MAX_DEPOSITS)
    });

    it('Should not be able make 6 deposits', async function () {
        for (let i = 1; i <= MAX_DEPOSITS; i++) {
            const tx = await tokenProxy.connect(beneficiaryOne).deposit(
                beneficiaryOne.address,
                {
                    value: depositValue
                }
            );
            await tx.wait();
        }
        await expect(tokenProxy.connect(beneficiaryOne).deposit(beneficiaryOne.address, {value: depositValue})).to.be.revertedWith("Max deposit number for this address reached");
    });

    it('Should transfer deposit ownership', async function () {
        const tx = await tokenProxy.connect(beneficiaryOne).deposit(
            beneficiaryOne.address,
            {
                value: depositValue
            }
        );
        await tx.wait();

        await tokenProxy.connect(beneficiaryOne).transferDepositRights(beneficiaryTwo.address);

        const amountForWithdrawal = await tokenProxy.deposits(beneficiaryTwo.address, 1)
        const amountForWithdrawalOldOwner = await tokenProxy.deposits(beneficiaryOne.address, 1)

        // previous owner should have 0 deposits
        expect(await tokenProxy.depositsCounter(beneficiaryOne.address)).to.equal(0)
        // new owner should have 1 deposit
        expect(await tokenProxy.depositsCounter(beneficiaryTwo.address)).to.equal(1)

        expect(depositValue).to.equal(amountForWithdrawal[1])
        expect(amountForWithdrawalOldOwner[1]).to.equal(0)
    });

    it("Should withdraw deposit", async function () {
        const numberOfPayments = (await tokenProxy.NUMBER_OF_PAYMENTS()).toNumber();
        const timeBetweenPayments = (await tokenProxy.TIME_BETWEEN_PAYMENTS()).toNumber();

        console.log("Testing withdrawals:");
        console.log("Number of payments for one deposit:", numberOfPayments, " (one already made)");
        console.log('Time between payments:', timeBetweenPayments, "seconds");

        const depositTx = await tokenProxy.deposit(
            beneficiaryTwo.address,
            {
                value: depositValue
            }
        );
        await depositTx.wait();

        let contractBalance = await ethers.provider.getBalance(tokenProxy.address);
        let beneficiaryBalance = await ethers.provider.getBalance(beneficiaryTwo.address);
        console.log('contract balance before:', contractBalance.toString());
        console.log('beneficiary address balance before:', beneficiaryBalance.toString());

        for (let i = 1; i < numberOfPayments; i++) {
            await ethers.provider.send('evm_increaseTime', [timeBetweenPayments]);
            await ethers.provider.send('evm_mine');

            await tokenProxy.withdraw(beneficiaryTwo.address);

            contractBalance = await ethers.provider.getBalance(tokenProxy.address);
            beneficiaryBalance = await ethers.provider.getBalance(beneficiaryTwo.address);
            console.log("(" + i + ")");
            console.log('contract balance after withdrawal:', contractBalance.toString(), 'beneficiary:', beneficiaryBalance.toString());
        }
    });

    it("Should not be able to transfer deposit ownership to already used account", async function () {
        let tx = await tokenProxy.connect(beneficiaryOne).deposit(
            beneficiaryOne.address,
            {
                value: depositValue
            }
        );
        await tx.wait();

        await tokenProxy.connect(beneficiaryOne).transferDepositRights(beneficiaryTwo.address);

        tx = await tokenProxy.connect(adminAddress).deposit(
            adminAddress.address,
            {
                value: depositValue
            }
        );
        await tx.wait();

        await expect(tokenProxy.connect(adminAddress).transferDepositRights(beneficiaryTwo.address)).to.be.revertedWith("Only empty account is allowed");

    });
});
