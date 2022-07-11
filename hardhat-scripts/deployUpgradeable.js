const fs = require('fs');
const ethereumConstants = require("../src/constants/ethereumConstantsAndTypes");
const { upgrades, ethers } = require("hardhat");
const env = require("../.env");

const contractConstantsFilePath = './src/constants/contractsConstants.json';
const deploymentLogFilePath = './logs/contracts_deployment.log';

const contractName = 'HaqqVesting';
const contractNameSuffix = 'Upgradeable';

const sleep = async (milliseconds) => {
  await new Promise(resolve => setTimeout(resolve, milliseconds));
}

let deposits = {
  [env.default.founders1Address]: ethers.utils.parseEther(env.default.founders1Amount.toString(), "wei"),
  [env.default.founders2Address]: ethers.utils.parseEther((env.default.founders2Amount - 0.1).toString(), "wei"),
};


let admin, tx, receipt;

async function main() {

  // proxy deployer, cant interact with proxy
  [admin] = await ethers.getSigners()

  console.log("Preparing and sending tx to blockchain ...");
  const Contract = await ethers.getContractFactory(contractName);
  const deployedContract = await upgrades.deployProxy(Contract);

  console.log("New contract address:", deployedContract.address);

  await sleep(5000)

  const VestingContract = await ethers.getContractAt(contractName, deployedContract.address)

  // transfer ownership to new admin
  await upgrades.admin.transferProxyAdminOwnership(env.default.proxyAdmin)
  console.log("Transferred ProxyAdmin ownership to:", env.default.proxyAdmin);

  for (const [key, value] of Object.entries(deposits)) {
    tx = await VestingContract.connect(admin).deposit(key, { value: value })
    receipt = await tx.wait();
    console.log("Deposit funds to %s amount %s, tx hash %s", key, value, tx.hash)
  }


  tx = deployedContract.deployTransaction;
  const chainId = tx.chainId; // number
  console.log("chain id:", chainId);

  const chainName = ethereumConstants.default.chainNameByIdNumeric[deployedContract.deployTransaction.chainId.toString()];
  console.log("chain name:", chainName);

  const contractConstants = JSON.parse(fs.readFileSync(contractConstantsFilePath, 'utf8'));
  contractConstants.contracts[contractName + contractNameSuffix].address[chainName] = deployedContract.address;

  fs.writeFileSync(contractConstantsFilePath, JSON.stringify(contractConstants), (error) => {
    console.error(error);
  });

  // ===> log
  const logDirPath = 'logs';
  if (!fs.existsSync(logDirPath)) { // create log directory if not exists
    fs.mkdirSync(logDirPath);
  }
  const logFileLine = new Date().toLocaleString() + ' '
    + contractName + contractNameSuffix + ' '
    + chainName + ' (' + chainId + ') '
    + deployedContract.address + "\r\n";
  fs.appendFileSync( // Synchronously append data to a file, creating the file if it does not yet exist
    deploymentLogFilePath,
    logFileLine
  );

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
