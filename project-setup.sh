# ethers
npm install --save-dev ethers

# hardhat
npm install --save-dev hardhat @nomiclabs/hardhat-ethers @nomiclabs/hardhat-waffle @nomiclabs/hardhat-etherscan hardhat-dependency-compiler ethereum-waffle chai ts-node typescript @types/node @types/mocha @types/chai
npm install --save-dev @nomiclabs/hardhat-truffle5 @nomiclabs/hardhat-web3 web3
npm install --save-dev hardhat-gas-reporter

# TypeChain
npm install --force --save-dev typechain @typechain/hardhat @typechain/ethers-v5

# chai and mocha
npm install --save-dev chai mocha ts-node @types/chai @types/mocha

# OpenZeppelin
npm install --save-dev @openzeppelin/contracts @openzeppelin/test-helpers @openzeppelin/hardhat-upgrades @openzeppelin/contracts-upgradeable @nomiclabs/hardhat-ethers ethers

# web3-react
npm install --save-dev @web3-react/core @web3-react/injected-connector

# font-awesome
npm install --save-dev @fortawesome/fontawesome-svg-core@next @fortawesome/free-solid-svg-icons@next @fortawesome/free-regular-svg-icons@next @fortawesome/react-fontawesome@latest

# semantic-ui
npm install --save-dev @csstools/normalize.css
#npm install --save-dev semantic-ui-react semantic-ui-css
# see: https://medium.com/@fomantic/setting-up-fomantic-ui-with-react-f701b68f736c
#npm install --ignore-scripts fomantic-ui --save-dev
# see: https://github.com/Semantic-Org/Semantic-UI-React/issues/4227#issuecomment-996152895
npm install --ignore-scripts fomantic-ui@nightly --save-dev
npm install --save-dev semantic-ui-react

# install ether-gui
npm install --save-dev ether-gui

# solidity-docgen
# see:
# https://github.com/OpenZeppelin/solidity-docgen/issues/350
# https://github.com/OpenZeppelin/solidity-docgen/tree/rewrite
# use:
# npx hardhat docgen && mv ./docs/index.md ./src/docs/
# https://github.com/OpenZeppelin/solidity-docgen
npm install -save-dev solidity-docgen@next

# react-markdown
# https://github.com/remarkjs/react-markdown
# how to import .md files: https://stackoverflow.com/a/65483206/1697878
npm install --save-dev react-markdown remark-gfm
