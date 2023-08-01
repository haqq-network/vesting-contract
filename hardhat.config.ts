import { HardhatUserConfig } from 'hardhat/types';
import { task } from 'hardhat/config';
import '@typechain/hardhat';
import '@nomiclabs/hardhat-ethers';
import '@nomiclabs/hardhat-waffle';
import '@nomiclabs/hardhat-truffle5';
import '@openzeppelin/hardhat-upgrades';
import "@nomiclabs/hardhat-etherscan";
import 'solidity-docgen';
import "hardhat-gas-reporter";
require('dotenv').config()

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task('accounts', 'Prints the list of accounts', async (args, hre) => {
  const accounts = await hre.ethers.getSigners();
  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

const config: HardhatUserConfig = { // << https://github.com/dethcrypto/TypeChain/issues/420
  solidity: {
    version: "0.8.12",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      },
    },
  },
  networks: {
    hardhat: {},
    loc: {
      url: "http://127.0.0.1:8545/",
    },
    haqqtestnet: {
      url: 'https://rpc.eth.testedge2.haqq.network/',
      accounts: ['0x' + process.env.PRIVATE_KEY],
    },
    haqqmainnet: {
      url: 'https://rpc.eth.haqq.network',
      accounts: ['0x' + process.env.PRIVATE_KEY],
    }
  },
  // https://hardhat.org/config/#path-configuration
  paths: {
    artifacts: './src/artifacts',   // < for React
    sources: './src/contracts',
    tests: './test',                // default
    cache: './cache',               // default
  },
  // https://github.com/dethcrypto/TypeChain/tree/master/packages/hardhat
  typechain: {
    outDir: './src/artifacts/typechain',
    target: 'ethers-v5',
    alwaysGenerateOverloads: false, // should overloads with full signatures like deposit(uint256) be generated always, even if there are no overloads?
    // externalArtifacts: ['externalArtifacts/*.json'], // optional array of glob patterns with external artifacts to process (for example external libs from node_modules)
  },
  mocha: {
    timeout: 5 * 5 * 1000
  }
  // npx hardhat docgen
  // docgen: {
  //     output: './src/docs',
  // }
};

export default config;
