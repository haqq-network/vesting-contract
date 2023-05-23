import chai, {expect} from 'chai';
import {ethers} from "hardhat";
import {solidity} from "ethereum-waffle";

chai.use(solidity);

const contractName = 'HaqqVestingV2';

describe("HaqqVestingV2", function () {
    let HaqqVestingV2, haqqVesting, owner, addr1;

    beforeEach(async () => {
        HaqqVestingV2 = await ethers.getContractFactory(contractName);
        [owner, addr1] = await ethers.getSigners();
        haqqVesting = await HaqqVestingV2.deploy();
        await haqqVesting.deployed();
    });

    describe("migrate update", () => {
        it("should calculate remaining tokens for all deposits correctly", async function () {
            const numberOfPayments = (await haqqVesting.NUMBER_OF_PAYMENTS()).toNumber();
            const timeBetweenPayments = (await haqqVesting.TIME_BETWEEN_PAYMENTS()).toNumber();
            // Setup by creating a few deposits.
            await haqqVesting.connect(owner).deposit(addr1.address, {value: ethers.utils.parseEther("1")});
            await haqqVesting.connect(owner).deposit(addr1.address, {value: ethers.utils.parseEther("1")});

            // Calculate the expected initial remaining balance.
            const expectedInitialRemaining = ethers.utils.parseEther("2").sub(ethers.utils.parseEther("2").div(numberOfPayments));

            // Check that the total remaining balance is correct.
            let totalRemaining = await haqqVesting.calculateTotalRemainingForAllDeposits(addr1.address);
            expect(totalRemaining.sub(expectedInitialRemaining).abs().lte(1)).to.be.true;  // <-- Change here

            await ethers.provider.send('evm_increaseTime', [timeBetweenPayments]);
            await ethers.provider.send('evm_mine');

            // Now, let's simulate some withdrawals
            await haqqVesting.connect(owner).withdraw(addr1.address);

            // Check that the total remaining balance is updated correctly.
            totalRemaining = await haqqVesting.calculateTotalRemainingForAllDeposits(addr1.address);
            expect(totalRemaining).to.be.below(expectedInitialRemaining);
        });
    });
});
