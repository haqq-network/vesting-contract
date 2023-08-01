import fetch from 'node-fetch';
import hre from "hardhat";

const contractName = 'HaqqVesting';
const contractAddress = "0x1ba8624B418BFfaA93c369B0841204a9d50fA4D5";

const url = "https://explorer.haqq.network/api?module=logs&action=getLogs&fromBlock=14&toBlock=latest&address=0x1ba8624B418BFfaA93c369B0841204a9d50fA4D5&topic0=0x7a96fe6dfcc54565c447f8c7708e3eadc4fc71f36ae29781f6617d3da8551c4b"
let tx, logs;

async function main() {

    const response = await fetch(url);
    logs = await response.json();

    let abi = [ "event DepositMade(address indexed beneficiaryAddress, uint256 indexed depositId, uint256 indexed timestamp, uint256 sumInWeiDeposited, address depositedBy)" ];
    let iface = new hre.ethers.utils.Interface(abi);

    // remove duplications
    console.log("transactionHash,depositedBy,beneficiaryAddress,amount,date")
    for (let i = 0; i < logs.result.length; i++) {
        process.stdout.write(logs.result[i].transactionHash + ",")
        let log = iface.parseLog(logs.result[i]);
        // get tx hash from log, date, amount
        process.stdout.write(log.args.depositedBy+ ",")
        process.stdout.write(log.args.beneficiaryAddress+ ",")
        process.stdout.write(hre.ethers.utils.formatEther(log.args.sumInWeiDeposited.toString())+ ",")
        // convert timestamp to date
        console.log(new Date(log.args.timestamp * 1000).toISOString().slice(0, 19).replace('T', ' '))
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
