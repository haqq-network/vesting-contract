const {ethers} = require("hardhat");
const hardhat = require("hardhat");
const {Wallet} = require("ethers");
const {getApprovePermit} = require("../test/utils");

const networkMainnet = 'ropsten'; // for test is ropsten id 3
const networkHaqqNet = 'goerli'; // for test is goerli id = 5

const providerMainnet = ethers.getDefaultProvider(networkMainnet, {
    infura: {
        projectId: '461e8ab5e02d42e98abb0042f997d306', projectSecret: '8754cecf54254534b893f8025ab03f63',
    },
})

const providerHaqqNet = ethers.getDefaultProvider(networkHaqqNet, {
    infura: {
        projectId: '4caf0abc1c81486fa2985a9cab3c9497', projectSecret: '553558ea5ded43d1b70ab6738c14ca51',
    },
})

const teamMainnet = new Wallet(process.env.PRIVATE_KEY_TEAM, providerMainnet);
const teamHaqqNet = new Wallet(process.env.PRIVATE_KEY_TEAM, providerHaqqNet);
const investorMainNet = new Wallet(process.env.PRIVATE_KEY_INVESTOR, providerMainnet);
const investorHaqqNet = new Wallet(process.env.PRIVATE_KEY_INVESTOR, providerHaqqNet);

