#!/bin/bash

#npx hardhat compile
npx hardhat docgen && mv ./docs/index.md ./src/docs/

npx hardhat clean && npx hardhat run ./hardhat-scripts/deploy.js --network rinkeby
npx hardhat clean && npx hardhat run ./hardhat-scripts/deployUpgradeable.js --network rinkeby

#npx hardhat clean && npx hardhat run ./hardhat-scripts/deploy.js --network ropsten
#npx hardhat clean && npx hardhat run ./hardhat-scripts/deployUpgradeable.js --network ropsten
