const fs = require('fs');
const ethereumConstants = require("../src/constants/ethereumConstantsAndTypes");
const hardhat = require('hardhat');

const contractConstantsFilePath = './src/constants/contractsConstants.json';
const deploymentLogFilePath = './logs/contracts_deployment.log';

const contractName = 'HaqqVesting';

async function main() {

    const contractFactory = await hardhat.ethers.getContractFactory(contractName);

    console.log("Preparing and sending tx to blockchain ...");

    const deployedContract = await (await contractFactory.deploy([])).deployed();

    console.log("New contract address: ", deployedContract.address);

    const tx = deployedContract.deployTransaction;
    const chainId = tx.chainId; // number
    console.log("chain id:", chainId);

    const chainName = ethereumConstants.default.chainNameByIdNumeric[deployedContract.deployTransaction.chainId.toString()];
    console.log("chain name:", chainName);

    const contractConstants = JSON.parse(fs.readFileSync(contractConstantsFilePath, 'utf8'));
    contractConstants.contracts[contractName].address[chainName] = deployedContract.address;

    fs.writeFileSync(contractConstantsFilePath, JSON.stringify(contractConstants), (error) => {
        console.error(error);
    });

    // ===> log
    const logDirPath = 'logs';
    if (!fs.existsSync(logDirPath)) { // create log directory if not exists
        fs.mkdirSync(logDirPath);
    }
    const logFileLine = new Date().toLocaleString() + ' '
        + contractName + ' '
        + chainName + ' (' + chainId + ') '
        + deployedContract.address + "\r\n";
    fs.appendFileSync( // Synchronously append data to a file, creating the file if it does not yet exist
        deploymentLogFilePath,
        logFileLine
    );

    // https://stackoverflow.com/a/69013840/1697878
    // Wait until the tx has been confirmed (default is 1 confirmation)
    const confirmationsNumber = 6;
    console.log('Waiting for tx to be mined (' + confirmationsNumber + ' confirmations needed before verification)');
    const receipt = await tx.wait(confirmationsNumber);
    if (chainId === 1 || chainId === 3 || chainId === 4 || chainId === 5 || chainId === 42) {
        const secondsToWait = 2;
        console.log("Waiting " + secondsToWait + " seconds so that the contract could be registered on Etherscan");
        return new Promise(resolve => setTimeout(resolve, 1 * 1000))
            .then(() => {
                console.log("Starting Etherscan verification for", deployedContract.address);
                return hardhat.run("verify:verify", {
                    address: deployedContract.address,
                    // constructorArguments: [],
                })
            })
            .then((verificationResult) => {
                // console.log(verificationResult);
            });
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