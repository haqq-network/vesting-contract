import chai, {expect} from 'chai';
import {ethers} from "hardhat";
import {solidity} from "ethereum-waffle";

chai.use(solidity);

const contractName = 'HaqqVestingV2';

describe("HaqqVestingV2", function () {
    let HaqqVestingV2, haqqVesting, owner, addr1, addr2;

    beforeEach(async () => {
        HaqqVestingV2 = await ethers.getContractFactory(contractName);
        [owner, addr1, addr2] = await ethers.getSigners();
        haqqVesting = await HaqqVestingV2.deploy();
        await haqqVesting.deployed();
    });

    describe("migrateAll()", () => {
        it("should migrate all deposits and their remaining funds to the migrator address", async () => {
            // get migrator address
            const migratorAddress = await haqqVesting.migrator();

            // Make deposits to addr1
            await haqqVesting.connect(addr1).deposit(addr1.address, {value: ethers.utils.parseEther("1")});
            await haqqVesting.connect(addr1).deposit(addr1.address, {value: ethers.utils.parseEther("1")});

            console.log("migrator balance", await ethers.provider.getBalance(migratorAddress));

            // Migrate all deposits to the migrator address
            await haqqVesting.connect(addr1).migrateAll();

            // Check that all deposits are removed from addr1
            expect(await haqqVesting.depositsCounter(addr1.address)).to.equal(0);

            // Check that the funds have been transferred to the migrator address
            const migratorBalance = await ethers.provider.getBalance(migratorAddress);
            expect(migratorBalance).to.be.equal(ethers.utils.parseUnits("1916666666666666668", "wei"));
        });

        it("should migrate deposit that are vested half of time", async () => {
            const numberOfPayments = (await haqqVesting.NUMBER_OF_PAYMENTS()).toNumber();
            const timeBetweenPayments = (await haqqVesting.TIME_BETWEEN_PAYMENTS()).toNumber();
            await ethers.provider.send('evm_increaseTime', [timeBetweenPayments]);
            await ethers.provider.send('evm_mine');

            // get migrator address
            const migratorAddress = await haqqVesting.migrator();

            // Make deposits to addr1
            await haqqVesting.connect(addr1).deposit(addr1.address, {value: ethers.utils.parseEther("1")});
            await haqqVesting.connect(addr1).deposit(addr1.address, {value: ethers.utils.parseEther("1")});

            // wait for half of time
            await ethers.provider.send('evm_increaseTime', [timeBetweenPayments * numberOfPayments / 2]);
            await ethers.provider.send('evm_mine');

            // Migrate all deposits to the migrator address
            await haqqVesting.connect(addr1).migrateAll();

            // Check that all deposits are removed from addr1
            expect(await haqqVesting.depositsCounter(addr1.address)).to.equal(0);

            // Check that the funds have been transferred to the migrator address
            const migratorBalance = await ethers.provider.getBalance(migratorAddress);
            expect(migratorBalance).to.be.equal(ethers.utils.parseUnits("3833333333333333336", "wei"));
        });
    });
});
