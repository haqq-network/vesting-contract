const fetch = require('node-fetch');
const {ethers} = require("hardhat");
const yaml_config = require('node-yaml-config');
const config = yaml_config.load('config.yml');

const contractName = 'HaqqVesting';
const contractAddress = config.proxy;
const privateKey = process.env.PRIVATE_KEY || config.private
const withDrawLimit = config.limit

const url = "https://explorer.haqq.network/api?module=logs&action=getLogs&fromBlock=14&toBlock=latest&address=0x1ba8624B418BFfaA93c369B0841204a9d50fA4D5&topic0=0x7a96fe6dfcc54565c447f8c7708e3eadc4fc71f36ae29781f6617d3da8551c4b"
let tx, logs;

async function main() {

    const response = await fetch(url);
    logs = await response.json();

    let abi = [ "event DepositMade(address indexed beneficiaryAddress, uint256 indexed depositId, uint256 indexed timestamp, uint256 sumInWeiDeposited, address depositedBy)" ];
    let iface = new ethers.utils.Interface(abi);

    // remove duplications
    const deposits = new Set();
    for (let i = 0; i < logs.result.length; i++) {
        let log = iface.parseLog(logs.result[i]);
        let {beneficiaryAddress} = log.args;
        deposits.add(beneficiaryAddress)
    }

    const signer = new ethers.Wallet(privateKey, ethers.provider);

    const VestingContract = await ethers.getContractAt(contractName, contractAddress);
    const arr = Array.from(deposits)

    for (let i = 0; i < arr.length; i++) {
        const depositAddress = arr[i]
        let withdrawalAmount = await VestingContract.connect(signer).calculateAvailableSumForAllDeposits(ethers.utils.getAddress(depositAddress))

        console.log(`Deposit ${depositAddress}. Available amount: ${ethers.utils.formatEther(withdrawalAmount)} ISLM`)

        if (withdrawalAmount > ethers.utils.parseEther(withDrawLimit)) {
            tx = await VestingContract.connect(signer).withdraw(depositAddress)
            await tx.wait();
            console.log("Withdraw funds to %s, amount %s, tx hash %s", depositAddress, `${ethers.utils.formatEther(withdrawalAmount)} ISLM`, tx.hash)
        }
    }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
