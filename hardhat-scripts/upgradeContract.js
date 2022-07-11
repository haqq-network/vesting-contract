// run:
// npx hardhat run ./hardhat-scripts/upgradeContract.js --network rinkeby
// where the last arg is network name

const {ethers, upgrades} = require('hardhat');

const proxyContractAddress = '0x1ba8624B418BFfaA93c369B0841204a9d50fA4D5';
const upgrade = 'HaqqVesting'; // name of the contract

async function main() {

    // const adminAddress = ethers.provider.getSigner();
    const Contract = await ethers.getContractFactory(upgrade);
    let tx = await upgrades.upgradeProxy(proxyContractAddress, Contract);
    console.log("Upgrade tx hash:", tx.deployTransaction.hash);

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });