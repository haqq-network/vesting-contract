# HAQQ Vesting SC

Code of smart contracts, utility scripts, and smart contract's frontend for testing is stored in a
private repo on GitLab.

## Deployment

Smart contract can be deployed as:

1) regular smart contract
2) upgradeable smart contract (using OpenZeppelin implementation)

To deploy as a regular smart contract run in the project's root directory:

```shell
npx hardhat clean && npx hardhat run ./hardhat-scripts/deploy.js --network ropsten 
```

where last argument is a chain/network name, you can change it to ```kovan```, ```rinkeby``` or ```haqqtestnet```

Deployment script wil write address of the deployed smart contract to log: ```logs/contracts_deployment.log```
and also writes it to ```src/constants/contractsConstants.json``` for using on frontend.

Script also verifies smart contract code on Etherscan
(if you see an error, telling that contract was already verified, it's not a real error, it's OK)

To deploy as upgradeable smart contract run:

```shell
npx hardhat clean && npx hardhat run ./hardhat-scripts/deployUpgradeable.js --network ropsten 
```

It will create a 'proxy' smart contract, where under the hood works the same smart contract. Proxy can be upgraded
later, so we can have another smart contract under the hood, using the same proxy on the same address on the blockchain.

Address of the contract working behind the proxy we can find in the event ( ```Upgraded``` ) that was emitted when proxy
contract was deployed or upgraded, for example using ```Logs``` tab on transaction data page on Etherscan.

You can view interface and functions using following links (all links below using default PORT=3000):
- [Contract Upgradeable (Proxy)](http://localhost:3000/proxyContract) 
- [Direct Contract](http://localhost:3000/directContract)
to interact with smart contracts.

Documentation also available at [Contract Docs](http://localhost:3000/directContractDocs)

For the regular (not upgradeable) smart contract you can also use interface provided by Etherscan.

For now smart contract (regular and upgradable) were deployed on Ropsten. Code of smart contracts are available on
Etherscan, full code of smart contracts, scripts and frontend is stored in the private repo on GitLab. For testing each
deposit can be repaid in **5** payments, each of them is unblocked after **3** minutes starting from the deposit
timestamp
(values should be changed manually in smart contract before deployment in production)

## Upgrade contract

To upgrade a contract, you have to modify file ```hardhat-scripts/upgradeContract.js```
Let's say, we have new contract HaqqVestingV2.sol, which is the upgraded version of contract
working on the address ```0x45b5171FD9d4B1E223912E4A5E9479f5A7b93Ffa```

```js
const proxyContractAddress = '0x45b5171FD9d4B1E223912E4A5E9479f5A7b93Ffa';
const upgrade = 'HaqqVestingV2'; // name of the new contract 
```

and run:

```shell
npx hardhat run ./hardhat-scripts/upgradeContract.js --network rinkeby 
```

where the last argument should be network name.


Run docker image with env config `PRIVATE_KEY`, `PROXY_ADDRESS`, `WITHDRAW_LIMIT`
```docker
docker run -e "PRIVATE_KEY=bar PROXY_ADDRESS=foo WITHDRAW_LIMIT=1" deposits
```
