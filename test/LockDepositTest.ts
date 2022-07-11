import {SignerWithAddress} from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import {time} from "@nomicfoundation/hardhat-network-helpers";
import '@openzeppelin/hardhat-upgrades';
import {ethers} from "hardhat";
import {HaqqVesting, LockedDeposit, StableToken} from "../src/artifacts/typechain";
import {getApprovePermit} from "./utils";

describe("Locked Deposit Contract", function () {
    let contractLockedDeposit: LockedDeposit
    let contractVesting: HaqqVesting
    let investor: SignerWithAddress
    let team: SignerWithAddress
    let stableToken: StableToken
    let network: any;

    beforeEach(async () => {
        [investor, team] = await ethers.getSigners()

        const HaqqVestingFactory = await ethers.getContractFactory("HaqqVesting");
        const StableTokenFactory = await ethers.getContractFactory("StableToken");
        contractVesting = await HaqqVestingFactory.deploy();
        await contractVesting.deployed();
        stableToken = await StableTokenFactory.connect(investor).deploy();
        await stableToken.deployed();
        const LockedDepositFactory = await ethers.getContractFactory("LockedDeposit");
        contractLockedDeposit = await LockedDepositFactory.deploy("LockedDeposit", contractVesting.address);
        await contractLockedDeposit.deployed();
    });

    it("investor should be able approve permit", async () => {
        network = await ethers.provider.getNetwork()
        const depositAmount = ethers.utils.parseEther("1").toString();
        const createdAt = await time.latest();
        const deadline = createdAt + 2678400;
        console.log("deadline: ", deadline.toString(10))
        const permit = await getApprovePermit(team, contractLockedDeposit, {
            amount: depositAmount,
            createdAt: createdAt,
            deadline: deadline,
            investor: investor.address,
            team: team.address,
            currency: stableToken.address,
            vestingContractAddress: contractVesting.address,
            chainId: network.chainId
        })

        await contractLockedDeposit.connect(team).createDeal(permit.signedData.message)

        await contractLockedDeposit.connect(team).deposit(permit.signedData.message, {value: depositAmount})

        const storedPermit = await contractLockedDeposit.permitsLookUp(investor.address, 0)

        const signedPermit = await getApprovePermit(investor, contractLockedDeposit, {
            amount: storedPermit.amount.toString(),
            createdAt: storedPermit.createdAt.toNumber(),
            deadline: storedPermit.deadline.toNumber(),
            investor: storedPermit.investor.toString(),
            team: storedPermit.team.toString(),
            currency: storedPermit.currency.toString(),
            vestingContractAddress: storedPermit.vestingContractAddress.toString(),
            chainId: storedPermit.chainId.toNumber()
        })
        const {r, s, v} = ethers.utils.splitSignature(signedPermit.signature)

        await contractLockedDeposit.connect(investor).approve(signedPermit.signedData.message, {
            v: v,
            r: r,
            s: s,
        })

    })

    it("team should be able approve permit", async () => {
        const depositAmount = ethers.utils.parseEther("1").toString();
        const createdAt = await time.latest();
        const deadline = createdAt + 2678400;
        const permit = await getApprovePermit(team, contractLockedDeposit, {
            amount: depositAmount,
            createdAt: createdAt,
            deadline: deadline,
            investor: investor.address,
            team: team.address,
            currency: stableToken.address,
            vestingContractAddress: contractVesting.address,
            chainId: 1
        })

        await contractLockedDeposit.connect(team).createDeal(permit.signedData.message);

        await stableToken.connect(investor).approve(contractLockedDeposit.address, depositAmount);

        await contractLockedDeposit.connect(investor).deposit(permit.signedData.message, {value: depositAmount});

        const storedPermit = await contractLockedDeposit.permitsLookUp(investor.address, 0);

        const signedPermit = await getApprovePermit(team, contractLockedDeposit, {
            amount: storedPermit.amount.toString(),
            createdAt: storedPermit.createdAt.toNumber(),
            deadline: storedPermit.deadline.toNumber(),
            investor: storedPermit.investor.toString(),
            team: storedPermit.team.toString(),
            currency: storedPermit.currency.toString(),
            vestingContractAddress: storedPermit.vestingContractAddress.toString(),
            chainId: storedPermit.chainId.toNumber()
        })
        const {r, s, v} = ethers.utils.splitSignature(signedPermit.signature)

        await contractLockedDeposit.connect(team).approve(signedPermit.signedData.message, {
            v: v,
            r: r,
            s: s,
        })

    })

    it("investor should be able withdraw deposit on deadline expire", async () => {
        network = await ethers.provider.getNetwork()
        const depositAmount = ethers.utils.parseEther("1").toString();
        const createdAt = await time.latest();
        const deadline = createdAt + 2678400;
        console.log("deadline: ", deadline.toString(10))
        const permit = await getApprovePermit(team, contractLockedDeposit, {
            amount: depositAmount,
            createdAt: createdAt,
            deadline: deadline,
            investor: investor.address,
            team: team.address,
            currency: stableToken.address,
            vestingContractAddress: contractVesting.address,
            chainId: network.chainId
        })

        await contractLockedDeposit.connect(team).createDeal(permit.signedData.message)

        await contractLockedDeposit.connect(team).deposit(permit.signedData.message, {value: depositAmount})

        await time.setNextBlockTimestamp(deadline + 1)

        await contractLockedDeposit.connect(investor).claimOnDeadline(permit.signedData.message)

    })
});