const depositContractName = 'LockedDeposit'; // name of the contract
const vestingContractName = 'HaqqVesting'; // name of the contract
const stableContractName = 'StableToken'; // name of the contract
async function main() {
    const depositContractFactory = await hardhat.ethers.getContractFactory(depositContractName);
    const contractFactoryVesting = await hardhat.ethers.getContractFactory(vestingContractName);
    const stableFactory = await hardhat.ethers.getContractFactory(stableContractName);

    const vestingHaqqNet = await (await contractFactoryVesting.connect(teamHaqqNet).deploy()).deployed();
    const stableContract = await (await stableFactory.connect(investorMainNet).deploy()).deployed();

    console.log("vestingHaqqNet", vestingHaqqNet.address)
    console.log("stableContract", stableContract.address)

    const depositContractMainnet = await (await depositContractFactory.connect(teamMainnet)
        .deploy("LockedDeposit", vestingHaqqNet.address)).deployed();
    console.log("depositContractMainnet", depositContractMainnet.address)
    const depositContractHaqqNet = await (await depositContractFactory.connect(teamHaqqNet)
        .deploy("LockedDeposit", vestingHaqqNet.address)).deployed();
    console.log("depositContractHaqqNet", depositContractHaqqNet.address)

    const balanceInvestorStable = await stableContract.balanceOf(investorMainNet.address);
    console.log("Balance:", balanceInvestorStable.toString());

    let d = new Date();
    d.setDate(d.getDate() + 31);

    const depositAmount = ethers.utils.parseEther("0.001").toString();
    const createdAt = Math.floor(Date.now() / 1000);
    const deadline = Math.floor(d.valueOf() / 1000);

    const networkMainnet = await providerMainnet.getNetwork()
    const networkHaqqnet = await providerHaqqNet.getNetwork()

    console.log("networkMainnet:", networkMainnet.chainId)
    console.log("networkHaqqnet:", networkHaqqnet.chainId)

    const permitMainnet = await getApprovePermit(teamMainnet, depositContractMainnet, {
        amount: depositAmount,
        createdAt: createdAt,
        deadline: deadline,
        investor: investorMainNet.address,
        team: teamMainnet.address,
        currency: stableContract.address,
        vestingContractAddress: vestingHaqqNet.address,
        chainId: networkMainnet.chainId
    })

    const permitHaqqNet = await getApprovePermit(teamHaqqNet, depositContractHaqqNet, {
        amount: depositAmount,
        createdAt: createdAt,
        deadline: deadline,
        investor: investorMainNet.address,
        team: teamMainnet.address,
        currency: stableContract.address,
        vestingContractAddress: vestingHaqqNet.address,
        chainId: networkHaqqnet.chainId
    })

    // create deal for both networks
    let tx = await depositContractMainnet.connect(teamMainnet).createDeal(permitMainnet.signedData.message);
    await tx.wait();
    tx = await depositContractHaqqNet.connect(teamHaqqNet).createDeal(permitHaqqNet.signedData.message);
    await tx.wait();
    // ======================================================================

    // load deal from mainnet and haqqnet
    const storedPermitMainnet = await depositContractMainnet.permitsLookUp(investorMainNet.address, 0)

    // make deposit in mainnet with investor wallet
    await stableContract.connect(investorMainNet).approve(depositContractMainnet.address, storedPermitMainnet.amount);

    await depositContractMainnet.connect(investorMainNet).deposit(permitMainnet.signedData.message);
    // ======================================================================

    // load deal from haqqnet
    const storedPermitHaqqNet = await depositContractHaqqNet.permitsLookUp(teamMainnet.address, 0)
    // make deposit in haqqnet with team wallet
    await depositContractHaqqNet.connect(teamHaqqNet).deposit(permitHaqqNet.signedData.message, {value: storedPermitHaqqNet.amount})


    // team check deposit from investor and sign approve message
    const signedPermitForMainnet = await getApprovePermit(teamHaqqNet, depositContractHaqqNet, permitHaqqNet.signedData.message)
    let signature = ethers.utils.splitSignature(signedPermitForMainnet.signature)

    tx = await depositContractMainnet.connect(teamMainnet).approve(signedPermitForMainnet.signedData.message,
        {
            v: signature.v,
            r: signature.r,
            s: signature.s
        })
    await tx.wait();

    // investor check deposit from team and sign approve
    const signedPermitForHaqqNet = await getApprovePermit(investorMainNet, depositContractMainnet, permitMainnet.signedData.message)
    signature = ethers.utils.splitSignature(signedPermitForHaqqNet.signature)

    tx = await depositContractHaqqNet.connect(investorHaqqNet).approve(signedPermitForHaqqNet.signedData.message, {
        v: signature.v,
        r: signature.r,
        s: signature.s
    })
    await tx.wait();

    // investor load signed message from haqq team from mainnet and claim funds in haqqnet
    const approvedPermitFromTeam = await depositContractMainnet.permitsLookUp(investorMainNet.address, 0)
    // load signature from mainnet
    let permit = {
        amount: approvedPermitFromTeam.amount,
        createdAt: approvedPermitFromTeam.createdAt,
        deadline: approvedPermitFromTeam.deadline,
        investor: approvedPermitFromTeam.investor,
        team: approvedPermitFromTeam.team,
        currency: approvedPermitFromTeam.currency,
        vestingContractAddress: approvedPermitFromTeam.vestingContractAddress,
        chainId: networkHaqqnet.chainId,
    }
    const signatureMainnet = await depositContractMainnet.getSignatureByPermit(permit)
    // claim deposit in haqqnet with signed permit from mainnet
    tx = await depositContractHaqqNet.connect(investorHaqqNet).claimDeposit(permit, {
        v: signatureMainnet.v,
        r: signatureMainnet.r,
        s: signatureMainnet.s
    })
    await tx.wait();
    console.log("claim deposit in haqqnet", tx.hash)
    // ======================================================================

    // team take signed approved from investor in haqq and claim funds in mainnet
    const approvedPermitFromInvestor = await depositContractHaqqNet.permitsLookUp(teamHaqqNet.address, 0)
    permit = {
        amount: approvedPermitFromInvestor.amount,
        createdAt: approvedPermitFromInvestor.createdAt,
        deadline: approvedPermitFromInvestor.deadline,
        investor: approvedPermitFromInvestor.investor,
        team: approvedPermitFromInvestor.team,
        currency: approvedPermitFromInvestor.currency,
        vestingContractAddress: approvedPermitFromInvestor.vestingContractAddress,
        chainId: networkMainnet.chainId,
    }
    // load signature from haqqnet
    const signatureHaqqnet = await depositContractHaqqNet.getSignatureByPermit(permit)
    // claim deposit in mainnet
    tx = await depositContractMainnet.connect(teamMainnet).claimDeposit(permit, {
        v: signatureHaqqnet.v,
        r: signatureHaqqnet.r,
        s: signatureHaqqnet.s
    })
    await tx.wait();
    console.log("claim deposit in mainnet", tx.hash)
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
